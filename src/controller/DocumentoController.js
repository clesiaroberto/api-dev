import knex from "../database";
import { handleResponse } from "../utils/handleResponse";
import { createCambioUmParaUm } from "./cambioController";
import { userCanAccess } from "../middleware/userCanAccess";
import moment from "moment";
import { log } from "../utils/log";
import { formatCurrency } from "../helper/FormatCurrency";

const permissionGroup = "Documentos";
const tableName = "documento";

export const all = async (req, res) => {
    const { userId } = req.user;

    if (!(await userCanAccess(permissionGroup, "Mostrar Documento", userId))) {
        const message = "Sem permissão para visualizar os documentos.";
        return handleResponse(req, res, 403, [], message);
    }
    // #swagger.tags = ['Documento']
    // #swagger.description = 'Endpoint para listar documentos'
    const response = [];
    const { empresa } = req.user;
    const { categoria = 0, tipo_doc = "" } = req.query;
    let documentos = [];
    const tipoDoc = await knex("tipo_doc")
        .select("id")
        .where({ categoria, id: tipo_doc, empresa })
        .first();

    if (categoria != 0 && tipoDoc == undefined) {
        const message = "Tipo de documento não encontrado.";
        return handleResponse(req, res, 404, [], message);
    }
    if (categoria == 0 && tipoDoc == undefined) {
        documentos = await knex(tableName)
            .where({ empresa, removido: false })
            .orderBy("data_added", "DESC");
    } else {
        documentos = await knex(tableName)
            .where({ empresa, removido: false, tipo_doc: tipoDoc.id })
            .orderBy("data_added", "DESC");
    }

    for (let i = 0; i < documentos.length; i++) {
        let total = 0;
        const documentoItems = await knex("documento_item").where({
            documento: documentos[i].id,
        });
        let docExists = await knex("recibo_item")
            .where({ documento: documentos[i].id })
            .first();

        if (!docExists) {
            docExists = await knex("pagamento_fornecedor_item")
                .where({ documento: documentos[i].id })
                .first();
        }
        const moedaPadrao = await knex("moeda")
            .select(["codigo"])
            .where({ id: documentos[i].moeda_padrao })
            .first();

        documentoItems.map(async (item) => {
            const taxa = await knex("taxa")
                .select(["id", "valor"])
                .where({ id: item.taxa })
                .first();

            total +=
                item.preco * item.quantidade +
                (item.preco * item.quantidade * taxa.valor) / 100 +
                (item.preco * item.quantidade * item.desconto) / 100;
        });

        response.push({
            ...documentos[i],
            docExists,
            armazem_destino: await knex("armazem")
                .select([
                    "id",
                    "nome",
                    "descricao",
                    "endereco",
                    "contacto1",
                    "contacto2",
                ])
                .where({ id: documentos[i].armazem_destino })
                .first(),
            numero: numeroDocFormat(documentos[i]),
            tipo_doc: await knex("tipo_doc")
                .select(["id", "nome", "prefixo", "categoria", "descricao"])
                .where({ id: documentos[i].tipo_doc })
                .first(),
            cliente: await knex("cliente")
                .select([
                    "id",
                    "nome",
                    "email",
                    "contacto1",
                    "nuit",
                    "endereco",
                ])
                .where({ id: documentos[i].cliente })
                .first(),
            fornecedor: await knex("fornecedor")
                .select([
                    "id",
                    "nome",
                    "email",
                    "contacto1",
                    "contacto2",
                    "endereco",
                    "nuit",
                ])
                .where({ id: documentos[i].fornecedor })
                .first(),
            entidade: await knex("entidade")
                .select([
                    "id",
                    "nome",
                    "email",
                    "contacto1",
                    "contacto2",
                    "endereco",
                    "nuit",
                ])
                .where({ id: documentos[i].entidade })
                .first(),
            documentoItems,
            data_emissao: moment(documentos[i].data_emissao).format(
                "DD-MM-yyyy"
            ),
            total: formatCurrency(total) + " " + moedaPadrao.codigo,
        });
    }
    return handleResponse(req, res, 200, response);
};

export const create = async (req, res) => {
    const { userId } = req.user;

    if (!(await userCanAccess(permissionGroup, "Criar Documento", userId))) {
        const message = "Sem permissão para criar documento.";
        return handleResponse(req, res, 403, [], message);
    }
    // #swagger.tags = ['Documento']
    // #swagger.description = 'Endpoint para criar documentos'
    const data = dadosValidos(req);
    const { documentoItems = [] } = req.body;

    const tipoDoc = await knex("tipo_doc")
        .where({ id: data.tipo_doc, removido: false, empresa: data.empresa })
        .first();

    if (!tipoDoc) {
        const message = "Tipo de documento não encontrado.";
        return handleResponse(req, res, 404, [], message);
    }

    const tipoDocConfig = await knex("tipo_doc_config")
        .where({
            id: tipoDoc.tipo_doc_config,
        })
        .first();

    let cambio = await knex("cambio")
        .where({
            id: data.cambio,
            empresa: data.empresa,
            removido: false,
        })
        .first();

    if (!cambio) {
        const [created] = await createCambioUmParaUm(data);
        cambio = await knex("cambio")
            .where({
                id: created,
            })
            .first();
    }

    try {
        let numeroDoc = 1;
        const lastDocInserted = await knex(tableName)
            .where({ tipo_doc: data.tipo_doc })
            .orderBy("data_added", "DESC")
            .first();
        if (lastDocInserted) {
            numeroDoc =
                lastDocInserted.numero != null ? lastDocInserted.numero + 1 : 1;
        }
        const [documentoCreatedConfig] = await knex("documento_config").insert({
            move_stock: tipoDocConfig.move_stock,
            move_conta_corrente: tipoDocConfig.move_conta_corrente,
            move_a_credito: tipoDocConfig.move_a_credito,
            requer_recibo: tipoDocConfig.requer_recibo,
            transfere_stock: tipoDocConfig.transfere_stock,
            move_stock_entrada: tipoDocConfig.move_stock_entrada,
            referencia_documento: tipoDocConfig.referencia_documento,
            usuario_added: data.usuario_added,
            usuario_updated: data.usuario_updated,
        });

        const [documentoCreated] = await knex(tableName).insert({
            tipo_doc: data.tipo_doc,
            cliente: data.cliente,
            fornecedor: data.fornecedor,
            documento_referente: data.documento_referente,
            entidade: data.entidade,
            cambio: cambio.id,
            nr_requisicao: data.nr_requisicao,
            numero: numeroDoc,
            nota: data.nota,
            documento_config: documentoCreatedConfig,
            prefixo: tipoDoc.prefixo,
            desconto: data.desconto,
            data_emissao: data.data_emissao,
            data_vencimento: data.data_vencimento,
            armazem_destino: data.armazem_destino,
            conta_bancaria: data.conta_bancaria,
            nome: tipoDoc.nome,
            moeda_padrao: cambio.moeda_padrao,
            moeda_conversao: cambio.moeda_conversao,
            empresa: data.empresa,
            usuario_added: data.usuario_added,
            usuario_updated: data.usuario_updated,
        });

        const defaultTaxa = await knex("taxa")
            .where({ empresa: data.empresa })
            .first();

        documentoItems.map(async (documentItem) => {
            let taxa = { id: undefined };
            typeof documentItem.taxa == "object"
                ? (taxa = await knex("taxa")
                      .where({ id: documentItem.taxa.id })
                      .first())
                : (taxa = await knex("taxa")
                      .where({ id: documentItem.taxa })
                      .first());

            let docTaxa = defaultTaxa.id == undefined ? 1 : defaultTaxa.id;
            if (taxa.id != undefined) docTaxa = taxa.id;

            try {
                await knex("documento_item").insert({
                    stock:
                        Number(documentItem.stock) > 0
                            ? documentItem.stock
                            : null,
                    documento: documentoCreated,
                    referencia: documentItem.referencia,
                    descricao: documentItem.designacao,
                    quantidade: documentItem.quantidade,
                    preco: documentItem.preco,
                    taxa: docTaxa,
                    armazem: data.armazem,
                    taxa_inclusa: documentItem.taxa_inclusa,
                    desconto: documentItem.desconto,
                    desconto_percentual: documentItem.desconto_percentual,
                    usuario_added: data.usuario_added,
                    usuario_updated: data.usuario_updated,
                });
            } catch (error) {
                console.log(error);
            }
        });

        const documento = await knex(tableName)
            .where({ id: documentoCreated })
            .first();

        log({
            item_id: documentoCreated,
            descricao: "Adicionado documento " + numeroDocFormat(documento),
            tipo: 1,
            tabela: tableName,
            empresa: req.user.empresa,
            usuario_added: userId,
            usuario_updated: userId,
        });

        return handleResponse(req, res, 200, { id: documentoCreated });
    } catch (error) {
        return handleResponse(req, res, 500, error);
    }
};

export const findById = async (req, res) => {
    const { userId } = req.user;

    if (
        !(await userCanAccess(permissionGroup, "Detalhes do Documento", userId))
    ) {
        const message = "Sem permissão para visualizar o documento.";
        return handleResponse(req, res, 403, [], message);
    }

    // #swagger.tags = ['Documento']
    // #swagger.description = 'Endpoint para listar documentos por Id'
    const { id } = req.params;
    const documento = await knex(tableName)
        .where({ id, empresa: req.user.empresa, removido: false })
        .first();

    if (!documento) {
        const message = `Documento não encontrado.`;
        return handleResponse(req, res, 404, [], message);
    }

    try {
        const documentItems = await knex("documento_item")
            .select(["*", knex.raw("ROUND(preco, 2) as preco")])
            .where({
                documento: documento.id,
            });

        const documentoItemResponse = [];
        for (let i = 0; i < documentItems.length; i++) {
            documentoItemResponse.push({
                ...documentItems[i],
                taxa: await knex("taxa")
                    .select(["id", "nome", "valor", "percentual"])
                    .where({ id: documentItems[i].taxa })
                    .first(),
            });
        }

        let documentoRef = "";
        documento.documento_referente &&
            (documentoRef = numeroDocFormat(
                await knex("documento")
                    .where({ id: documento.documento_referente })
                    .first()
            ));
        let armazem = undefined;
        documentItems[0] &&
            (armazem = await knex("armazem")
                .select([
                    "id",
                    "nome",
                    "descricao",
                    "endereco",
                    "contacto1",
                    "contacto2",
                ])
                .where({ id: documentItems[0] && documentItems[0].armazem })
                .first());
        const response = {
            ...documento,
            numero: numeroDocFormat(documento),
            documento_referente: documentoRef,
            documentoItems: documentoItemResponse,
            armazem_destino: await knex("armazem")
                .select([
                    "id",
                    "nome",
                    "descricao",
                    "endereco",
                    "contacto1",
                    "contacto2",
                ])
                .where({ id: documento.armazem_destino })
                .first(),
            armazem,
            tipo_doc: await knex("tipo_doc")
                .select(["id", "nome", "prefixo", "categoria", "descricao"])
                .where({ id: documento.tipo_doc })
                .first(),
            cliente: await knex("cliente")
                .select([
                    "id",
                    "nome",
                    "email",
                    "contacto1",
                    "nuit",
                    "endereco",
                ])
                .where({ id: documento.cliente })
                .first(),
            fornecedor: await knex("fornecedor")
                .select([
                    "id",
                    "nome",
                    "email",
                    "contacto1",
                    "contacto2",
                    "endereco",
                    "nuit",
                ])
                .where({ id: documento.fornecedor })
                .first(),
            entidade: await knex("entidade")
                .select([
                    "id",
                    "nome",
                    "email",
                    "contacto1",
                    "contacto2",
                    "endereco",
                    "nuit",
                ])
                .where({ id: documento.entidade })
                .first(),
            moeda_conversao: await knex("moeda")
                .select(["id", "nome", "codigo", "simbolo"])
                .where({
                    id: documento.moeda_conversao,
                })
                .first(),
            moeda_padrao: await knex("moeda")
                .select(["id", "nome", "codigo", "simbolo"])
                .where({
                    id: documento.moeda_padrao,
                })
                .first(),
            cambio: await knex("cambio")
                .select(["id", "data", "preco_compra", "preco_venda"])
                .where({
                    id: documento.cambio,
                })
                .first(),
            documento_config: await knex("documento_config")
                .where({ id: documento.documento_config })
                .first(),
        };
        return handleResponse(req, res, 200, response);
    } catch (error) {
        console.log(error);
        return handleResponse(req, res, 500, error);
    }
};

export const remove = async (req, res) => {
    const { userId } = req.user;

    if (!(await userCanAccess(permissionGroup, "Deletar Documento", userId))) {
        const message = "Sem permissão para deletar documento.";
        return handleResponse(req, res, 403, [], message);
    }
    // #swagger.tags = ['Documento']
    // #swagger.description = 'Endpoint para remover documentos'
    const { id } = req.params;
    const { empresa } = req.user;
    const documento = await knex(tableName).where({ id }).first();

    return knex(tableName)
        .update("removido", true)
        .where({ id, removido: false, empresa })
        .then((row) => {
            if (!row) {
                const message = `Registo não encontrado.`;
                return handleResponse(req, res, 404, [], message);
            }

            log({
                item_id: id,
                descricao: "Removido documento " + numeroDocFormat(documento),
                tipo: 3,
                tabela: tableName,
                empresa: req.user.empresa,
                usuario_added: userId,
                usuario_updated: userId,
            });

            return handleResponse(req, res, 200, [], `Removido com sucesso.`);
        })
        .catch((err) => handleResponse(req, res, 500, err));
};

export const update = async (req, res) => {
    const { userId } = req.user;

    if (!(await userCanAccess(permissionGroup, "Editar Documento", userId))) {
        const message = "Sem permissão para editar documentos.";
        return handleResponse(req, res, 403, [], message);
    }
    // #swagger.tags = ['Documento']
    // #swagger.description = 'Endpoint para actualizar documentos'
    const { id } = req.params;
    const data = dadosValidos(req);
    const { documentoItems = [] } = req.body;
    const documento = await knex(tableName).where({ id }).first();

    if (!documento) {
        const message = "Documento não encontrado.";
        return handleResponse(req, res, 404, [], message);
    }

    let cambio = await knex("cambio")
        .where({
            id: data.cambio,
            empresa: data.empresa,
            removido: false,
        })
        .first();

    if (!cambio) {
        const [created] = await createCambioUmParaUm(data);
        cambio = await knex("cambio")
            .where({
                id: created,
            })
            .first();
    }

    try {
        await knex(tableName)
            .update({
                cliente: data.cliente,
                fornecedor: data.fornecedor,
                documento_referente: data.documento_referente,
                entidade: data.entidade,
                cambio: cambio.id,
                nr_requisicao: data.nr_requisicao,
                nota: data.nota,
                desconto: data.desconto,
                data_emissao: data.data_emissao,
                data_vencimento: data.data_vencimento,
                armazem_destino: data.armazem_destino,
                moeda_padrao: cambio.moeda_padrao,
                moeda_conversao: cambio.moeda_conversao,
                empresa: data.empresa,
                usuario_updated: data.usuario_updated,
            })
            .where({ id });

        await knex("documento_item").where({ documento: id }).del();

        const defaultTaxa = await knex("taxa")
            .where({ empresa: data.empresa })
            .first();

        documentoItems.map(async (documentItem) => {
            let taxa = { id: undefined };
            typeof documentItem.taxa == "object"
                ? (taxa = await knex("taxa")
                      .where({ id: documentItem.taxa.id })
                      .first())
                : (taxa = await knex("taxa")
                      .where({ id: documentItem.taxa })
                      .first());

            let docTaxa = defaultTaxa.id == undefined ? 1 : defaultTaxa.id;
            if (taxa.id != undefined) docTaxa = taxa.id;

            try {
                await knex("documento_item").insert({
                    stock:
                        Number(documentItem.stock) > 0
                            ? documentItem.stock
                            : null,
                    documento: id,
                    referencia: documentItem.referencia,
                    descricao: documentItem.designacao,
                    quantidade: documentItem.quantidade,
                    preco: documentItem.preco,
                    taxa: docTaxa,
                    armazem: data.armazem,
                    taxa_inclusa: documentItem.taxa_inclusa,
                    desconto: documentItem.desconto,
                    desconto_percentual: documentItem.desconto_percentual,
                    usuario_updated: data.usuario_updated,
                    usuario_added: data.usuario_added,
                });
            } catch (error) {
                console.log(error);
            }
        });

        log({
            item_id: id,
            descricao: "Actualizado documento " + numeroDocFormat(documento),
            tipo: 2,
            tabela: tableName,
            empresa: req.user.empresa,
            usuario_added: userId,
            usuario_updated: userId,
        });

        return handleResponse(req, res, 200, {}, "Atualizado com sucesso.");
    } catch (error) {
        console.log(error);
        return handleResponse(req, res, 500, error);
    }
};

export const updateDocumentConfig = async (req, res) => {
    const {
        move_stock,
        move_conta_corrente,
        move_a_credito,
        requer_recibo,
        transfere_stock,
        move_stock_entrada,
        referencia_documento,
    } = req.body;
    const { empresa, userId } = req.user;
    const { id } = req.params;

    if (!(await userCanAccess(permissionGroup, "Editar Documento", userId))) {
        const message = "Sem permissão para editar configuração de documento.";
        return handleResponse(req, res, 403, [], message);
    }
    const documento = await knex("documento")
        .select(["id", "documento_config"])
        .where({ id, empresa })
        .first();

    if (!documento) {
        const message = "Documento não encontrado";
        return handleResponse(req, res, 404, [], message);
    }

    try {
        await knex("documento_config")
            .update({
                move_stock,
                move_conta_corrente,
                move_a_credito,
                requer_recibo,
                transfere_stock,
                move_stock_entrada,
                referencia_documento,
                usuario_updated: userId,
            })
            .where({ id: documento.documento_config });

        const message = "Configurações atualizadas com sucesso.";
        return handleResponse(req, res, 200, {}, message);
    } catch (error) {
        return handleResponse(req, res, 500);
    }
};

export const getLastInsertedDocNumber = async (req, res) => {
    // #swagger.tags = ['Documento']
    // #swagger.description = 'Endpoint para listar ultimo documento Inserido'
    const { tipo_doc } = req.params;
    let numeroDoc = 1;
    const tipoDoc = await knex("tipo_doc")
        .where({ id: tipo_doc, removido: false, empresa: req.user.empresa })
        .first();
    if (!tipoDoc) {
        const message = "Tipo de documento não encontrado";
        return handleResponse(req, res, 404, [], message);
    }
    const lastDocInserted = await knex(tableName)
        .where({ tipo_doc })
        .orderBy("data_added", "DESC")
        .first();

    if (lastDocInserted) {
        numeroDoc =
            lastDocInserted.numero != null ? lastDocInserted.numero + 1 : 1;
        return handleResponse(req, res, 200, {
            numero: `${lastDocInserted.prefixo}-${("0000" + numeroDoc).slice(
                -4
            )}/${new Date(lastDocInserted.data_added).getFullYear()}`,
        });
    } else {
        return handleResponse(req, res, 200, {
            numero: `${tipoDoc.prefixo}-${("0000" + 1).slice(
                -4
            )}/${new Date().getFullYear()}`,
        });
    }
};

export const documentoRegularizar = async (req, res) => {
    const { empresa } = req.user;
    const { cliente } = req.params;
    const { userId } = req.user;

    if (
        !(await userCanAccess(permissionGroup, "Detalhes do Documento", userId))
    ) {
        const message = "Sem permissão para visualizar o documento.";
        return handleResponse(req, res, 403, [], message);
    }

    if (!(await knex("cliente").where({ id: cliente, empresa }).first())) {
        const message = "Cliente não encontrado";
        return handleResponse(req, res, 400, [], message);
    }
    try {
        const documentoCcVenda = await knex("pendente_cliente").where({
            cliente,
        });

        return handleResponse(req, res, 200, documentoCcVenda);
    } catch (error) {
        return handleResponse(req, res, 500, error);
    }
};

export const cancelarDocumento = async (req, res) => {
    const { empresa, userId } = req.user;
    const { id } = req.params;

    if (!(await userCanAccess(permissionGroup, "Cancelar Documento", userId))) {
        const message = "Sem permissão para cancelar o documento.";
        return handleResponse(req, res, 403, [], message);
    }
    try {
        const documento = await knex("documento")
            .where({ empresa, id })
            .first();
        if (!documento) {
            const message = "Documento não encontrado.";
            return handleResponse(req, res, 404, [], message);
        }

        if (documento.cancelado) {
            const message = "O documento já foi cancelado.";
            return handleResponse(req, res, 400, [], message);
        }

        await knex("documento")
            .update({ cancelado: true, usuario_updated: userId })
            .where({ id });

        const message = "Documento cancelado com sucesso.";
        return handleResponse(req, res, 200, [], message);
    } catch (error) {
        return handleResponse(req, res, 500, error);
    }
};

//Documentos por regularizar para fornecedores
export const documentoRegularizarPagamento = async (req, res) => {
    const { empresa } = req.user;
    const { fornecedor } = req.params;
    const { userId } = req.user;

    if (
        !(await userCanAccess(permissionGroup, "Detalhes do Documento", userId))
    ) {
        const message = "Sem permissão para visualizar o documento.";
        return handleResponse(req, res, 403, [], message);
    }
    if (
        !(await knex("fornecedor").where({ id: fornecedor, empresa }).first())
    ) {
        const message = "Fornecedor não encontrado";
        return handleResponse(req, res, 400, [], message);
    }
    try {
        const documentoCcVenda = await knex("pendente_fornecedor").where({
            fornecedor,
        });

        return handleResponse(req, res, 200, documentoCcVenda);
    } catch (error) {
        return handleResponse(req, res, 500, error);
    }
};

export const documentoImpressaoEstado = async (req, res) => {
    const { userId } = req.user;

    if (
        !(await userCanAccess(permissionGroup, "Detalhes do Documento", userId))
    ) {
        const message = "Sem permissão para visualizar o documento.";
        return handleResponse(req, res, 403, [], message);
    }

    // #swagger.tags = ['Documento']
    // #swagger.description = 'Endpoint para listar documentos por Id'
    const { id } = req.params;
    const documento = await knex(tableName)
        .select(["id", "original", "segunda_via"])
        .where({ id, empresa: req.user.empresa, removido: false })
        .first();

    if (!documento) {
        const message = `Documento não encontrado.`;
        return handleResponse(req, res, 404, [], message);
    }

    return handleResponse(req, res, 200, documento);
};

const dadosValidos = (req) => {
    const usuario_added = req.userId;
    const usuario_updated = req.userId;
    const { empresa } = req.user;

    const {
        tipo_doc,
        cliente,
        fornecedor,
        entidade,
        cambio,
        nr_requisicao,
        conta_bancaria,
        desconto = 0,
        nota,
        doc_config,
        moeda_padrao,
        armazem,
        armazem_destino,
        documento_referente,
        data_emissao,
        data_vencimento,
    } = req.body;
    let data = new Date();
    let dataVencimento = data;
    try {
        data = data_emissao
            ? moment(data_emissao).format("Y-M-DD")
            : new Date();
        dataVencimento = data_vencimento
            ? moment(data_vencimento).format("Y-M-DD")
            : new Date();
    } catch (error) {}

    return {
        nr_requisicao,
        nota,
        tipo_doc,
        cliente: cliente == "" ? null : cliente,
        fornecedor: fornecedor == "" ? null : fornecedor,
        entidade: entidade == "" ? null : entidade,
        documento_referente:
            documento_referente == "" ? null : documento_referente,
        cambio,
        doc_config,
        armazem_destino: armazem_destino == "" ? null : armazem_destino,
        armazem: armazem == "" ? null : armazem,
        moeda_padrao,
        data_emissao: data,
        data_vencimento: dataVencimento,
        conta_bancaria: conta_bancaria == "" ? null : conta_bancaria,
        empresa,
        desconto,
        usuario_added,
        usuario_updated,
    };
};

export const numeroDocFormat = (documento) => {
    return `${documento.prefixo}-${("0000" + documento.numero).slice(
        -4
    )}/${new Date(documento.data_added).getFullYear()}`;
};

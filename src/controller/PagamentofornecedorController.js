import knex from "../database";
import { handleResponse } from "../utils/handleResponse";
import { numeroDocFormat as AdiantamentoFornecedorNumeroDocFormat } from "./reciboAdFornecedorController";
import { numeroDocFormat as DocumentoNumeroDocFormat } from "./DocumentoController";
import { userCanAccess } from "../middleware/userCanAccess";
import { log } from "../utils/log";
import moment from "moment";
import { formatCurrency } from "../helper/FormatCurrency";

const permissionGroup = "Pagamento ao Fornecedor";
const tableName = "pagamento_fornecedor";

export const all = async (req, res) => {
    const { userId } = req.user;

    if (!(await userCanAccess(permissionGroup, "Mostrar pagamento", userId))) {
        const message = "Sem permissão para visualizar os pagamentos.";
        return handleResponse(req, res, 403, [], message);
    }

    // #swagger.tags = ['Pagamento Fornecedor']
    // #swagger.description = 'Endpoint para listar Pagamento Fornecedor'

    const { empresa } = req.user;
    const fornecedorP = await knex(tableName).where({
        removido: false,
        empresa,
    });

    const response = [];
    const empresaAssociada = await knex("empresa")
        .where({ id: empresa })
        .first();
    const moeda = await knex("moeda")
        .where({ id: empresaAssociada.moeda_padrao })
        .first();

    for (let i = 0; i < fornecedorP.length; i++) {
        let total = 0;
        const pagamentoItems = await knex("pagamento_fornecedor_item").where({
            pagamento_fornecedor: fornecedorP[i].id,
        });

        pagamentoItems.map((item) => (total += item.valor));

        response.push({
            ...fornecedorP[i],
            referencia: numeroDocFormat(fornecedorP[i]),
            total,
            total_formatado: formatCurrency(total) + " " + moeda.codigo,
        });
    }

    return handleResponse(req, res, 200, response);
};

export const create = async (req, res) => {
    const { userId } = req.user;

    if (!(await userCanAccess(permissionGroup, "Criar pagamento", userId))) {
        const message = "Sem permissão para criar os pagamentos.";
        return handleResponse(req, res, 403, [], message);
    }
    // #swagger.tags = ['Pagamento Fornecedor']
    // #swagger.description = 'Endpoint para criar Pagamento Fornecedor'
    const data = dadosValidos(req);
    const { pagamentoItems = [] } = req.body;
    const { metodoPagamentoItems = [] } = req.body;

    if (
        !(await knex("fornecedor")
            .where({
                id: data.fornecedor,
                empresa: data.empresa,
                removido: false,
            })
            .first())
    ) {
        return handleResponse(req, res, 409, [], "Fornecedor não registado");
    }

    if (
        !(await knex("metodo_pagamento")
            .where({
                id: data.metodo_pagamento,
                removido: false,
            })
            .first())
    ) {
        const message = "Método de pagamento não encontrado";
        return handleResponse(req, res, 409, [], message);
    }

    if (
        !(await knex("conta_bancaria")
            .where({
                id: data.conta_bancaria,
                empresa: data.empresa,
                removido: false,
            })
            .first())
    ) {
        const message = "Conta Bancária não encontrada";
        return handleResponse(req, res, 409, [], message);
    }

    if (pagamentoItems.length == 0) {
        const message = "Nenhum item selecionado.";
        return handleResponse(req, res, 400, [], message);
    }

    const check_number = await knex(tableName).orderBy("id", "desc").first();
    let num = 1;

    if (typeof check_number == "undefined") {
        num = 1;
    } else {
        if (
            new Date(check_number.data_added).getFullYear() ==
            new Date().getFullYear()
        ) {
            num = check_number.numero + 1;
        } else {
            num = 1;
        }
    }

    try {
        const [created] = await knex(tableName).insert({
            numero: num,
            fornecedor: data.fornecedor,
            conta_bancaria: data.conta_bancaria,
            metodo_pagamento: data.metodo_pagamento,
            nome_banco: data.nome_banco,
            numero_cheque: data.numero_cheque,
            codigo_movimento: data.codigo_movimento,
            data_emissao: data.data_emissao,
            empresa: data.empresa,
            usuario_added: data.usuario_added,
            usuario_updated: data.usuario_updated,
        });

        metodoPagamentoItems.map(async (item) => {
            await knex("metodo_pagamento_fornecedor").insert({
                pagamento_fornecedor: created,
                metodo_pagamento: item.metodo_pagamento,
                conta_bancaria: item.conta_bancaria,
                nome_banco: item.nome_banco,
                codigo_movimento: item.codigo_movimento,
                valor: item.valor,
                usuario_added: data.usuario_added,
                usuario_updated: data.usuario_updated,
            });
        });

        console.log(pagamentoItems);
        pagamentoItems.map(async (item) => {
            item.adiantamento_fornecedor =
                item.adiantamento_fornecedor === undefined
                    ? null
                    : item.adiantamento_fornecedor;

            item.documento =
                item.documento === undefined ? null : item.documento;

            const documento = await knex("documento")
                .where({
                    id: item.documento,
                    // empresa: data.empresa,
                })
                .first();

            const adFornecedor = await knex("adiantamento_fornecedor")
                .where({
                    id: item.adiantamento_fornecedor,
                    // empresa: data.empresa,
                })
                .first();

            if (adFornecedor) {
                await knex("pagamento_fornecedor_item").insert({
                    pagamento_fornecedor: created,
                    valor: item.valor,
                    adiantamento_fornecedor: item.adiantamento_fornecedor,
                    documento: null,
                    usuario_added: data.usuario_added,
                    usuario_updated: data.usuario_updated,
                });
            }

            if (documento) {
                await knex("pagamento_fornecedor_item").insert({
                    pagamento_fornecedor: created,
                    valor: item.valor,
                    adiantamento_fornecedor: null,
                    documento: item.documento,
                    usuario_added: data.usuario_added,
                    usuario_updated: data.usuario_updated,
                });
            }
        });

        const message = `Dados adicionados com sucesso`;

        const pag = await knex(tableName).where({ id: created }).first();

        log({
            item_id: created,
            descricao:
                "Adicionado pagamento ao fornecedor " + numeroDocFormat(pag),
            tipo: 1,
            tabela: tableName,
            empresa: req.user.empresa,
            usuario_added: userId,
            usuario_updated: userId,
        });

        return handleResponse(req, res, 200, [], message);
    } catch (error) {
        handleResponse(req, res, 500, error);
    }
};

export const findById = async (req, res) => {
    const { userId } = req.user;

    if (
        !(await userCanAccess(permissionGroup, "Detalhes do pagamento", userId))
    ) {
        const message = "Sem permissão para visualizar o pagamento.";
        return handleResponse(req, res, 403, [], message);
    }
    // #swagger.tags = ['Recibo']
    // #swagger.description = 'Endpoint para listar Recibo por Id'
    const { id } = req.params;
    const { empresa } = req.user;
    const metodoPagamentoFornecedores = [];

    const pagamento = await knex(tableName)
        .where({
            id,
            empresa,
            removido: false,
        })
        .first();

    if (!pagamento) {
        return handleResponse(req, res, 404, [], "Registo não encontrado.");
    }
    const pagamentoItems = await knex("pagamento_fornecedor_item").where({
        pagamento_fornecedor: pagamento.id,
    });
    const empresaAssociada = await knex("empresa")
        .where({ id: empresa })
        .first();
    const moeda = await knex("moeda")
        .where({ id: empresaAssociada.moeda_padrao })
        .first();

    const metodoPagamentoFornecedor = await knex(
        "metodo_pagamento_fornecedor"
    ).where({ pagamento_fornecedor: pagamento.id });

    for (let i = 0; i < metodoPagamentoFornecedor.length; i++) {
        metodoPagamentoFornecedores.push({
            ...metodoPagamentoFornecedor[i],
            metodo_pagamento: await knex("metodo_pagamento")
                .select(["id", "metodo"])
                .where({ id: metodoPagamentoFornecedor[i].metodo_pagamento }),

            conta_bancaria: await knex("conta_bancaria")
                .select(["id", "nome_banco"])
                .where({ id: metodoPagamentoFornecedor[i].conta_bancaria }),
            data_pagamento: moment(
                metodoPagamentoFornecedores.data_emissao
            ).format("DD-MM-yyyy"),
            valor_f:
                formatCurrency(metodoPagamentoFornecedor[i].valor) +
                " " +
                moeda.codigo,
        });
    }

    let total = 0;
    for (let i = 0; i < pagamentoItems.length; i++) {
        pagamentoItems[i].valor_f =
            formatCurrency(pagamentoItems[i].valor) + " " + moeda.codigo;
        if (pagamentoItems[i].documento) {
            total += pagamentoItems[i].valor;
            const documento = await knex("documento")
                .select([
                    "id",
                    "prefixo",
                    "numero",
                    "tipo_doc",
                    "cliente",
                    "data_emissao",
                    "data_added",
                ])
                .where({ id: pagamentoItems[i].documento })
                .first();
            if (documento) {
                pagamentoItems[i].documento = documento;
                pagamentoItems[i].documento.referencia =
                    DocumentoNumeroDocFormat(pagamentoItems[i].documento);
                pagamentoItems[i].documento.data_emissao = moment(
                    pagamentoItems[i].data_emissao
                ).format("DD-MM-yyyy");
            }
        } else {
            total -= pagamentoItems[i].valor;

            const adiantamentoFornecedor = await knex("adiantamento_fornecedor")
                .where({ id: pagamentoItems[i].adiantamento_fornecedor })
                .first();

            if (adiantamentoFornecedor) {
                pagamentoItems[i].adiantamento_fornecedor =
                    adiantamentoFornecedor;
                pagamentoItems[i].adiantamento_fornecedor.data_emissao = moment(
                    pagamentoItems[i].data_emissao
                ).format("DD-MM-yyyy");
                pagamentoItems[i].adiantamento_fornecedor.referencia =
                    AdiantamentoFornecedorNumeroDocFormat(
                        pagamentoItems[i].adiantamento_fornecedor
                    );
                pagamentoItems[i].adiantamento_fornecedor.total =
                    pagamentoItems[i].adiantamento_fornecedor.valor;
                pagamentoItems[i].adiantamento_fornecedor.total_formatado =
                    formatCurrency(
                        pagamentoItems[i].adiantamento_fornecedor.valor
                    );
            }
        }
    }
    return handleResponse(req, res, 200, {
        ...pagamento,
        referencia: numeroDocFormat(pagamento),
        pagamentoItems,
        metodoPagamentoFornecedores,
        data_emissao: moment(pagamentoItems.data_emissao).format("DD-MM-yyyy"),
        total,
        total_formatado: formatCurrency(total) + " " + moeda.codigo,
    });
};

export const findByFornecedor = async (req, res) => {
    const { userId } = req.user;

    if (!(await userCanAccess(permissionGroup, "Mostrar pagamento", userId))) {
        const message = "Sem permissão para visualizar os pagamentos.";
        return handleResponse(req, res, 403, [], message);
    }

    // #swagger.tags = ['Pagamento Fornecedor']
    // #swagger.description = 'Endpoint para listar Pagamento Fornecedor'

    const { empresa } = req.user;
    const { fornecedor } = req.params;
    const fornecedorP = await knex(tableName).where({
        fornecedor,
        removido: false,
        empresa,
    });

    const response = [];
    const empresaAssociada = await knex("empresa")
        .where({ id: empresa })
        .first();
    const moeda = await knex("moeda")
        .where({ id: empresaAssociada.moeda_padrao })
        .first();

    for (let i = 0; i < fornecedorP.length; i++) {
        let total = 0;
        const pagamentoItems = await knex("pagamento_fornecedor_item").where({
            pagamento_fornecedor: fornecedorP[i].id,
        });

        pagamentoItems.map((item) => (total += item.valor));

        response.push({
            ...fornecedorP[i],
            referencia: numeroDocFormat(fornecedorP[i]),
            total,
            total_formatado: formatCurrency(total) + " " + moeda.codigo,
        });
    }

    return handleResponse(req, res, 200, response);
};

export const update = async (req, res) => {
    const { userId } = req.user;

    if (!(await userCanAccess(permissionGroup, "Editar pagamento", userId))) {
        const message = "Sem permissão para editar o pagamento.";
        return handleResponse(req, res, 403, [], message);
    }
    // #swagger.tags = ['Recibo']
    // #swagger.description = 'Endpoint para actualizar Recibo'
    const { id } = req.params;
    const data = dadosValidos(req);
    data.usuario_added = undefined;
    const { documento, valor, adiantamento_fornecedor } = req.body;

    if (
        !(await knex("fornecedor")
            .where({
                id: data.fornecedor,
                empresa: data.empresa,
                removido: false,
            })
            .first())
    ) {
        return handleResponse(req, res, 409, [], "Fornecedor não encontrado");
    }

    if (
        !(await knex("metodo_pagamento")
            .where({
                id: data.metodo_pagamento,
                removido: false,
            })
            .first())
    ) {
        return handleResponse(
            req,
            res,
            409,
            [],
            "Método de pagamento não encontrado"
        );
    }

    if (
        !(await knex("conta_bancaria")
            .where({
                id: data.conta_bancaria,
                empresa: data.empresa,
                removido: false,
            })
            .first())
    ) {
        return handleResponse(
            req,
            res,
            409,
            [],
            "Conta Bancária não encontrada"
        );
    }
    if (
        !(await knex("documento")
            .where({
                id: documento,
                removido: false,
            })
            .first())
    ) {
        return handleResponse(req, res, 404, [], "Documento não encontrado");
    }

    // const knx = await knex(tableName)
    //     .where({ id: id, removido: false, empresa: data.empresa })
    //     .first();

    // if (!knx) {
    //     return handleResponse(req, res, 404, [], `Registo mao encontrado.`);
    // }
    const updated = knex(tableName)
        .update(data)
        .where({ id: id, removido: false, empresa: data.empresa })
        .then((row) => {
            if (!row) {
                return handleResponse(
                    req,
                    res,
                    404,
                    [],
                    `Registo nao encontrado.`
                );
            }
            const pagamento_item = knex("pagamento_fornecedor_item")
                .update({
                    documento,
                    valor,
                    adiantamento_fornecedor,
                })
                .where({ pagamento_fornecedor: id, removido: false });

            const message = "Atualizado com sucesso.";
            return handleResponse(req, res, 200, { id: id }, message);
        })
        .catch((err) => handleResponse(res, res, 500));
};

export const remove = async (req, res) => {
    const { userId } = req.user;

    if (!(await userCanAccess(permissionGroup, "Deletar pagamento", userId))) {
        const message = "Sem permissão para deletar o pagamento.";
        return handleResponse(req, res, 403, [], message);
    }
    const { id } = req.params;
    const { empresa } = req.user;

    const pag = await knex(tableName).where({ id }).first();

    knex(tableName)
        .update("removido", true)
        .where({ id, removido: false, empresa })
        .then((row) => {
            if (!row) {
                return handleResponse(
                    req,
                    res,
                    404,
                    [],
                    `Registo não encontrado.`
                );
            }
            // else {
            //     knex("pagamento_fornecedor_item")
            //         .update("removido", true)
            //         .where({
            //             pagamento_fornecedor: id,
            //             removido: false,
            //             empresa,
            //         });
            // }

            log({
                item_id: id,
                descricao:
                    "Removido pagamento ao fornecedor " + numeroDocFormat(pag),
                tipo: 3,
                tabela: tableName,
                empresa: req.user.empresa,
                usuario_added: userId,
                usuario_updated: userId,
            });

            return handleResponse(req, res, 200, [], `Removido com sucesso.`);
        })
        .catch((err) => handleResponse(req, res, 500));
};

const dadosValidos = (req) => {
    const usuario_added = req.userId;
    const usuario_updated = req.userId;
    const { empresa } = req.user;

    const {
        fornecedor,
        conta_bancaria,
        metodo_pagamento,
        nome_banco,
        numero_cheque,
        data_emissao,
        codigo_movimento,
    } = req.body;

    let data = new Date();
    try {
        data = data_emissao
            ? moment(data_emissao).format("Y-M-DD")
            : new Date();
    } catch (error) {}

    return {
        fornecedor,
        conta_bancaria,
        metodo_pagamento,
        nome_banco,
        numero_cheque,
        codigo_movimento,
        data_emissao: data,
        empresa,
        usuario_added,
        usuario_updated,
    };
};

export const getLastInsertedReferencia = async (req, res) => {
    const lastInserted = await knex(tableName)
        .where({ empresa: req.user.empresa })
        .orderBy("data_added", "DESC")
        .first();

    if (lastInserted) {
        return handleResponse(req, res, 200, {
            id: `RF-${("0000" + (Number(lastInserted.numero) + 1)).slice(
                -4
            )}/${new Date().getFullYear()}`,
        });
    } else {
        return handleResponse(req, res, 200, {
            id: `RF-${("0000" + 1).slice(-4)}/${new Date().getFullYear()}`,
        });
    }
};

export const numeroDocFormat = (fornecedorP) => {
    return `RF-${("0000" + fornecedorP.numero).slice(-4)}/${new Date(
        fornecedorP.data_added
    ).getFullYear()}`;
};

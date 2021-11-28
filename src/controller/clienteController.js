import knex from "../database";
import { handleResponse } from "../utils/handleResponse";
import XLSX from "xlsx";
import { userCanAccess } from "../middleware/userCanAccess";
import { log } from "../utils/log";
import moment from "moment";
import { formatCurrency } from "../helper/FormatCurrency";
import { update } from "./armazemController";

const permissionGroup = "Clientes";
const tableName = "cliente";

export const addCliente = async (req, res) => {
    const { userId } = req.user;

    if (!(await userCanAccess(permissionGroup, "Criar Cliente", userId))) {
        const message = "Sem permissão para criar clientes.";
        return handleResponse(req, res, 403, [], message);
    }
    // #swagger.tags = ['Cliente']
    // #swagger.description = 'Cadastro de clientes.'
    const data = dadosValidos(req);

    /* #swagger.parameters['Cliente'] = {
               in: 'body',
               description: 'Informações do cliente.',
               required: true,
               type: 'object',
               schema: { $ref: "#/definitions/Cliente" }
        } */

    /* #swagger.responses[409] = { 
               schema: { $ref: "#/definitions/emailNo" },
               description:'O cliente com email ${email} já está registado' 
        } */

    if (
        data.email != "" &&
        (await knex(tableName)
            .where({
                nome: data.nome,
                email: data.email,
                empresa: data.empresa,
                removido: false,
            })
            .first())
    ) {
        const message = `O cliente ${data.nome} com email ${data.email} já está registado`;
        return handleResponse(req, res, 409, [], message);
    }

    /* #swagger.responses[200] = { 
               schema: { $ref: "#/definitions/registerSuccess" },
               description:'Dados adicionados com sucesso' 
        } */

    knex(tableName)
        .insert(data)
        .then((id) => {
            log({
                item_id: id[0],
                descricao: "Adicionado cliente " + data.nome,
                tipo: 1,
                tabela: tableName,
                empresa: req.user.empresa,
                usuario_added: userId,
                usuario_updated: userId,
            });

            handleResponse(
                req,
                res,
                200,
                { id: id[0] },
                "Dados adicionados com sucesso"
            );
        })
        .catch((err) => handleResponse(res, res, 500, err));
};

export const updateCliente = async (req, res) => {
    // #swagger.tags = ['Cliente']
    // #swagger.description = 'Endpoint para actualizar dados dos Clientes.'
    const { id } = req.params;
    const { userId } = req.user;

    if (!(await userCanAccess(permissionGroup, "Editar Cliente", userId))) {
        const message = "Sem permissão para o editar clientes.";
        return handleResponse(req, res, 403, [], message);
    }
    const data = dadosValidos(req);
    data.usuario_added = undefined;

    /* #swagger.parameters['Cliente'] = {
               in: 'body',
               description: 'Informações do cliente.',
               required: true,
               type: 'object',
               schema: { $ref: "#/definitions/Cliente" }
        } */

    /* #swagger.responses[404] = { 
               schema: { $ref: "#/definitions/IdNo" },
               description:'Registo não encontrado.' 
        } */

    const [updated] = await knex(tableName)
        .update(data)
        .where({ id, removido: false, empresa: data.empresa })
        .then((row) => {
            if (!row) {
                const message = "Registo não encontrado.";
                return handleResponse(req, res, 404, [], message);
            }

            /* #swagger.responses[200] = { 
               schema: { $ref: "#/definitions/idUpdate" },
               description:'Atualizado com sucesso.' 
        } */
            const message = "Atualizado com sucesso.";

            log({
                item_id: id,
                descricao: "Actualizado cliente " + data.nome,
                tipo: 2,
                tabela: tableName,
                empresa: req.user.empresa,
                usuario_added: userId,
                usuario_updated: userId,
            });

            return handleResponse(req, res, 200, { id: id });
        })
        .catch((err) => handleResponse(res, res, 500));
};

export const getCliente = async (req, res) => {
    // #swagger.tags = ['Cliente']
    // #swagger.description = 'Endpoint para listar Clientes.'
    try {
        const { empresa } = req.user;
        const { userId } = req.user;

        if (
            !(await userCanAccess(permissionGroup, "Mostrar Cliente", userId))
        ) {
            const message = "Sem permissão para visualizar os clientes.";
            return handleResponse(req, res, 403, [], message);
        }
        const { activo } = req.query;
        const response = [];
        let clientes = await knex("cliente_saldo").where({
            empresa,
            removido: false,
        });

        if (activo) {
            clientes = await knex("cliente_saldo").where({
                empresa,
                removido: false,
                activo,
            });
        }

        const empresaUsuario = await knex("empresa")
            .where({ id: empresa })
            .first();
        const moeda = await knex("moeda")
            .where({
                id: empresaUsuario.moeda_padrao,
            })
            .first();

        for (let i = 0; i < clientes.length; i++) {
            const tipoCliente = await knex("cliente")
                .where({ id: clientes[i].id })
                .first();
            const docExists = await knex("documento")
                .select(["id"])
                .where({ cliente: clientes[i].id, removido: false })
                .first();
            response.push({
                ...clientes[i],
                tipo_cliente: tipoCliente.tipo_cliente,
                preco: tipoCliente.preco,
                taxa: tipoCliente.taxa,
                activo: tipoCliente.activo,
                saldo_formatado: clientes[i].saldo,
                saldo_formatado:
                    formatCurrency(clientes[i].saldo) + " " + moeda.codigo,
                docExists,
            });
        }

        return handleResponse(req, res, 200, { items: response });
    } catch (error) {
        console.log(error);
        return handleResponse(req, res, 500, error);
    }
};

export const getClienteExtratoID = async (req, res) => {
    // #swagger.tags = ['Cliente']
    // #swagger.description = 'Endpoint para listar Clientes.'
    const { empresa } = req.user;
    const { userId } = req.user;

    if (
        !(await userCanAccess(
            "Extratos dos Clientes",
            "Mostrar extrato",
            userId
        ))
    ) {
        const message = "Sem permissão para visualizar o extrato.";
        return handleResponse(req, res, 403, [], message);
    }

    const { cliente } = req.params;
    const extrato = await knex("extrato_cliente").where({ empresa, cliente });
    let extratos = [];
    let documento_nome = "";
    let data_vencimento = "-";

    for (let i = 0; i < extrato.length; i++) {
        try {
            if (extrato[i].recibo_id) {
                documento_nome = "Recibo";
            } else if (extrato[i].recibo_adiantamento_id) {
                documento_nome = "Recibo de Adiantamento";
            } else {
                const documento = await knex("documento")
                    .select(["nome", "data_vencimento"])
                    .where({
                        id: extrato[i].documento_id,
                    })
                    .first();
                data_vencimento = moment(documento.data_vencimento).format(
                    "DD-M-Y"
                );
                documento_nome = documento.nome;
            }
            extratos.push({
                ...extrato[i],
                data_emissao: moment(extrato[i].data_emissao).format("DD-M-Y"),
                documento_nome,
                data_vencimento,
            });
        } catch (error) {
            console.log(error);
        }
    }

    return handleResponse(req, res, 200, {
        items: extratos,
    });
};

export const excelCliente = async (req, res) => {
    // #swagger.tags = ['Cliente']
    // #swagger.description = 'Lista de clientes em Excel.'
    let header = [
        "Id",
        "Nome",
        "Email",
        "Contacto1",
        "Contacto2",
        "Nuit",
        "Endereço",
        "activo",
        "Empresa",
        "Nuel",
        "Plafond",
        "Taxa_insento",
        "Motivo",
        "Desconto_fixo",
        "Tipo_cliente",
        "Data",
    ];

    let data = [header];

    const { from = "", to = "" } = req.body;

    const clientes = await knex("cliente")
        .where({ removido: false })
        .whereBetween("data_added", [from, to]);

    for (let i = 0; i < clientes.length; i++) {
        const checkEmpresaId = await knex("empresa")
            .where({ id: clientes[i].empresa })
            .first();

        data.push([
            clientes[i].id,
            clientes[i].nome,
            clientes[i].email,
            clientes[i].contacto1,
            clientes[i].contacto2,
            clientes[i].nuit,
            clientes[i].nuel,
            clientes[i].plafond,
            clientes[i].taxa_isento == 1 ? "Sim" : "Não",
            clientes[i].motivo,
            clientes[i].desconto_fixo,
            clientes[i].endereco,
            clientes[i].activo,
            checkEmpresaId.nome,
            clientes[i].tipo_cliente,
            clientes[i].data_added,
        ]);
    }
    console.log(data);

    var ws = XLSX.utils.aoa_to_sheet(data);
    var wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "SheetJS");
    var buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    res.setHeader("Content-Type", "application/vnd.ms-excel");
    res.setHeader("content-disposition", "attachment; filename=export.xls");
    res.send(buf);
};

export const getClientebyId = async (req, res) => {
    // #swagger.tags = ['Cliente']
    // #swagger.description = 'Endpoint para listar Clientes em função do Id.'
    const { id } = req.params;
    const { empresa } = req.user;
    const { userId } = req.user;

    if (
        !(await userCanAccess(permissionGroup, "Detalhes do Cliente", userId))
    ) {
        const message = "Sem permissão para visualizar o cliente.";
        return handleResponse(req, res, 403, [], message);
    }

    const cliente = await knex("cliente_saldo")
        .where({ removido: false, empresa, id })
        .first();

    if (!cliente) {
        const message = "Registo não encontrado";
        return handleResponse(req, res, 404, [], message);
    }

    console.log(cliente);
    const tipoCliente = await knex("cliente").where({ id: cliente.id }).first();

    /* #swagger.responses[404] = { 
        schema: { $ref: "#/definitions/IdNo" },
        description:'Cliente não encontrado.' 
    } */

    /* #swagger.responses[200] = { 
        schema: { $ref: "#/definitions/Cliente" },
        description:'Listando Clientes' 
    } */

    const docExists = await knex("documento")
        .select(["id"])
        .where({ cliente: cliente.id, removido: false })
        .first();

    const empresaUsuario = await knex("empresa").where({ id: empresa }).first();
    const moeda = await knex("moeda")
        .where({
            id: empresaUsuario.moeda_padrao,
        })
        .first();

    return handleResponse(req, res, 200, {
        ...cliente,
        tipo_cliente: tipoCliente.tipo_cliente,
        preco: tipoCliente.preco,
        taxa: tipoCliente.taxa,
        activo: tipoCliente.activo,
        saldo: cliente.saldo,
        saldo_formatado: formatCurrency(cliente.saldo) + " " + moeda.codigo,
        docExists,
    });
};

export const deleteCliente = async (req, res) => {
    // #swagger.tags = ['Cliente']
    // #swagger.description = 'Endpoint para remover Clientes em função do Id.'
    const { id } = req.params;
    const { empresa } = req.user;
    const { userId } = req.user;

    if (!(await userCanAccess(permissionGroup, "Deletar Cliente", userId))) {
        const message = "Sem permissão para deletar cliente.";
        return handleResponse(req, res, 403, [], message);
    }

    /* #swagger.responses[404] = { 
               schema: { $ref: "#/definitions/IdNo" },
               description:'Removendo Clientes' 
        } */

    knex(tableName)
        .update("removido", true)
        .where({ id, removido: false, empresa })
        .then(async (row) => {
            if (!row) {
                const message = `Registo não encontrado.`;
                return handleResponse(req, res, 404, [], message);
            }
            /* #swagger.responses[200] = { 
               schema: { $ref: "#/definitions/idDelete" },
               description:'Removido com sucesso' 
            } */

            const updated = await knex(tableName)
                .where({ id, empresa })
                .first();

            log({
                item_id: id,
                descricao: "Removido cliente " + updated.nome,
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

const dadosValidos = (req) => {
    const usuario_added = req.userId;
    const usuario_updated = req.userId;
    const { empresa } = req.user;

    const {
        nome,
        email = "",
        contacto1 = "",
        contacto2 = "",
        tipo_cliente = null,
        nuit,
        endereco = "",
        activo = 1,
        nuel,
        preco,
        taxa_isento = 0,
        taxa,
        motivo,
        plafond,
        desconto_fixo = 0,
    } = req.body;

    return {
        nome,
        email,
        contacto1,
        contacto2,
        tipo_cliente: tipo_cliente == "" ? null : tipo_cliente,
        plafond: plafond == "" ? null : plafond,
        nuit: nuit == "" ? null : nuit,
        endereco,
        nuel,
        preco,
        activo,
        taxa_isento,
        taxa: taxa == "" ? null : taxa,
        motivo,
        desconto_fixo: desconto_fixo == "" ? 0 : desconto_fixo,
        empresa,
        usuario_added,
        usuario_updated,
    };
};

export const getLastInsertedId = async (req, res) => {
    const lastInserted = await knex(tableName)
        .where({ empresa: req.user.empresa })
        .orderBy("data_added", "DESC")
        .first();

    if (lastInserted) {
        return handleResponse(req, res, 200, {
            id: `${("" + (lastInserted.id + 1)).slice(-4)}`,
        });
    } else {
        return handleResponse(req, res, 200, {
            id: `${("" + 1).slice(-4)}`,
        });
    }
};

export const clienteTemDocumentoAssociado = async (req, res) => {
    const { empresa } = req.user;
    const { id } = req.params;

    try {
        const documento = await knex("documento")
            .where({ cliente: id, empresa })
            .first();

        return handleResponse(req, res, 200, { documento });
    } catch (error) {
        return handleResponse(req, res, 500, error);
    }
};

export const getTipoDoc = async (req, res) => {
    const { cliente, tipo_doc } = req.params;

    var clienteDoc = await knex("documento").where({
        cliente,
        tipo_doc,
        empresa: req.user.empresa,
        removido: false,
    });

    let document = [];

    if (
        !(await knex("documento")
            .where({
                cliente,
                tipo_doc,
                empresa: req.user.empresa,
                removido: false,
            })
            .first())
    ) {
        const message = "Registo não encontrado";
        return handleResponse(req, res, 404, message);
    }
    for (let i = 0; i < clienteDoc.length; i++) {
        let total = 0;
        const documentoItems = await knex("documento_item").where({
            documento: clienteDoc[i].id,
        });

        const moedaPadrao = await knex("moeda")
            .select(["codigo"])
            .where({ id: clienteDoc[i].moeda_padrao })
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
        document.push({
            ...clienteDoc[i],
            referencia: numeroDocFormat(clienteDoc[i]),
            total: formatCurrency(total) + " " + moedaPadrao.codigo,
        });
    }

    return handleResponse(req, res, 200, document);
};

export const numeroDocFormat = (clienteDoc) => {
    return `${clienteDoc.prefixo}-${("0000" + clienteDoc.numero).slice(
        -4
    )}/${new Date(clienteDoc.data_added).getFullYear()}`;
};

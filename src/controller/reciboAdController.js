import knex from "../database";
import { handleResponse } from "../utils/handleResponse";
import { userCanAccess } from "../middleware/userCanAccess";
import { formatCurrency } from "../helper/FormatCurrency";

const permissionGroup = "Recibo de Adiantamento";
const tableName = "recibo_adiantamento";

export const add = async (req, res) => {
    const { userId } = req.user;

    if (!(await userCanAccess(permissionGroup, "Criar Recibo", userId))) {
        const message = "Sem permissão para criar recibo.";
        return handleResponse(req, res, 403, [], message);
    }
    const { empresa } = req.user;
    // #swagger.tags = ['Recibo de adiantamento']
    // #swagger.description = 'Endpoint para criar Recibo de adiantamento'

    let {
        descricao,
        valor = 0,
        cliente = "",
        metodo_pagamento,
        nome_banco = "",
        numero_cheque = "",
        codigo_movimento = "",
        data_emissao,
    } = req.body;

    let data = new Date();
    try {
        data = data_emissao
            ? moment(data_emissao).format("Y-M-DD")
            : new Date();
    } catch (error) {}

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

    if (
        !(await knex("metodo_pagamento")
            .where({
                id: metodo_pagamento,
                removido: false,
            })
            .first())
    ) {
        const message = "Método de pagamento não encontrado";
        return handleResponse(req, res, 409, [], message);
    }

    return knex(tableName)
        .insert({
            numero: num,
            descricao: descricao,
            valor: valor,
            cliente: cliente,
            metodo_pagamento: metodo_pagamento,
            nome_banco: nome_banco,
            numero_cheque: numero_cheque,
            data_emissao: data,
            codigo_movimento: codigo_movimento,
            empresa,
            usuario_added: req.userId,
            usuario_updated: req.userId,
        })
        .then((id) => {
            /* #swagger.responses[200] = { 
               schema: { $ref: "#/definitions/Tipo_Doc" },
               description:'Dados adicionados com sucesso.' 
        } */
            const message = "Dados adicionados com sucesso";
            return handleResponse(req, res, 200, { id: id[0] }, message);
        })
        .catch((err) => handleResponse(req, res, 500, err));
};

export const updatereciboAd = async (req, res) => {
    // #swagger.tags = ['Recibo de adiantamento']
    // #swagger.description = 'Endpoint para actualizar Recibo de adiantamento'
    const { id } = req.params;
    const { empresa } = req.user;
    const { userId } = req.user;

    if (!(await userCanAccess(permissionGroup, "Editar Recibo", userId))) {
        const message = "Sem permissão para editar recibo.";
        return handleResponse(req, res, 403, [], message);
    }
    let {
        descricao,
        valor = 0,
        metodo_pagamento = 0,
        nome_banco = "",
        cliente = "",
        numero_cheque = "",
        codigo_movimento = "",
    } = req.body;

    /* #swagger.responses[404] = { 
               schema: { $ref: "#/definitions/IdNo" },
               description:'Tipo de documento com o Id ${id} não encontrado.' 
        } */

    const reciboAd = await knex(tableName)
        .update({
            descricao: descricao,
            valor: valor,
            cliente: cliente,
            metodo_pagamento: metodo_pagamento,
            nome_banco: nome_banco,
            numero_cheque: numero_cheque,
            codigo_movimento: codigo_movimento,
        })
        .where({ id, empresa });

    if (!reciboAd) {
        return handleResponse(req, res, 404, [], `Registo não encontrado!`);
    }
    /* #swagger.responses[404] = { 
               schema: { $ref: "#/definitions/IdNo" },
               description:'Tipo de documento com o Id ${id} não encontrado.' 
        } */

    /* #swagger.responses[200] = { 
               schema: { $ref: "#/definitions/idUpdate" },
               description:'Actualizado com sucesso.' 
        } */

    return handleResponse(req, res, 200, { id }, `Actualizado com sucesso.`);
};

export const deleteReciboAd = async (req, res) => {
    const { id } = req.params;
    const { empresa } = req.user;
    const { userId } = req.user;

    if (!(await userCanAccess(permissionGroup, "Deletar Recibo", userId))) {
        const message = "Sem permissão para deletar recibo.";
        return handleResponse(req, res, 403, [], message);
    }
    // #swagger.tags = ['Recibo de adiantamento']
    // #swagger.description = 'Endpoint para remover Recibo de adiantamento'
    const removido = 1;

    const delReciboAd = await knex(tableName)
        .update("removido", removido, empresa)
        .where({ id, removido: false, empresa });

    if (!delReciboAd) {
        const message = `Registo não encontrado`;
        return handleResponse(req, res, 404, [], message);
    }

    const message = "`Recibo de adiantamento removido com sucesso.`";
    return handleResponse(req, res, 200, [], message);
};

export const getAll = async (req, res) => {
    // #swagger.tags = ['Recibo de adiantamento']
    // #swagger.description = 'Endpoint para listar Recibo de adiantamento'

    const { empresa } = req.user;
    const { userId } = req.user;

    if (!(await userCanAccess(permissionGroup, "Mostrar Recibo", userId))) {
        const message = "Sem permissão para visualizar os recibos.";
        return handleResponse(req, res, 403, [], message);
    }
    const ReciboAd = await knex(tableName).where({
        removido: false,
        empresa,
    });

    const response = [];
    let date = new Date();
    const empresaAssociada = await knex("empresa")
        .where({ id: empresa })
        .first();
    const moeda = await knex("moeda")
        .where({ id: empresaAssociada.moeda_padrao })
        .first();

    for (let i = 0; i < ReciboAd.length; i++) {
        response.push({
            ...ReciboAd[i],
            valor: ReciboAd[i].valor,
            valor_formatado:
                formatCurrency(ReciboAd[i].valor) + " " + moeda.codigo,
            data_emissao: `${date.getDate(ReciboAd[i])}-${date.getMonth(
                ReciboAd[i]
            )}-${date.getFullYear(ReciboAd[i])}`,
            referencia: numeroDocFormat(ReciboAd[i]),
        });
    }

    return handleResponse(req, res, 200, response);
};

export const getById = async (req, res) => {
    const { id } = req.params;
    const { empresa } = req.user;
    const { userId } = req.user;

    if (!(await userCanAccess(permissionGroup, "Detalhes do Recibo", userId))) {
        const message = "Sem permissão para visualizar recibo.";
        return handleResponse(req, res, 403, [], message);
    }
    // #swagger.tags = ['Recibo de adiantamento']
    // #swagger.description = 'Endpoint para listar Recibo de adiantamento por Id'

    if (
        !(await knex(tableName).where({ id, removido: false, empresa }).first())
    ) {
        const message = `Registo não encontrado.`;
        return handleResponse(req, res, 404, [], message);
    }

    /* #swagger.responses[404] = { 
               schema: { $ref: "#/definitions/IdNo" },
               description:'Tipo de documento com o ID ${id} não encontrado.' 
        } */

    const reciboId = await knex(tableName)
        .where({ id, empresa, removido: false })
        .first();
    const empresaAssociada = await knex("empresa")
        .where({ id: empresa })
        .first();
    const moeda = await knex("moeda")
        .where({ id: empresaAssociada.moeda_padrao })
        .first();

    return handleResponse(req, res, 200, {
        ...reciboId,
        valor: reciboId.valor,
        valor_formatado: formatCurrency(reciboId.valor) + " " + moeda.codigo,
        referencia: numeroDocFormat(reciboId),
    });
};

export const getByCliente = async (req, res) => {
    const { cliente } = req.params;
    const { empresa } = req.user;
    const { userId } = req.user;
    let response = [];

    if (!(await userCanAccess(permissionGroup, "Detalhes do Recibo", userId))) {
        const message = "Sem permissão para visualizar recibo.";
        return handleResponse(req, res, 403, [], message);
    }
    // #swagger.tags = ['Recibo de adiantamento']
    // #swagger.description = 'Endpoint para listar Recibo de adiantamento por Id'

    if (
        !(await knex(tableName)
            .where({ cliente, removido: false, empresa })
            .first())
    ) {
        const message = `Registo não encontrado.`;
        return handleResponse(req, res, 404, [], message);
    }

    /* #swagger.responses[404] = { 
               schema: { $ref: "#/definitions/IdNo" },
               description:'Tipo de documento com o ID ${id} não encontrado.' 
        } */

    const reciboId = await knex(tableName)
        .where({ cliente, empresa, removido: false })
        .first();
    const empresaAssociada = await knex("empresa")
        .where({ id: empresa })
        .first();
    const moeda = await knex("moeda")
        .where({ id: empresaAssociada.moeda_padrao })
        .first();

    response.push({
        ...reciboId,
        valor: reciboId.valor,
        valor_formatado: formatCurrency(reciboId.valor) + " " + moeda.codigo,
        referencia: numeroDocFormat(reciboId),
    });

    return handleResponse(req, res, 200, { items: response });
};

export const metodoPagamentoId = async (req, res) => {
    const { id } = req.params;
    // #swagger.tags = ['Recibo de adiantamento']
    // #swagger.description = 'Endpoint para listar Método de pagamento por ID'

    if (
        !(await knex("metodo_pagamento").where({ id, removido: false }).first())
    ) {
        const message = `Registo não encontrado.`;
        return handleResponse(req, res, 404, [], message);
    }

    const metodoPagamentoId = await knex("metodo_pagamento")
        .where({ id, removido: false })
        .first();

    return handleResponse(req, res, 200, metodoPagamentoId);
};

export const metotoPagamentoAll = async (req, res) => {
    // #swagger.tags = ['Recibo de adiantamento']
    // #swagger.description = 'Endpoint para listar Método de pagamento'

    const metodoPagamento = await knex("metodo_pagamento").where({
        removido: false,
    });

    if (!metodoPagamento) {
        const message = `Registo não encontrado`;
        return handleResponse(req, res, 404, [], message);
    }
    /* #swagger.responses[200] = { 
               schema: { $ref: "#/definitions/Tipo_Doc" },
               description:'Listando Tipo de documento.' 
        } */

    return handleResponse(req, res, 200, metodoPagamento);
};

export const numeroDocFormat = (ReciboAd) => {
    return `RA-${("0000" + ReciboAd.numero).slice(-4)}/${new Date(
        ReciboAd.data_added
    ).getFullYear()}`;
};

export const getLastInsertedReciboAd = async (req, res) => {
    // #swagger.tags = ['Documento']
    // #swagger.description = 'Endpoint para listar ultimo documento Inserido'

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

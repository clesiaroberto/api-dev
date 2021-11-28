import knex from "../database";
import { handleResponse } from "../utils/handleResponse";
import { userCanAccess } from "../middleware/userCanAccess";
import { log } from "../utils/log";

const tableName = "tipo_fornecedor";

export const add = async (req, res) => {
    // #swagger.tags = ['Tipo_Cliente']
    // #swagger.description = 'Cadastro de Tipos de Clientes.'
    const data = dadosValidos(req);

    const [create] = await knex(tableName).insert(data);

    handleResponse(req, res, 200, { id: create });
};

export const updateTipoFornecedor = async (req, res) => {
    // #swagger.tags = ['Tipo_Cliente']
    // #swagger.description = 'Endpoint para actualizar tipo de cliente.'
    const { id } = req.params;
    const { userId } = req.user;

    const data = dadosValidos(req);
    data.usuario_added = undefined;

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
            return handleResponse(req, res, 200, { id: id });
        })
        .catch((err) => handleResponse(res, res, 500));
};

export const getAll = async (req, res) => {
    // #swagger.tags = ['Despesa']
    // #swagger.description = 'Endpoint para listar Tipo de cliente.'
    const { empresa } = req.user;

    const tipoCliente = await knex(tableName).where({
        removido: false,
        empresa,
    });

    return handleResponse(req, res, 200, {
        items: tipoCliente,
    });
};

export const getById = async (req, res) => {
    // #swagger.tags = ['Tipo_Cliente']
    // #swagger.description = 'Endpoint para listar tipo de cliente em função do Id.'
    const { id } = req.params;
    const { empresa } = req.user;

    const tipoCliente = await knex(tableName)
        .where({ id, empresa, removido: false })
        .first();

    if (!tipoCliente) {
        const message = `Registo não encontrado.`;
        return handleResponse(req, res, 404, [], message);
    }

    /* #swagger.responses[404] = {
        schema: { $ref: "#/definitions/IdNo" },
        description:'Cliente não encontrado.'
    } */

    /* #swagger.responses[200] = {
        schema: { $ref: "#/definitions/Cliente" },
        description:'Listando Clientes'
    } */

    return handleResponse(req, res, 200, { ...tipoCliente });
};

export const deleteTipoFornecedor = async (req, res) => {
    // #swagger.tags = ['Despesa']
    // #swagger.description = 'Endpoint para remover Depositos em função do Id.'
    const { id } = req.params;
    const { empresa } = req.user;

    /* #swagger.responses[404] = {
               schema: { $ref: "#/definitions/IdNo" },
               description:'Removendo Clientes'
        } */
    console.log(id);
    knex(tableName)
        .update("removido", true)
        .where({ id, removido: false, empresa })
        .then((row) => {
            console.log(row);
            if (!row) {
                const message = `Registo não encontrado.`;
                return handleResponse(req, res, 404, [], message);
            }
            /* #swagger.responses[200] = {
               schema: { $ref: "#/definitions/idDelete" },
               description:'Removido com sucesso'
            } */

            return handleResponse(req, res, 200, [], `Removido com sucesso.`);
        })
        .catch((err) => handleResponse(req, res, 500, err));
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

const dadosValidos = (req) => {
    const usuario_added = req.userId;
    const usuario_updated = req.userId;
    const { empresa } = req.user;

    const { nome = "", descricao = "" } = req.body;

    return {
        nome,
        descricao,
        usuario_added,
        usuario_updated,
        empresa,
    };
};

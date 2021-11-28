import knex from "../database";
import { handleResponse } from "../utils/handleResponse";

const tableName = "moeda";

export const all = async (req, res) => {
    // #swagger.tags = ['Moeda']
    // #swagger.description = 'Endpoint para listar Moedas'

    const moedas = await knex(tableName).where({ removido: false });
    return handleResponse(req, res, 200, moedas);
};

export const findById = async (req, res) => {
    // #swagger.tags = ['Moeda']
    // #swagger.description = 'Endpoint para listar Moedas por ID'
    const { id } = req.params;
    const moeda = await knex(tableName).where({ id, removido: false }).first();

    if (!moeda) {
        return handleResponse(req, res, 404, [], `Registo não encontrado.`);
    }
    return handleResponse(req, res, 200, moeda);
};

export const getLastInsertedMoeda = async (req, res) => {
    // #swagger.tags = ['Documento']
    // #swagger.description = 'Endpoint para listar ultimo documento Inserido'

    const lastInserted = await knex("moeda")
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

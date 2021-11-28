import knex from "../database";

import { handleResponse } from "../utils/handleResponse";

export const getAll = async (req, res) => {
    const AllPrecoVenda = await knex("preco_compra");
    return handleResponse(req, res, 200, AllPrecoVenda);
};

export const getById = async (req, res) => {
    const { id } = req.params;

    if (!(await knex("preco_compra").where("id", id).first())) {
        const message = `ID ${id} não encontrado.`;
        return handleResponse(req, res, 404, [], message);
    }

    let AllTipoDocConfig = await knex("preco_compra").where("id", id);

    return handleResponse(req, res, 200, AllTipoDocConfig);
};

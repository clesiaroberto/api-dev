import knex from "../database";
import { handleResponse } from "../utils/handleResponse";

export const create = async (req, res) => {
    // #swagger.tags = ['Traducao']
    // #swagger.description = 'Endpoint para cadastrar Traducao.'
    const data = dadosValidos(req);

    try {
        const chave = await knex("traducao_chave")
            .where({ chave: data.chave })
            .first();
        if (chave) {
            const message = "A chave já está registada";
            return handleResponse(res, res, 400, {}, message);
        }

        const [id] = await knex("traducao_chave").insert(data);
        return handleResponse(req, res, 200, { id });
    } catch (error) {
        return handleResponse(res, res, 500, e);
    }
};

export const remove = async (req, res) => {
    // #swagger.tags = ['Traducao']
    // #swagger.description = 'Endpoint para remover Traducao.'
    const { id } = req.params;
    const removido = 1;

    /* #swagger.responses[404] = { 
               schema: { $ref: "#/definitions/IdNo" },
               description:'Tradução com ID ${id} não encontrada.' 
        } */

    knex("traducao_chave")
        .update("removido", removido)
        .where({ id, removido: false })
        .then((row) => {
            if (!row) {
                return handleResponse(
                    req,
                    res,
                    404,
                    [],
                    `Tradução Chave com ID ${id} não encontrada.`
                );
            }
            /* #swagger.responses[200] = { 
               schema: { $ref: "#/definitions/idDelete" },
               description:'Tradução removida com sucesso.' 
        } */

            return handleResponse(
                req,
                res,
                200,
                [],
                `Tradução Chave removida com sucesso.`
            );
        })
        .catch((err) => handleResponse(req, res, 500, err));
};

export const update = async (req, res) => {
    // #swagger.tags = ['Traducao']
    // #swagger.description = 'Endpoint para actualizar Tradução.'
    const { id } = req.params;
    const dados = dadosValidos(req);

    /* #swagger.responses[404] = { 
               schema: { $ref: "#/definitions/IdNo" },
               description:'Taxa com ID ${id} não encontrada.' 
        } */

    await knex("traducao_chave")
        .update(dados)
        .where({ id, removido: false })
        .then((row) => {
            if (!row) {
                return handleResponse(
                    req,
                    res,
                    404,
                    [],
                    `Tradução Chave não encontrada.`
                );
            }
            /* #swagger.responses[200] = { 
               schema: { $ref: "#/definitions/idUpdate" },
               description:'Taxa Actualizada com sucesso.' 
        } */

            return handleResponse(
                req,
                res,
                200,
                { id: id },
                `Tradução Chave Actualizada com sucesso.`
            );
        })
        .catch((err) => handleResponse(req, res, 500, err));
};

export const all = async (req, res) => {
    // #swagger.tags = ['Traducao']
    // #swagger.description = 'Endpoint para listar Traducao.'
    const traducao = await knex("traducao_chave").where({ removido: false });

    /* #swagger.responses[200] = { 
               schema: { $ref: "#/definitions/" },
               description:'Listando Taxas.' 
        } */
    return handleResponse(req, res, 200, traducao);
};

export const findById = async (req, res) => {
    // #swagger.tags = ['Traducao']
    // #swagger.description = 'Endpoint para listar Traducao em função do Id.'
    const { id } = req.params;

    /* #swagger.responses[404] = { 
               schema: { $ref: "#/definitions/IdNo" },
               description:'Taxa com o ID ${id} não encontrado..' 
        } */

    if (
        !(await knex("traducao_chave").where({ id, removido: false }).first())
    ) {
        const message = `Tradução Chave com o ID ${id} não encontrada.`;
        return handleResponse(req, res, 404, [], message);
    }

    const traducao = await knex("traducao_chave").where("id", id).first();

    /* #swagger.responses[200] = { 
               schema: { $ref: "#/definitions/Taxa" },
               description:'Listando Taxa em função do Id.' 
        } */

    return handleResponse(req, res, 200, traducao);
};

const dadosValidos = (req) => {
    const usuario_added = req.userId;
    const usuario_updated = req.userId;
    const { chave, comentario } = req.body;

    return {
        chave: String(chave).toLocaleLowerCase(),
        comentario,
        usuario_added,
        usuario_updated,
    };
};

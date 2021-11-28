import knex from "../database";
import { handleResponse } from "../utils/handleResponse";

export const create = async (req, res) => {
    // #swagger.tags = ['Lingua']
    // #swagger.description = 'Endpoint para cadastrar Lingua.'
    const data = dadosValidos(req);

    knex("lingua")
        .insert(data)
        .then(async (id) => {
            const lingua = await knex("lingua").where({ id }).first();

            return handleResponse(
                req,
                res,
                200,
                lingua,
                "Registado com sucesso."
            );
        })
        .catch((e) => handleResponse(res, res, 500, e));
};

export const remove = async (req, res) => {
    // #swagger.tags = ['Lingua']
    // #swagger.description = 'Endpoint para remover Lingua.'
    const { id } = req.params;
    const removido = 1;

    /* #swagger.responses[404] = { 
               schema: { $ref: "#/definitions/IdNo" },
               description:'Tradução com ID ${id} não encontrada.' 
        } */

    knex("lingua")
        .update("removido", removido)
        .where({ id, removido: false })
        .then((row) => {
            if (!row) {
                return handleResponse(
                    req,
                    res,
                    404,
                    [],
                    `Língua com ID ${id} não encontrada.`
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
                `Língua removida com sucesso.`
            );
        })
        .catch((err) => handleResponse(req, res, 500, err));
};

export const update = async (req, res) => {
    // #swagger.tags = ['Lingua']
    // #swagger.description = 'Endpoint para actualizar Lingua.'
    const { id } = req.params;
    const dados = dadosValidos(req);

    const [updated] = await knex("lingua")
        .update(dados)
        .where({ id, removido: false })
        .then((row) => {
            if (!row) {
                return handleResponse(
                    req,
                    res,
                    404,
                    [],
                    `Língua com ID ${id} não encontrado.`
                );
            }

            return handleResponse(
                req,
                res,
                200,
                { id: id }`Língua Actualizada com sucesso.`
            );
        })
        .catch((err) => handleResponse(req, res, 500, err));
};

export const all = async (req, res) => {
    // #swagger.tags = ['Lingua']
    // #swagger.description = 'Endpoint para Listar Lingua.'
    const lingua = await knex("lingua").where({ removido: false });

    return handleResponse(req, res, 200, { ...lingua });
};

export const findById = async (req, res) => {
    // #swagger.tags = ['Lingua']
    // #swagger.description = 'Endpoint para Listar Lingua por Id'
    const { id } = req.params;

    if (!(await knex("lingua").where({ id, removido: false }).first())) {
        const message = `Língua com o ID ${id} não encontrada.`;
        return handleResponse(req, res, 404, [], message);
    }

    const lingua = await knex("lingua").where("id", id).first();

    return handleResponse(req, res, 200, lingua);
};

export const getLastInsertedLingua = async (req, res) => {
    // #swagger.tags = ['Documento']
    // #swagger.description = 'Endpoint para listar ultimo documento Inserido'

    const lastInserted = await knex("lingua")
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
    const { nome } = req.body;

    return {
        nome,
        usuario_added,
        usuario_updated,
    };
};

import knex from "../database";
import { handleResponse } from "../utils/handleResponse";

export const create = async (req, res) => {
    // #swagger.tags = ['Traducao']
    // #swagger.description = 'Endpoint para cadastrar Taxa.'
    const data = dadosValidos(req);
    const { linguaItems = [] } = req.body;

    /* #swagger.responses[404] = { 
               schema: { $ref: "#/definitions/linguaNo" },
               description:'Língua não encontrada.' 
        } */

    if (!(await knex("lingua").where("id", data.lingua).first())) {
        return handleResponse(req, res, 404, "Língua não encontrada.");
    }

    /* #swagger.responses[404] = { 
               schema: { $ref: "#/definitions/TchaveNo" },
               description:'Tradução Chave não encontrada.' 
        } */
    if (
        !(await knex("traducao_chave").where("id", data.traducao_chave).first())
    ) {
        return handleResponse(req, res, 404, "Tradução Chave não encontrada.");
    }

    /* #swagger.responses[200] = { 
               schema: { $ref: "#/definitions/Traducao" },
               description:'Registado com sucesso.' 
        } */
    knex("traducao")
        .insert(data)
        .then(async (id) => {
            const traducao = await knex("traducao").where({ id }).first();

            return handleResponse(
                req,
                res,
                200,
                traducao,
                "Registado com sucesso."
            );
        })
        .catch((e) => handleResponse(res, res, 500, e));
};

export const createUpdateList = async (req, res) => {
    const { lingua, traducoes = [] } = req.body;
    const { userId } = req.user;

    const savedLingua = await knex("lingua").where({ id: lingua }).first();
    if (!lingua || !savedLingua) {
        const message = "Lingua inválida.";
        return handleResponse(req, res, 404, [], message);
    }

    if (traducoes.length == 0) {
        const message = "Nenhuma tradução foi enviada";
        return handleResponse(req, res, 400, [], message);
    }

    try {
        await knex("traducao").where({ lingua }).del();
        traducoes.map(async (item) => {
            try {
                await knex("traducao").insert({
                    lingua,
                    traducao_chave: item.traducao_chave,
                    traducao: item.traducao,
                    usuario_added: userId,
                    usuario_updated: userId,
                });
            } catch (error) {
                console.log(error);
            }
        });
        return handleResponse(req, res, 200, []);
    } catch (error) {
        return handleResponse(req, res, 500, error);
    }
};

export const remove = async (req, res) => {
    // #swagger.tags = ['Traducao']
    // #swagger.description = 'Endpoint para remover Taxa.'
    const { id } = req.params;
    const removido = 1;

    /* #swagger.responses[404] = { 
               schema: { $ref: "#/definitions/IdNo" },
               description:'Tradução com ID ${id} não encontrada.' 
        } */

    knex("traducao")
        .update("removido", removido)
        .where({ id, removido: false })
        .then((row) => {
            if (!row) {
                return handleResponse(
                    req,
                    res,
                    404,
                    [],
                    `Tradução com ID ${id} não encontrada.`
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
                `Tradução removida com sucesso.`
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
               schema: { $ref: "#/definitions/linguaNo" },
               description:'Língua não encontrada.' 
        } */

    if (!(await knex("lingua").where("id", dados.lingua).first())) {
        return handleResponse(req, res, 404, "Língua não encontrada.");
    }

    /* #swagger.responses[404] = { 
               schema: { $ref: "#/definitions/TchaveNo" },
               description:'Tradução Chave não encontrada.' 
        } */

    if (
        !(await knex("traducao_chave")
            .where("id", dados.traducao_chave)
            .first())
    ) {
        return handleResponse(req, res, 404, "Tradução Chave não encontrada.");
    }

    /* #swagger.responses[404] = { 
               schema: { $ref: "#/definitions/IdNo" },
               description:'Tradução com ID ${id} não encontrado.' 
        } */

    await knex("traducao")
        .update(dados)
        .where({ id, removido: false })
        .then((row) => {
            if (!row) {
                return handleResponse(
                    req,
                    res,
                    404,
                    [],
                    `Tradução com ID ${id} não encontrado.`
                );
            }
            /* #swagger.responses[200] = { 
               schema: { $ref: "#/definitions/idUpdate" },
               description:'Tradução Actualizada com sucesso.' 
        } */

            return handleResponse(
                req,
                res,
                200,
                { id: id },
                `Tradução Actualizada com sucesso.`
            );
        })
        .catch((err) => handleResponse(req, res, 500, err));
};

export const all = async (req, res) => {
    const { lingua } = req.query;
    const response = [];

    // #swagger.tags = ['Traducao']
    // #swagger.description = 'Endpoint para listar Tradução.'
    if (lingua) {
        const traducoes = await knex("traducao").where({
            lingua,
            removido: false,
        });
        const linguagem = await knex("lingua").where({ id: lingua }).first();
        for (let i = 0; i < traducoes.length; i++) {
            const traducao_chave = await knex("traducao_chave")
                .where({ id: traducoes[i].traducao_chave })
                .first();

            response.push({
                ...traducoes[i],
                linguagem,
                traducao_chave,
            });
        }
    } else {
        let lastFoundedLinguagem = 0;
        let linguagem = {};
        const traducoes = await knex("traducao").where({ removido: false });
        for (let i = 0; i < traducoes.length; i++) {
            if (lastFoundedLinguagem != traducoes[i].lingua) {
                linguagem = await knex("lingua")
                    .where({ id: traducoes[i].lingua })
                    .first();
            }

            const traducao_chave = await knex("traducao_chave")
                .where({ id: traducoes[i].traducao_chave })
                .first();

            response.push({
                ...traducoes[i],
                linguagem,
                traducao_chave,
            });
        }
    }

    /* #swagger.responses[200] = { 
        schema: { $ref: "#/definitions/Traducao" },
        description:'Listando Traducao.' 
    } */

    return handleResponse(req, res, 200, response);
};

export const findById = async (req, res) => {
    // #swagger.tags = ['Traducao']
    // #swagger.description = 'Endpoint para listar Tradução em função do Id.'
    const { id } = req.params;

    /* #swagger.responses[404] = { 
               schema: { $ref: "#/definitions/IdNo" },
               description:'Traducao com o ID ${id} não encontrado.' 
        } */

    if (!(await knex("traducao").where({ id, removido: false }).first())) {
        const message = `Traducao com o ID ${id} não encontrada.`;
        return handleResponse(req, res, 404, [], message);
    }

    const traducao = await knex("traducao").where("id", id).first();

    /* #swagger.responses[200] = { 
               schema: { $ref: "#/definitions/Traducao" },
               description:'Traducao com o ID ${id} não encontrado.' 
        } */

    return handleResponse(req, res, 200, traducao);
};

export const getAllTranslations = async (req, res) => {
    const { idioma } = req.params;
    const lingua = await knex("lingua").where({ nome: idioma }).first();
    if (!lingua) {
        const message = "Idioma não encontrado.";
        return handleResponse(req, res, 404, [], message);
    }
    const traducoes = await knex("traducao").where({ lingua: lingua.id });
    const response = {};
    for (let i = 0; i < traducoes.length; i++) {
        const { chave } = await knex("traducao_chave")
            .select(["chave"])
            .where({ id: traducoes[i].traducao_chave })
            .first();

        response[chave] = traducoes[i].traducao;
    }

    return res.json(response);
};

const dadosValidos = (req) => {
    const usuario_added = req.userId;
    const usuario_updated = req.userId;
    const { lingua, traducao_chave, traducao } = req.body;

    return {
        lingua,
        traducao_chave,
        traducao,
        usuario_added,
        usuario_updated,
    };
};

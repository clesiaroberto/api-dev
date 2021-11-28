import knex from "../database";
import { handleResponse } from "../utils/handleResponse";

const tableName = "modelo_impressao";

export const add = async (req, res) => {
    // #swagger.tags = ['Modelo Impressao']
    // #swagger.description = 'Endpoint para criar Modelo de Impressao'

    let { nome, ficheiro, tipo_doc } = req.body;

    if (!tipo_doc) {
        const message = "O tipo de documento é obrigatório";

        return handleResponse(req, res, 409, [], message);
    }

    if (!(await knex("tipo_doc").where({ id: tipo_doc }).first())) {
        const message = "Tipo de documento não encontrado.";
        return handleResponse(req, res, 404, [], message);
    }

    if (await knex(tableName).where({ nome, ficheiro }).first()) {
        const message = "Modelo de impressão já registado.";
        return handleResponse(req, res, 409, [], message);
    }

    return knex(tableName)
        .insert({
            nome: nome,
            ficheiro: ficheiro,
            usuario_added: req.userId,
            usuario_updated: req.userId,
        })
        .then(async (id) => {
            /* #swagger.responses[200] = { 
               schema: { $ref: "#/definitions/Tipo_Doc" },
               description:'Dados adicionados com sucesso.' 
        } */
            await knex("tipo_doc_modelo_impressao").insert({
                modelo_impressao: id,
                tipo_doc: tipo_doc,
                ficheiro: ficheiro,
                usuario_added: req.userId,
                usuario_updated: req.userId,
            });

            return handleResponse(
                req,
                res,
                200,
                { id: id[0] },
                "Dados adicionados com sucesso"
            );
        })
        .catch((err) => handleResponse(req, res, 500, err));
};

export const update = async (req, res) => {
    // #swagger.tags = ['Modelo Impressao']
    // #swagger.description = 'Endpoint parar actualizar Modelo de Impressao'
    const { id } = req.params;

    let { nome, ficheiro, tipo_doc } = req.body;

    /* #swagger.responses[404] = { 
               schema: { $ref: "#/definitions/IdNo" },
               description:'Tipo de documento com o Id ${id} não encontrado.' 
        } */

    if (!(await knex("tipo_doc").where({ id: tipo_doc }).first())) {
        const message = "Tipo de documento não encontrado.";
        return handleResponse(req, res, 404, [], message);
    }

    const modeloInpressao = await knex(tableName)
        .update({
            nome: nome,
            ficheiro: ficheiro,
            usuario_added: req.userId,
            usuario_updated: req.userId,
        })
        .where({ id })

        .then(async () => {
            /* #swagger.responses[200] = { 
               schema: { $ref: "#/definitions/Tipo_Doc" },
               description:'Dados adicionados com sucesso.' 
        } */
            await knex("tipo_doc_modelo_impressao").update({
                tipo_doc: tipo_doc,
                ficheiro: ficheiro,
                usuario_added: req.userId,
                usuario_updated: req.userId,
            });

            return handleResponse(
                req,
                res,
                200,
                { id: id },
                `Actualizado com sucesso.`
            );
        })
        .catch((err) => handleResponse(req, res, 500, err));

    /* #swagger.responses[404] = { 
               schema: { $ref: "#/definitions/IdNo" },
               description:'Tipo de documento com o Id ${id} não encontrado.' 
        } */

    /* #swagger.responses[200] = { 
               schema: { $ref: "#/definitions/idUpdate" },
               description:'Actualizado com sucesso.' 
        } */
};

export const deleteModelo = async (req, res) => {
    const { id } = req.params;
    const removido = 1;
    // #swagger.tags = ['Modelo Impressao']
    // #swagger.description = 'Endpoint para remover Modelo de Impressao'

    /* #swagger.responses[404] = { 
        schema: { $ref: "#/definitions/IdNo" },
        description:'Tipo de documento com o Id ${id} não encontrado.' 
    } */

    const delModelo = await knex(tableName)
        .update("removido", removido)
        .where({ id, removido: false });

    const delImpressao = await knex("tipo_doc_modelo_impressao")
        .update("removido", removido)
        .where({ modelo_impressao: id, removido: false });

    if (!(delModelo || delImpressao)) {
        const menssagem = "`Registo não encontrado.`";
        return handleResponse(req, res, 404, [], menssagem);
    }

    const message = "`Modelo de impressão removido com sucesso.`";
    return handleResponse(req, res, 200, [], message);
};

export const getAll = async (req, res) => {
    // #swagger.tags = ['Modelo Impressao']
    // #swagger.description = 'Endpoint para listar Modelo de Impressao'

    const modeloImpressao = await knex(tableName).where({
        removido: false,
    });

    if (!modeloImpressao) {
        const message = `Registo não encontrado`;
        return handleResponse(req, res, 404, [], message);
    }

    return handleResponse(req, res, 200, modeloImpressao);
};

export const getById = async (req, res) => {
    const { id } = req.params;
    // #swagger.tags = ['Modelo Impressao']
    // #swagger.description = 'Endpoint para listar Modelo de Impressao por ID'

    /* #swagger.responses[404] = { 
               schema: { $ref: "#/definitions/IdNo" },
               description:'Tipo de documento com o ID ${id} não encontrado.' 
        } */

    if (!(await knex(tableName).where({ id, removido: false }).first())) {
        const message = `Registo não encontrado.`;
        return handleResponse(req, res, 404, [], message);
    }

    /* #swagger.responses[404] = { 
               schema: { $ref: "#/definitions/IdNo" },
               description:'Tipo de documento com o ID ${id} não encontrado.' 
        } */

    const modeloId = await knex(tableName).where({ id }).first();

    /* #swagger.responses[404] = { 
               schema: { $ref: "#/definitions/Tipo_Doc" },
               description:'Listando Tipo de Documento por Id.' 
        } */

    return handleResponse(req, res, 200, modeloId);
};

export const getLastInsertedModeloImpressao = async (req, res) => {
    // #swagger.tags = ['Documento']
    // #swagger.description = 'Endpoint para listar ultimo documento Inserido'

    const lastInserted = await knex(tableName)
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

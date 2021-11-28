import knex from "../database";
import { handleResponse } from "../utils/handleResponse";

const create = async (req, res) => {
    // #swagger.tags = ['Permissao Grupo']
    // #swagger.description = 'Endpoint para criar Grupo de Permissoes.'
    const { nome } = req.body;

    /* #swagger.responses[400] = { 
               schema: { $ref: "#/definitions/nameYes" },
               description:'A permissão ${nome} já está cadastrada.' 
        } */

    if (await knex("permissao_grupo").where({ nome }).first()) {
        const message = `A permissão ${nome} já está cadastrada`;
        return handleResponse(req, res, 400, [], message);
    }

    const permissionCreated = await knex("permissao_grupo").insert({
        nome,
        usuario_added: req.userId,
        usuario_updated: req.userId,
    });

    /* #swagger.responses[200] = { 
               schema: { $ref: "#/definitions/registerSuccess" },
               description:'Grupo de Permissões registado com sucesso.' 
        } */

    return handleResponse(
        res,
        res,
        200,
        await knex("permissao_grupo").where("id", permissionCreated).first(),
        "Grupo de Permissões registado com sucesso."
    );
};

/**
 *
 * @param {*} req
 * @param {*} res
 * @returns
 */
const findById = async (req, res) => {
    // #swagger.tags = ['Permissao Grupo']
    // #swagger.description = 'Endpoint para listar Grupo de Permissoes em função do Id.'
    const { id } = req.params;
    const permissionGroup = await knex("permissao_grupo").where({ id }).first();

    /* #swagger.responses[400] = { 
               schema: { $ref: "#/definitions/IdNo" },
               description:'Grupo de Permissão com ID ${id} não encontrado.' 
        } */

    if (!permissionGroup) {
        const message = `Grupo de Permissão com ID ${id} não encontrado.`;
        return handleResponse(req, res, 400, [], message);
    }

    /* #swagger.responses[200] = { 
               schema: { $ref: "#/definitions/Permissao_Grupo" },
               description:'Listando Grupo de Permissão em função do Id.' 
        } */

    return handleResponse(req, res, 200, permissionGroup);
};

/**
 *
 * @param {*} req
 * @param {*} res
 * @returns
 */
const findByName = async (req, res) => {
    // #swagger.tags = ['Permissao Grupo']
    // #swagger.description = 'Endpoint para listar Grupo de Permissoes em função do Nome.'
    const { nome } = req.params;
    const permissionGroup = await knex("permissao_grupo")
        .where({ nome })
        .first();

    /* #swagger.responses[400] = { 
               schema: { $ref: "#/definitions/NameNo" },
               description:'Grupo de Permissão com o nome ${nome} não encontrado.' 
        } */

    if (!permissionGroup) {
        const message = `Grupo de Permissão com o nome  ${nome} não encontrado.`;
        return handleResponse(req, res, 400, [], message);
    }
    /* #swagger.responses[200] = { 
               schema: { $ref: "#/definitions/Permissao_Grupo" },
               description:'Listando Grupo de Permissão em função do Nome' 
        } */
    return handleResponse(req, res, 200, permissionGroup);
};

const all = async (req, res) => {
    // #swagger.tags = ['Permissao Grupo']
    // #swagger.description = 'Endpoint para listar Grupo de Permissoes.'

    /* #swagger.responses[200] = { 
               schema: { $ref: "#/definitions/Permissao_Grupo" },
               description:'Listando Grupos de Permissão' 
        } */

    return handleResponse(req, res, 200, await knex("permissao_grupo"));
};

export { create, findById, findByName, all };

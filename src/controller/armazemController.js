import knex from "../database";
import { handleResponse } from "../utils/handleResponse";
import { userCanAccess } from "../middleware/userCanAccess";
import { log } from "../utils/log";

const permissionGroup = "Armazéns";
const tableName = "armazem";

export const add = async (req, res) => {
    const { empresa, userId } = req.user;

    if (!(await userCanAccess(permissionGroup, "Criar armazém", userId))) {
        const message = "Sem permissão para criar armazém.";
        return handleResponse(req, res, 403, [], message);
    }

    // #swagger.tags = ['Armazem']
    // #swagger.description = 'Endpoint para criar Armazém'

    let {
        nome,
        descricao = "",
        endereco = "",
        contacto1 = "",
        contacto2 = "",
    } = req.body;

    if (
        await knex(tableName)
            .where({ nome, descricao, endereco, contacto1, contacto2, empresa })
            .first()
    ) {
        const message = "Armazém já registado.";
        return handleResponse(req, res, 409, [], message);
    }

    return knex(tableName)
        .insert({
            nome,
            descricao,
            endereco,
            contacto1,
            contacto2,
            empresa,
            usuario_added: req.userId,
            usuario_updated: req.userId,
        })
        .then(async (id) => {
            log({
                item_id: id[0],
                descricao: "Adicionado Armazém " + nome,
                tipo: 1,
                tabela: tableName,
                empresa,
                usuario_added: userId,
                usuario_updated: userId,
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
    // #swagger.tags = ['Armazem']
    // #swagger.description = 'Endpoint para ctualizar Armazém'
    const { id } = req.params;
    const { empresa, userId } = req.user;

    if (!(await userCanAccess(permissionGroup, "Editar armazém", userId))) {
        const message = "Sem permissão para atualizar armazém.";
        return handleResponse(req, res, 403, [], message);
    }

    let { nome, descricao, endereco, contacto1, contacto2 } = req.body;

    /* #swagger.responses[404] = { 
               schema: { $ref: "#/definitions/IdNo" },
               description:'Tipo de documento com o Id ${id} não encontrado.' 
        } */

    const armazem = await knex(tableName)
        .update({
            nome: nome,
            descricao: descricao,
            endereco: endereco,
            contacto1: contacto1,
            contacto2: contacto2,
        })
        .where({ id, empresa });

    if (!armazem) {
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

    const updated = await knex(tableName).where({ id, empresa }).first();

    log({
        item_id: id,
        descricao: "Actualizado Armazém " + updated.nome,
        tipo: 2,
        tabela: tableName,
        empresa,
        usuario_added: userId,
        usuario_updated: userId,
    });

    return handleResponse(req, res, 200, { id: id });
};

export const deleteArmazem = async (req, res) => {
    const { id } = req.params;
    const { empresa, userId } = req.user;

    if (!(await userCanAccess(permissionGroup, "Deletar armazém", userId))) {
        const message = "Sem permissão para deletar armazém.";
        return handleResponse(req, res, 403, [], message);
    }
    // #swagger.tags = ['Armazem']
    // #swagger.description = 'Endpoint para remover Armazém'
    const removido = 1;

    /* #swagger.responses[404] = { 
        schema: { $ref: "#/definitions/IdNo" },
        description:'Tipo de documento com o Id ${id} não encontrado.' 
    } */

    const delArmazem = await knex(tableName)
        .update("removido", removido, empresa)
        .where({ id, removido: false, empresa });

    if (!delArmazem) {
        const message = `Registo não encontrado`;
        return handleResponse(req, res, 404, [], message);
    }

    /* #swagger.responses[404] = { 
        schema: { $ref: "#/definitions/IdNo" },
        description:'Tipo de documento com o Id ${id} não encontrado.' 
    } */

    /* #swagger.responses[200] = { 
                schema: { $ref: "#/definitions/idDelete" },
                description:'Tipo de documento removido com sucesso.' 
            } 
            */
    const message = "`Armazém removido com sucesso.`";

    const updated = await knex(tableName).where({ id, empresa }).first();

    log({
        item_id: id,
        descricao: "Removido Armazém " + updated.nome,
        tipo: 3,
        tabela: tableName,
        empresa,
        usuario_added: userId,
        usuario_updated: userId,
    });

    return handleResponse(req, res, 200, [], message);
};

export const getAll = async (req, res) => {
    const { empresa, userId } = req.user;

    if (!(await userCanAccess(permissionGroup, "Mostrar armazém", userId))) {
        const message = "Sem permissão para visualizar armazém.";
        return handleResponse(req, res, 403, [], message);
    }
    // #swagger.tags = ['Armazem']
    // #swagger.description = 'Endpoint para listar Armazém'

    const armazem = await knex(tableName).where({ removido: false, empresa });
    const response = [];

    for (let i = 0; i < armazem.length; i++) {
        const stockExists = await knex("estado_stock")
            .select(["stock"])
            .where({ armazem: armazem[i].id })
            .first();

        response.push({ ...armazem[i], stockExists });
    }
    return handleResponse(req, res, 200, response);
};

export const getById = async (req, res) => {
    const { id } = req.params;
    const { empresa, userId } = req.user;

    if (
        !(await userCanAccess(permissionGroup, "Detalhes do armazém", userId))
    ) {
        const message = "Sem permissão para visualizar armazém.";
        return handleResponse(req, res, 403, [], message);
    }
    // #swagger.tags = ['Armazem']
    // #swagger.description = 'Endpoint para listar Armazém pelo Id'

    /* #swagger.responses[404] = { 
               schema: { $ref: "#/definitions/IdNo" },
               description:'Tipo de documento com o ID ${id} não encontrado.' 
        } */

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

    const armazemId = await knex(tableName)
        .where({ id, empresa, removido: false })
        .first();

    return handleResponse(req, res, 200, armazemId);
};

export const getLastInsertedArmazem = async (req, res) => {
    // #swagger.tags = ['Armazem']
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

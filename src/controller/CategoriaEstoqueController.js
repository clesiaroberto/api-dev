import knex from "../database";
import { userCanAccess } from "../middleware/userCanAccess";
import { handleResponse } from "../utils/handleResponse";
import { log } from "../utils/log";

const tableName = "categoria_estoque";
const permissionGroup = "Categorias de Stock";

export const all = async (req, res) => {
    const { empresa, userId } = req.user;

    if (!(await userCanAccess(permissionGroup, "Mostrar Categoria", userId))) {
        const message = "Acesso negado a lista de categorias.";
        return handleResponse(req, res, 403, [], message);
    }

    // #swagger.tags = ['Categoria de stock']
    // #swagger.description = 'Endpoint para listar todas as categorias de stock.'

    /* #swagger.responses[200] = { 
        schema: { $ref: "#/definitions/Categoria_stock" },
        description:'' 
    } */

    const response = [];
    const categorias = await knex(tableName)
        .where({
            removido: false,
            empresa,
        })
        .orderBy("data_added", "DESC");

    for (let i = 0; i < categorias.length; i++) {
        const stockExists = await knex("stock")
            .select(["id"])
            .where({ categoria: categorias[i].id })
            .first();
        response.push({
            ...categorias[i],
            stockExists,
        });
    }

    return handleResponse(req, res, 200, {
        items: response,
    });
};

export const findById = async (req, res) => {
    // #swagger.tags = ['Categoria de stock']
    // #swagger.description = 'Endpoint para listar categoria de stock em função do Id.'
    const { id } = req.params;
    const { empresa, userId } = req.user;

    if (
        !(await userCanAccess(permissionGroup, "Detalhes da Categoria", userId))
    ) {
        const message = "Acesso negado aos detalhes da categoria.";
        return handleResponse(req, res, 403, [], message);
    }

    const categoria = await knex(tableName)
        .where({ id, removido: false, empresa })
        .first();

    /* #swagger.responses[404] = { 
               schema: { $ref: "#/definitions/IdNo" },
               description:'Categoria com ID ${id} não encontrado.' 
        } */

    if (!categoria) {
        return handleResponse(req, res, 404, [], `Categoria não encontrada.`);
    }

    const stockExists = await knex("stock")
        .select(["id"])
        .where({ categoria: categoria.id })
        .first();

    /* #swagger.responses[200] = { 
        schema: { $ref: "#/definitions/Categoria_stock" },
        description:'Categoria com ID ${id} não encontrada' 
    } */

    return handleResponse(req, res, 200, { ...categoria, stockExists });
};

export const create = async (req, res) => {
    // #swagger.tags = ['Categoria de stock']
    // #swagger.description = 'Endpoint para criar categoria de stock.'
    const { userId } = req.user;

    if (!(await userCanAccess(permissionGroup, "Criar Categoria", userId))) {
        const message = "Acesso negado a criação de categoria.";
        return handleResponse(req, res, 403, [], message);
    }

    const data = dadosValidos(req);

    /* #swagger.parameters['Categoria_stock'] = {
        in: 'body',
        description: 'Informações da categoria de stock.',
        required: true,
        type: 'object',
        schema: { $ref: "#/definitions/Categoria_stock" }
    } */

    /* #swagger.responses[409] = { 
        schema: { $ref: "#/definitions/CategoryNo" },
        description:'Categoria ${data.nome} já está registada' 
    } */

    if (
        await knex(tableName)
            .where({
                nome: data.nome,
                empresa: data.empresa,
                removido: false,
            })
            .first()
    ) {
        const message = `Categoria ${data.nome} já está registada.`;
        return handleResponse(req, res, 409, [], message);
    }

    /* #swagger.responses[200] = { 
        schema: { $ref: "#/definitions/registerSuccess" },
        description:'Dados adicionados com sucesso' 
    } */
    return knex(tableName)
        .insert(data)
        .then((id) => {
            log({
                item_id: id[0],
                descricao: "Adicionado categoria de stock: " + data.nome,
                tipo: 1,
                tabela: tableName,
                empresa: req.user.empresa,
                usuario_added: userId,
                usuario_updated: userId,
            });

            handleResponse(
                req,
                res,
                200,
                { id: id[0] },
                "Dados adicionados com sucesso"
            );
        })
        .catch((err) => handleResponse(res, res, 500));
};

export const update = async (req, res) => {
    // #swagger.tags = ['Categoria de stock']
    // #swagger.description = 'Endpoint para actualizar categoria de stock.'
    const { id } = req.params;
    const { userId } = req.user;

    if (!(await userCanAccess(permissionGroup, "Editar Categoria", userId))) {
        const message = "Acesso negado a atualização de categoria.";
        return handleResponse(req, res, 403, [], message);
    }

    const data = dadosValidos(req);
    data.usuario_added = undefined;

    /* #swagger.parameters['Categoria_stock'] = {
               in: 'body',
               description: 'Informações da categoria de stock.',
               required: true,
               type: 'object',
               schema: { $ref: "#/definitions/Categoria_stock" }
    } */

    /* #swagger.responses[404] = { 
               schema: { $ref: "#/definitions/IdNo" },
               description:'Categoria de stock não encontrada.' 
        } */

    const [updated] = knex(tableName)
        .update(data)
        .where({ id, removido: false, empresa: data.empresa })
        .then((row) => {
            if (!row) {
                const message = `Categoria de stock não encontrada.`;
                return handleResponse(req, res, 404, [], message);
            }
            /* #swagger.responses[200] = { 
               schema: { $ref: "#/definitions/idUpdate" },
               description:'Dados atualizados com sucesso.' 
        } */
            const message = `Dados atualizados com sucesso.`;

            log({
                item_id: id[0],
                descricao: "Actualizado categoria de stock: " + data.nome,
                tipo: 2,
                tabela: tableName,
                empresa: req.user.empresa,
                usuario_added: userId,
                usuario_updated: userId,
            });

            return handleResponse(req, res, 200, { id: id });
        })
        .catch((err) => handleResponse(req, res, 500));
};

export const remove = async (req, res) => {
    // #swagger.tags = ['Categoria de stock']
    // #swagger.description = 'Endpoint para criar categoria de stock.'
    const { userId, empresa } = req.user;

    if (!(await userCanAccess(permissionGroup, "Deletar Categoria", userId))) {
        const message = "Sem permissão para apagar categorias.";
        return handleResponse(req, res, 403, [], message);
    }
    /* #swagger.responses[404] = { 
               schema: { $ref: "#/definitions/IdNo" },
               description:'Categoria não encontrada.' 
        } */

    knex(tableName)
        .update("removido", true)
        .where({
            id: req.params.id,
            removido: false,
            empresa,
        })
        .then(async (row) => {
            if (!row) {
                const message = `Categoria não encontrada.`;
                return handleResponse(req, res, 404, [], message);
            }

            /* #swagger.responses[200] = { 
               schema: { $ref: "#/definitions/idDelete" },
               description:'Categoria removida com sucesso' 
        } */

            const message = `Categoria removida com sucesso.`;

            const updated = await knex(tableName)
                .where({ id: req.params.id, empresa })
                .first();

            log({
                item_id: req.params.id,
                descricao: "Removido categoria de stock: " + updated.nome,
                tipo: 3,
                tabela: tableName,
                empresa: req.user.empresa,
                usuario_added: userId,
                usuario_updated: userId,
            });

            return handleResponse(req, res, 200, [], message);
        })
        .catch((err) => handleResponse(req, res, 500));
};

export const getLastInsertedCategoria = async (req, res) => {
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

    const { nome, descricao = "" } = req.body;

    return {
        nome,
        descricao,
        empresa,
        usuario_added,
        usuario_updated,
    };
};

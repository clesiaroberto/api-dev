import knex from "../database";
import { handleResponse } from "../utils/handleResponse";
import { userCanAccess } from "../middleware/userCanAccess";
import { log } from "../utils/log";

const permissionGroup = "Categoria de Despesa";
const tableName = "categoria_despesa";

export const add = async (req, res) => {
    const { userId } = req.user;

    if (!(await userCanAccess(permissionGroup, "Criar Categoria", userId))) {
        const message = "Sem permissão para criar categoria de despesa.";
        return handleResponse(req, res, 403, [], message);
    }
    // #swagger.tags = ['Categoria_Despesa']
    // #swagger.description = 'Cadastro de Depositos.'
    const data = dadosValidos(req);

    /* #swagger.responses[200] = { 
               schema: { $ref: "#/definitions/registerSuccess" },
               description:'Dados adicionados com sucesso' 
        } */

    const categoria = await knex(tableName).where("nome", data.nome).first();

    if (categoria) {
        return handleResponse(
            req,
            res,
            409,
            "Categoria Despesa com este nome já existe"
        );
    }

    const [created] = await knex(tableName)
        .insert(data)
        .then((id) => {
            log({
                item_id: id[0],
                descricao: "Adicionado categoria de despesa: " + data.nome,
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
        .catch((err) => handleResponse(res, res, 500, err));
};

export const updateCategoriaDespesa = async (req, res) => {
    // #swagger.tags = ['Despesa']
    // #swagger.description = 'Endpoint para actualizar dados dos Depositos.'
    const { id } = req.params;
    const { userId } = req.user;

    if (!(await userCanAccess(permissionGroup, "Editar Categoria", userId))) {
        const message = "Sem permissão para editar a categoria de despesa.";
        return handleResponse(req, res, 403, [], message);
    }
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

            log({
                item_id: id,
                descricao: "Actualizado categoria de despesa: " + data.nome,
                tipo: 2,
                tabela: tableName,
                empresa: req.user.empresa,
                usuario_added: userId,
                usuario_updated: userId,
            });

            return handleResponse(req, res, 200, { id: id });
        })
        .catch((err) => handleResponse(res, res, 500));
};

export const getAll = async (req, res) => {
    // #swagger.tags = ['Despesa']
    // #swagger.description = 'Endpoint para listar Transferencia.'
    const { empresa, userId } = req.user;

    if (!(await userCanAccess(permissionGroup, "Mostrar Categoria", userId))) {
        const message =
            "Sem permissão para visualizar as categorias de despesas.";
        return handleResponse(req, res, 403, [], message);
    }
    const Categoriadespesas = await knex(tableName).where({
        removido: false,
        empresa,
    });

    return handleResponse(req, res, 200, {
        items: Categoriadespesas,
    });
};

export const getById = async (req, res) => {
    // #swagger.tags = ['Despesa']
    // #swagger.description = 'Endpoint para listar Deposito em função do Id.'
    const { id } = req.params;
    const { empresa, userId } = req.user;

    if (
        !(await userCanAccess(permissionGroup, "Detalhes da Categoria", userId))
    ) {
        const message = "Sem permissão para visualizar a categoria de despesa.";
        return handleResponse(req, res, 403, [], message);
    }

    const categoriaDespesa = await knex(tableName)
        .where({ id, empresa, removido: false })
        .first();

    if (!categoriaDespesa) {
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

    return handleResponse(req, res, 200, { ...categoriaDespesa });
};

export const deletecategoriaDespesa = async (req, res) => {
    // #swagger.tags = ['Despesa']
    // #swagger.description = 'Endpoint para remover Depositos em função do Id.'
    const { id } = req.params;
    const { empresa, userId } = req.user;

    if (!(await userCanAccess(permissionGroup, "Deletar Categoria", userId))) {
        const message = "Sem permissão para deletar categoria de despesa.";
        return handleResponse(req, res, 403, [], message);
    }

    /* #swagger.responses[404] = {
               schema: { $ref: "#/definitions/IdNo" },
               description:'Removendo Clientes'
        } */
    knex(tableName)
        .update("removido", true)
        .where({ id, removido: false, empresa })
        .then(async (row) => {
            console.log(row);
            if (!row) {
                const message = `Registo não encontrado.`;
                return handleResponse(req, res, 404, [], message);
            }
            /* #swagger.responses[200] = {
               schema: { $ref: "#/definitions/idDelete" },
               description:'Removido com sucesso'
            } */

            const updated = await knex(tableName)
                .where({ id, empresa })
                .first();

            log({
                item_id: id,
                descricao: "Removido categoria de despesa: " + updated.nome,
                tipo: 3,
                tabela: tableName,
                empresa: req.user.empresa,
                usuario_added: userId,
                usuario_updated: userId,
            });

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

import knex from "../database";
import { handleResponse } from "../utils/handleResponse";
import { userCanAccess } from "../middleware/userCanAccess";
import { log } from "../utils/log";

const permissionGroup = "Taxas";
export const addTaxa = async (req, res) => {
    const { userId } = req.user;

    if (!(await userCanAccess(permissionGroup, "Criar taxa", userId))) {
        const message = "Sem permissão para criar taxas.";
        return handleResponse(req, res, 403, [], message);
    }
    // #swagger.tags = ['Taxa']
    // #swagger.description = 'Endpoint para cadastrar Taxa.'
    const data = dadosValidos(req);

    /* #swagger.responses[200] = { 
               schema: { $ref: "#/definitions/Taxa" },
               description:'Registado com sucesso.' 
        } */
    const checkTaxaName = await knex("taxa").where({ nome: data.nome }).first();

    if (checkTaxaName) {
        return handleResponse(req, res, 409, "Taxa com este nome já existe");
    }

    const taxa = await knex("taxa").where("nome", data.nome).first();

    if (taxa) {
        const message = `A taxa ${data.nome} já está registrada`;
        return handleResponse(req, res, 500, [], message);
    }

    knex("taxa")
        .insert(data)
        .then(async (id) => {
            const taxa = await knex("taxa").where({ id }).first();

            log({
                item_id: id[0],
                descricao:
                    "Adicionado taxa " + data.nome + ", valor: " + data.valor,
                tipo: 1,
                tabela: "taxa",
                empresa: req.user.empresa,
                usuario_added: userId,
                usuario_updated: userId,
            });

            return handleResponse(
                req,
                res,
                200,
                taxa,
                "Registado com sucesso."
            );
        })
        .catch((e) => handleResponse(req, res, 500, e));
};

export const deleteTaxa = async (req, res) => {
    const { userId } = req.user;

    if (!(await userCanAccess(permissionGroup, "Deletar taxa", userId))) {
        const message = "Sem permissão para deletar taxas.";
        return handleResponse(req, res, 403, [], message);
    }
    // #swagger.tags = ['Taxa']
    // #swagger.description = 'Endpoint para remover Taxa.'
    const { id } = req.params;
    const removido = 1;

    /* #swagger.responses[404] = { 
               schema: { $ref: "#/definitions/IdNo" },
               description:'Taxa com ID ${id} não encontrada.' 
        } */

    knex("taxa")
        .update("removido", removido)
        .where({ id, removido: false })
        .then(async (row) => {
            if (!row) {
                return handleResponse(
                    req,
                    res,
                    404,
                    [],
                    `Taxa com ID ${id} não encontrada.`
                );
            }
            /* #swagger.responses[200] = { 
               schema: { $ref: "#/definitions/idDelete" },
               description:'Taxa removida com sucesso.' 
        } */

            const data = await knex("taxa").where({ id }).first();

            log({
                item_id: id,
                descricao:
                    "Removido taxa " + data.nome + ", valor: " + data.valor,
                tipo: 3,
                tabela: "taxa",
                empresa: req.user.empresa,
                usuario_added: userId,
                usuario_updated: userId,
            });

            return handleResponse(
                req,
                res,
                200,
                [],
                `Taxa removida com sucesso.`
            );
        })
        .catch((err) => handleResponse(req, res, 500, err));
};

export const updateTaxa = async (req, res) => {
    // #swagger.tags = ['Taxa']
    // #swagger.description = 'Endpoint para actualizar Taxa.'
    const { userId } = req.user;

    if (!(await userCanAccess(permissionGroup, "Editar taxa", userId))) {
        const message = "Sem permissão para atualizar taxa.";
        return handleResponse(req, res, 403, [], message);
    }
    const { id } = req.params;
    const dados = dadosValidos(req);

    /* #swagger.responses[404] = { 
               schema: { $ref: "#/definitions/IdNo" },
               description:'Taxa com ID ${id} não encontrada.' 
        } */
    const checkTaxaName = await knex("taxa")
        .where({ nome: dados.nome })
        .first();

    if (checkTaxaName) {
        return handleResponse(req, res, 409, "Taxa com este nome já existe");
    }

    return knex("taxa")
        .update(dados)
        .where({ id, removido: false })
        .then((row) => {
            if (!row) {
                return handleResponse(
                    req,
                    res,
                    404,
                    [],
                    `Taxa com ID ${id} não encontrada.`
                );
            }
            /* #swagger.responses[200] = { 
               schema: { $ref: "#/definitions/idUpdate" },
               description:'Taxa Actualizada com sucesso.' 
        } */

            log({
                item_id: id,
                descricao:
                    "Actualizado taxa " +
                    dados.nome +
                    ", valor: " +
                    dados.valor,
                tipo: 2,
                tabela: "taxa",
                empresa: req.user.empresa,
                usuario_added: userId,
                usuario_updated: userId,
            });

            return handleResponse(
                req,
                res,
                200,
                { id },
                `Taxa Actualizada com sucesso.`
            );
        })
        .catch((err) => handleResponse(req, res, 500, err));
};

export const getAll = async (req, res) => {
    // #swagger.tags = ['Taxa']
    // #swagger.description = 'Endpoint para listar Taxa.'
    const { empresa } = req.user;
    const { userId } = req.user;

    if (!(await userCanAccess(permissionGroup, "Mostrar taxa", userId))) {
        const message = "Sem permissão para visualizar as taxas.";
        return handleResponse(req, res, 403, [], message);
    }
    const taxas = await knex("taxa").where({ removido: false, empresa });
    const response = [];
    for (var i = 0; i < taxas.length; i++) {
        const stockExists = await knex("stock")
            .select(["id"])
            .where({ taxa: taxas[i].id, removido: false })
            .first();

        response.push({ ...taxas[i], stockExists });
    }

    /* #swagger.responses[200] = { 
      schema: { $ref: "#/definitions/Taxa" },
      description:'Listando Taxas.' 
  } */
    return handleResponse(req, res, 200, response);
};

export const getById = async (req, res) => {
    const { userId } = req.user;

    if (!(await userCanAccess(permissionGroup, "Detalhes da taxa", userId))) {
        const message = "Sem permissão para visualizar a taxa.";
        return handleResponse(req, res, 403, [], message);
    }
    // #swagger.tags = ['Taxa']
    // #swagger.description = 'Endpoint para listar Taxa em função do Id.'
    const { id } = req.params;

    /* #swagger.responses[404] = { 
               schema: { $ref: "#/definitions/IdNo" },
               description:'Taxa com o ID ${id} não encontrado..' 
        } */

    if (!(await knex("taxa").where({ id, removido: false }).first())) {
        const message = `Taxa com o ID ${id} não encontrado.`;
        return handleResponse(req, res, 404, [], message);
    }

    const taxa = await knex("taxa").where("id", id).first();
    const stockExists = await knex("stock")
        .select(["id"])
        .where({ taxa: taxa.id, removido: false })
        .first();
    /* #swagger.responses[200] = { 
               schema: { $ref: "#/definitions/Taxa" },
               description:'Listando Taxa em função do Id.' 
        } */

    return handleResponse(req, res, 200, { ...taxa, stockExists });
};

export const getLastInsertedTaxa = async (req, res) => {
    // #swagger.tags = ['Documento']
    // #swagger.description = 'Endpoint para listar ultimo documento Inserido'

    const lastInserted = await knex("taxa")
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
    const { nome, valor = 0.0, percentual } = req.body;

    return {
        nome,
        valor,
        percentual,
        empresa,
        usuario_added,
        usuario_updated,
    };
};

import knex from "../database";
import { handleResponse } from "../utils/handleResponse";
import { userCanAccess } from "../middleware/userCanAccess";
import { log } from "../utils/log";

const permissionGroup = "Câmbios";

export const create = async (req, res) => {
    const { userId } = req.user;

    if (!(await userCanAccess(permissionGroup, "Criar cambio", userId))) {
        const message = "Sem permissão para criar cambio.";
        return handleResponse(req, res, 403, [], message);
    }

    // #swagger.tags = ['Cambio']
    // #swagger.description = 'Endpoint para cadastrar Cambio.'
    const data = dadosValidos(req);

    if (!(await knex("moeda").where("id", data.moeda_padrao).first())) {
        const message = `A Moeda Padrão não está cadastrada.`;
        return handleResponse(req, res, 404, [], message);
    }

    if (!(await knex("moeda").where("id", data.moeda_conversao).first())) {
        const message = `A Moeda de conversão não está cadastrada.`;
        return handleResponse(req, res, 404, [], message);
    }

    /* #swagger.responses[400] = { 
        schema: { $ref: "#/definitions/MoedaNo" },
        description:'A moeda Padrão não pode ser igual a moeda de conversão.' 
    } */

    if (data.moeda_padrao == data.moeda_conversao) {
        const message = `A moeda Padrão não pode ser igual a moeda de conversão`;
        return handleResponse(req, res, 400, [], message);
    }

    knex("cambio")
        .insert(data)
        .then(async (id) => {
            const cambio = await knex("cambio").where({ id }).first();
            await createCambioUmParaUm(data);
            /* #swagger.responses[200] = { 
               schema: { $ref: "#/definitions/registerSuccess" },
               description:'Câmbio registado com sucesso.' 
            } */
            const message = "Câmbio registado com sucesso.";

            const added = await knex("cambio")
                .select(["moeda.*"])
                .leftJoin("moeda", "cambio.moeda_padrao", "moeda.id")
                .where("cambio.moeda_padrao", data.moeda_padrao)
                .first();

            log({
                item_id: id[0],
                descricao: "Adicionado cambio de " + added.nome,
                tipo: 1,
                tabela: "cambio",
                empresa: req.user.empresa,
                usuario_added: userId,
                usuario_updated: userId,
            });

            return handleResponse(res, res, 200, cambio, message);
        })
        .catch((e) => handleResponse(res, res, 500, e));
};

export const createCambioUmParaUm = async (data) => {
    const e = await knex("empresa").where({ id: data.empresa }).first();
    const cambio = await knex("cambio")
        .where({
            moeda_padrao: e.moeda_padrao,
            moeda_conversao: e.moeda_padrao,
            empresa: data.empresa,
        })
        .first();
    try {
        if (!cambio) {
            return await knex("cambio").insert({
                empresa: data.empresa,
                usuario_added: data.usuario_added,
                usuario_updated: data.usuario_updated,
                moeda_padrao: e.moeda_padrao,
                moeda_conversao: e.moeda_padrao,
                preco_compra: 1,
                preco_venda: 1,
            });
        }

        return [cambio.id];
    } catch (error) {
        console.log(error);
    }
};

export const findById = async (req, res) => {
    // #swagger.tags = ['Cambio']
    // #swagger.description = 'Endpoint para Listar Câmbio em função do Id.'
    const { id } = req.params;
    const { userId } = req.user;

    if (!(await userCanAccess(permissionGroup, "Detalhes do cambio", userId))) {
        const message = "Sem permissão para visualizar cambio.";
        return handleResponse(req, res, 403, [], message);
    }
    const cambio = await knex("cambio").where({ id }).first();

    /* #swagger.responses[200] = { 
        schema: { $ref: "#/definitions/IdNo" },
        description:'Câmbio com o ID ${id} não encontrado.' 
    } */

    if (!cambio) {
        const message = `Câmbio não encontrado.`;
        return handleResponse(req, res, 404, [], message);
    }
    /* #swagger.responses[200] = { 
        schema: { $ref: "#/definitions/Cambio" },
        description:'Listando Câmbio por Id.' 
    } */

    const docExists = await knex("documento")
        .select(["id"])
        .where({ cambio: cambio.id })
        .first();
    const moeda_padrao = await knex("moeda")
        .select(["id", "nome", "codigo", "simbolo"])
        .where({
            id: cambio.moeda_padrao,
        })
        .first();

    const moeda_conversao = await knex("moeda")
        .select(["id", "nome", "codigo", "simbolo"])
        .where({
            id: cambio.moeda_conversao,
        })
        .first();

    return handleResponse(req, res, 200, {
        ...cambio,
        moeda_conversao,
        moeda_padrao,
        docExists,
    });
};

export const findAll = async (req, res) => {
    const { userId } = req.user;

    if (!(await userCanAccess(permissionGroup, "Mostrar cambio", userId))) {
        const message = "Sem permissão para a lista de câmbios.";
        return handleResponse(req, res, 403, [], message);
    }
    // #swagger.tags = ['Cambio']
    // #swagger.description = 'Endpoint para Listar Câmbio.'
    const response = [];
    const cambios = await knex("cambio").where({
        removido: false,
        empresa: req.user.empresa,
    });

    for (let i = 0; i < cambios.length; i++) {
        const docExists = await knex("documento")
            .select(["id"])
            .where({ cambio: cambios[i].id })
            .first();
        const moeda_conversao = await knex("moeda")
            .select(["id", "nome", "codigo", "simbolo"])
            .where({
                id: cambios[i].moeda_conversao,
            })
            .first();
        const moeda_padrao = await knex("moeda")
            .select(["id", "nome", "codigo", "simbolo"])
            .where({
                id: cambios[i].moeda_padrao,
            })
            .first();

        response.push({
            ...cambios[i],
            moeda_conversao,
            moeda_padrao,
            docExists,
        });
    }

    return handleResponse(req, res, 200, response);
};

export const update = async (req, res) => {
    // #swagger.tags = ['Cambio']
    // #swagger.description = 'Endpoint para actualizar Câmbio'
    const { id } = req.params;
    const { empresa, userId } = req.user;

    if (!(await userCanAccess(permissionGroup, "Editar cambio", userId))) {
        const message = "Sem permissão para editar cambio.";
        return handleResponse(req, res, 403, [], message);
    }

    const data = dadosValidos(req);
    data.usuario_added = undefined;

    /* #swagger.responses[400] = { 
      schema: { $ref: "#/definitions/InvalidValue" },
      description:'Valor introduzido inválido.' 
  } */

    if (!(await knex("cambio").where({ id }).first())) {
        const message = `Câmbio não encontrado.`;
        return handleResponse(req, res, 404, [], message);
    }

    const moedaPadrao = await knex("moeda")
        .where("id", data.moeda_padrao)
        .first();
    const moedaConversao = await knex("moeda")
        .where("id", data.moeda_conversao)
        .first();

    if (!moedaPadrao) {
        const message = ` A Moeda Padrão não está cadastrada.`;
        return handleResponse(req, res, 404, [], message);
    }

    if (!moedaConversao) {
        const message = ` A Moeda de conversão não está cadastrada.`;
        return handleResponse(req, res, 404, [], message);
    }

    if (data.moeda_padrao == data.moeda_conversao) {
        const message = `A moeda Padrão não pode ser igual a moeda de conversão`;
        return handleResponse(req, res, 400, [], message);
    }

    /* #swagger.responses[200] = { 
      schema: { $ref: "#/definitions/idUpdate" },
      description:'Dados atualizados com sucesso.' 
    } */

    await knex("cambio").update(data).where({ id });

    const updated = await knex("cambio")
        .select(["moeda.*"])
        .leftJoin("moeda", "cambio.moeda_padrao", "moeda.id")
        .where("cambio.moeda_padrao", id)
        .first();

    log({
        item_id: id,
        descricao: "Actualizado cambio de " + updated.nome,
        tipo: 2,
        tabela: "cambio",
        empresa,
        usuario_added: userId,
        usuario_updated: userId,
    });

    return handleResponse(req, res, 200, { id: id });
};

export const remove = async (req, res) => {
    // #swagger.tags = ['Cambio']
    // #swagger.description = 'Endpoint para Remover Câmbio.'
    const { id } = req.params;
    const { userId, empresa } = req.user;

    if (!(await userCanAccess(permissionGroup, "Deletar cambio", userId))) {
        const message = "Sem permissão para deletar cambio.";
        return handleResponse(req, res, 403, [], message);
    }
    const removido = 1;
    /* #swagger.responses[404] = { 
        schema: { $ref: "#/definitions/idUpdate" },
        description:'Câmbio com o ID ${id} não encontrado.' 
      } */
    if (
        !(await knex("cambio")
            .where({ id, removido: false })
            .update("removido", removido))
    ) {
        const message = `Câmbio com o ID ${id} não encontrado.`;
        return handleResponse(req, res, 404, [], message);
    }

    /* #swagger.responses[200] = { 
         schema: { $ref: "#/definitions/idDelete" },
         description:'Dados removidos com sucesso.' 
    } */

    const updated = await knex("cambio")
        .select(["moeda.*"])
        .leftJoin("moeda", "cambio.moeda_padrao", "moeda.id")
        .where("cambio.id", id)
        .first();

    log({
        item_id: id,
        descricao: "Removido cambio de" + updated.nome,
        tipo: 3,
        tabela: "cambio",
        empresa,
        usuario_added: userId,
        usuario_updated: userId,
    });

    return handleResponse(res, res, 200, {}, "Dados removidos com sucesso");
};

const dadosValidos = (req) => {
    const usuario_added = req.userId;
    const usuario_updated = req.userId;
    const { empresa } = req.user;
    const {
        moeda_padrao,
        moeda_conversao,
        preco_compra = 0,
        preco_venda = 0,
    } = req.body;

    return {
        moeda_padrao,
        moeda_conversao,
        preco_compra: replaceComma(preco_compra),
        preco_venda: replaceComma(preco_venda),
        empresa,
        usuario_added,
        usuario_updated,
    };
};

export const getLastInsertedCambio = async (req, res) => {
    // #swagger.tags = ['Documento']
    // #swagger.description = 'Endpoint para listar ultimo documento Inserido'

    const lastInserted = await knex("cambio")
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

const replaceComma = (num) => parseFloat(String(num).replace(/,/g, ""));

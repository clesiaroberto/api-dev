import knex from "../database";
import XLSX from "xlsx";
import { handleResponse } from "../utils/handleResponse";
import { userCanAccess } from "../middleware/userCanAccess";
import { log } from "../utils/log";
import { formatCurrency } from "../helper/FormatCurrency";

const permissionGroup = "Entidades";
const tableName = "entidade";

export const all = async (req, res) => {
    const { userId } = req.user;
    const response = [];
    if (!(await userCanAccess(permissionGroup, "Mostrar Entidade", userId))) {
        const message = "Sem permissão para visualizar as entidades.";
        return handleResponse(req, res, 403, [], message);
    }
    // #swagger.tags = ['Entidade']
    // #swagger.description = 'Endpoint para listar todas as entidades.'
    const { empresa } = req.user;
    const { activo } = req.query;
    let entidades = await knex(tableName).where({
        removido: false,
        empresa,
    });

    if (activo) {
        entidades = await knex(tableName).where({
            removido: false,
            empresa,
            activo,
        });
    }

    for (let i = 0; i < entidades.length; i++) {
        const docExists = await knex("documento")
            .select(["id"])
            .where({ entidade: entidades[i].id, removido: false })
            .first();
        response.push({
            ...entidades[i],
            docExists,
        });
    }

    /* #swagger.responses[200] = { 
               schema: { $ref: "#/definitions/Entidade" },
               description:'Listando Entidades' 
        } */
    return handleResponse(req, res, 200, {
        items: response,
    });
};

export const findById = async (req, res) => {
    const { userId } = req.user;

    if (
        !(await userCanAccess(permissionGroup, "Detalhes da Entidade", userId))
    ) {
        const message = "Sem permissão para visualizar a entidade.";
        return handleResponse(req, res, 403, [], message);
    }
    // #swagger.tags = ['Entidade']
    // #swagger.description = 'Endpoint para listar entidades em função do Id.'
    const { empresa } = req.user;
    const { id } = req.params;
    const entidade = await knex(tableName)
        .where({ id, removido: false, empresa })
        .first();

    /* #swagger.responses[404] = { 
               schema: { $ref: "#/definitions/IdNo" },
               description:'Entidade não encontrada.' 
        } */

    if (!entidade) {
        return handleResponse(req, res, 404, [], `Entidade não encontrada.`);
    }

    /* #swagger.responses[200] = { 
        schema: { $ref: "#/definitions/Entidade" },
        description:'Listando Entidade em função do Id.' 
    } */
    const docExists = await knex("documento")
        .select(["id"])
        .where({ entidade: entidade.id, removido: false })
        .first();
    return handleResponse(req, res, 200, { ...entidade, docExists });
};

export const findByName = async (req, res) => {
    const { userId } = req.user;

    if (
        !(await userCanAccess(permissionGroup, "Detalhes da Entidade", userId))
    ) {
        const message = "Sem permissão para visualizar a entidade.";
        return handleResponse(req, res, 403, [], message);
    }
    // #swagger.tags = ['Entidade']
    // #swagger.description = 'Endpoint para listar entidades em função do Nome.'
    const { empresa } = req.user;
    const { name } = req.params;
    const entidade = await knex(tableName)
        .where({ nome: name, removido: false, empresa })
        .first();
    /* #swagger.responses[404] = { 
               schema: { $ref: "#/definitions/NameNo" },
               description:'Entidade ${name} não encontrada.' 
        } */

    if (!entidade) {
        return handleResponse(
            req,
            res,
            404,
            [],
            `Entidade ${name} não encontrada.`
        );
    }
    /* #swagger.responses[200] = { 
               schema: { $ref: "#/definitions/Entidade" },
               description:'Listando Entidade.' 
        } */
    return handleResponse(req, res, 200, entidade);
};

export const AllRemoved = async (req, res) => {
    // #swagger.tags = ['Entidade']
    // #swagger.description = 'Endpoint para listar entidades com estado removido true (1).'
    const { empresa } = req.user;
    let { page = 1, perPage = 10, q = "" } = req.query;
    page = page <= 0 ? 1 : page;

    const count = await knex(tableName)
        .where({ removido: true, empresa })
        .count("id as total");

    const entidades = await knex(tableName)
        .where({ removido: true, empresa })
        .where("nome", "like", `%${q}%`)
        .limit(perPage)
        .offset((page - 1) * perPage);

    /* #swagger.responses[200] = { 
               schema: { $ref: "#/definitions/Entidade" },
               description:'Listando Entidade em função do Estado.' 
        } */

    res.setHeader("X-Total-Count", count[0].total);
    return handleResponse(req, res, 200, {
        page: page,
        per_page: perPage,
        total: count[0].total,
        items: entidades,
    });
};

export const create = async (req, res) => {
    const { userId } = req.user;

    if (!(await userCanAccess(permissionGroup, "Criar Entidade", userId))) {
        const message = "Sem permissão para criar as entidades.";
        return handleResponse(req, res, 403, [], message);
    }
    // #swagger.tags = ['Entidade']
    // #swagger.description = 'Endpoint para cadastrar entidades.'
    const data = dadosValidos(req);
    /* #swagger.parameters['Entidade'] = {
               in: 'body',
               description: 'Informações da Entidade.',
               required: true,
               type: 'object',
               schema: { $ref: "#/definitions/Entidade" }
        } */

    /* #swagger.responses[409] = { 
               schema: { $ref: "#/definitions/emailNo" },
               description:'Entidade com e-mail ${email} já está registada' 
        } */

    if (
        data.email &&
        (await knex(tableName)
            .where({
                email: data.email,
                empresa: data.empresa,
                removido: false,
            })
            .first())
    ) {
        return handleResponse(
            req,
            res,
            409,
            [],
            `Entidade com e-mail ${data.email} já está registada`
        );
    }

    /* #swagger.responses[200] = { 
               schema: { $ref: "#/definitions/registerSuccess" },
               description:'Dados adicionados com sucesso.' 
        } */

    return knex(tableName)
        .insert(data)
        .then(async (id) => {
            const tipo = await knex("tipo_entidade")
                .where({ id: data.tipo_entidade })
                .first();
            const message = tipo
                ? `Adicionado entidade ${data.nome} tipo de entidade ${tipo.nome}`
                : `Adicionado entidade ${data.nome} `;
            log({
                item_id: id,
                descricao: message,
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
                "Dados adicionados com sucesso."
            );
        })
        .catch((err) => {
            console.log(err);
            handleResponse(res, res, 500, err);
        });
};

export const update = async (req, res) => {
    const { userId } = req.user;

    if (!(await userCanAccess(permissionGroup, "Editar Entidade", userId))) {
        const message = "Sem permissão para editar as entidades.";
        return handleResponse(req, res, 403, [], message);
    }
    // #swagger.tags = ['Entidade']
    // #swagger.description = 'Endpoint para actualizar entidades.'
    const { id } = req.params;
    const data = dadosValidos(req);

    /* #swagger.parameters['Entidade'] = {
               in: 'body',
               description: 'Informações da Entidade.',
               required: true,
               type: 'object',
               schema: { $ref: "#/definitions/Entidade" }
        } */

    /* #swagger.responses[404] = { 
               schema: { $ref: "#/definitions/IdNo" },
               description:'Registo não encontrado' 
        } */

    const [updated] = await knex(tableName)
        .update(data)
        .where({ id, removido: false, empresa: data.empresa })
        .then(async (row) => {
            if (!row) {
                const message = "Registo não encontrado.";
                return handleResponse(req, res, 404, [], message);
            }
            /* #swagger.responses[200] = { 
               schema: { $ref: "#/definitions/idUpdate" },
               description:'Atualizado com sucesso.' 
        } */
            const message = "Atualizado com sucesso.";

            const tipo = await knex("tipo_entidade")
                .where({ id: data.tipo_entidade })
                .first();
            const messages = tipo
                ? `Adicionado entidade ${data.nome} tipo de entidade ${tipo.nome}`
                : `Adicionado entidade ${data.nome} `;

            log({
                item_id: id,
                descricao: messages,
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

export const remove = async (req, res) => {
    const { userId } = req.user;

    if (!(await userCanAccess(permissionGroup, "Deletar Entidade", userId))) {
        const message = "Sem permissão para deletar as entidades.";
        return handleResponse(req, res, 403, [], message);
    }
    // #swagger.tags = ['Entidade']
    // #swagger.description = 'Endpoint para remover entidades.'
    const { id } = req.params;
    const { empresa } = req.user;

    /* #swagger.responses[404] = { 
               schema: { $ref: "#/definitions/IdNo" },
               description:'Registo não encontrado.' 
        } */

    const data = await knex(tableName).where({ id, empresa }).first();

    knex(tableName)
        .update("removido", true)
        .where({ id, removido: false, empresa })
        .then(async (row) => {
            if (!row) {
                const message = `Registo não encontrado.`;
                return handleResponse(req, res, 404, [], message);
            }

            /* #swagger.responses[200] = { 
               schema: { $ref: "#/definitions/idDelete" },
               description:'Removido com sucesso' 
            } */

            log({
                item_id: id,
                descricao: "Removido entidade " + data.nome,
                tipo: 3,
                tabela: tableName,
                empresa: req.user.empresa,
                usuario_added: userId,
                usuario_updated: userId,
            });

            return handleResponse(req, res, 200, [], `Removido com sucesso.`);
        })
        .catch((err) => {
            console.log(err);
            handleResponse(req, res, 500, err);
        });
};

export const excelEntidade = async (req, res) => {
    // #swagger.tags = ['Entidade']
    // #swagger.description = 'Listagem de Entidades em Excel.'
    const { from = "", to = "" } = req.body;

    let header = [
        "Id",
        "Nome",
        "Email",
        "Contacto1",
        "Contacto2",
        "Nuit",
        "Endereço",
        "Tipo_entidade",
        "Empresa",
        "Data",
    ];

    const data = [header];

    const entidades = await knex("entidade")
        .where({ removido: false })
        .whereBetween("data_added", [from, to]);

    for (let i = 0; i < entidades.length; i++) {
        const checkEmpresaId = await knex("empresa")
            .where({ id: entidades[i].empresa })
            .first();

        data.push([
            entidades[i].id,
            entidades[i].nome,
            entidades[i].email,
            entidades[i].contacto1,
            entidades[i].contacto2,
            entidades[i].nuit,
            entidades[i].endereco,
            entidades[i].tipo_entidade,
            checkEmpresaId.nome,
            entidades[i].data_added,
        ]);
        console.log(data);
    }

    var ws = XLSX.utils.aoa_to_sheet(data);
    var wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "SheetJS");
    var buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    res.setHeader("Content-Type", "application/vnd.ms-excel");
    res.setHeader("content-disposition", "attachment; filename=export.xls");
    res.send(buf);
};

const dadosValidos = (req) => {
    const usuario_added = req.userId;
    const usuario_updated = req.userId;
    const { empresa } = req.user;

    const {
        nome,
        email = "",
        contacto1,
        contacto2 = "",
        tipo_entidade,
        endereco = "",
        activo = 1,
        nuit,
    } = req.body;

    return {
        nome,
        email,
        contacto1,
        contacto2,
        tipo_entidade: tipo_entidade == "" ? null : tipo_entidade,
        endereco,
        activo,
        empresa,
        nuit: nuit == "" ? null : nuit,
        usuario_added,
        usuario_updated,
    };
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

export const getTipoDoc = async (req, res) => {
    const { entidade, tipo_doc } = req.params;

    var entidadeDoc = await knex("documento").where({
        entidade,
        tipo_doc,
        empresa: req.user.empresa,
        removido: false,
    });

    let document = [];

    if (
        !(await knex("documento")
            .where({
                entidade,
                tipo_doc,
                empresa: req.user.empresa,
                removido: false,
            })
            .first())
    ) {
        const message = "Registo não encontrado";
        return handleResponse(req, res, 404, message);
    }
    for (let i = 0; i < entidadeDoc.length; i++) {
        let total = 0;
        const documentoItems = await knex("documento_item").where({
            documento: entidadeDoc[i].id,
        });

        const moedaPadrao = await knex("moeda")
            .select(["codigo"])
            .where({ id: entidadeDoc[i].moeda_padrao })
            .first();

        documentoItems.map(async (item) => {
            const taxa = await knex("taxa")
                .select(["id", "valor"])
                .where({ id: item.taxa })
                .first();

            total +=
                item.preco * item.quantidade +
                (item.preco * item.quantidade * taxa.valor) / 100 +
                (item.preco * item.quantidade * item.desconto) / 100;
        });
        document.push({
            ...entidadeDoc[i],
            referencia: numeroDocFormat(entidadeDoc[i]),
            total: formatCurrency(total) + " " + moedaPadrao.codigo,
        });
    }
    return handleResponse(req, res, 200, document);
};

export const numeroDocFormat = (entidadeDoc) => {
    return `${entidadeDoc.prefixo}-${("0000" + entidadeDoc.numero).slice(
        -4
    )}/${new Date(entidadeDoc.data_added).getFullYear()}`;
};

import knex from "../database";
import { handleResponse } from "../utils/handleResponse";
import { userCanAccess } from "../middleware/userCanAccess";
import { log } from "../utils/log";

const permissionGroup = "Tipo de Documento";
const tableName = "tipo_doc";

export const addTipoDoc = async (req, res) => {
    const { userId } = req.user;

    if (
        !(await userCanAccess(
            permissionGroup,
            "Criar tipo de documento",
            userId
        ))
    ) {
        const message = "Sem permissão para Criar tipo de documento.";
        return handleResponse(req, res, 403, [], message);
    }
    // #swagger.tags = ['Tipo de Documento']
    // #swagger.description = 'Endpoint para criar Tipo de documento'
    const data = dadosValidos(req);

    /* #swagger.responses[409] = { 
        schema: { $ref: "#/definitions/TipoDocYes" },
        description:'Tipo de documento já registado.' 
    } */
    if (
        await knex(tableName)
            .where({
                nome: data.nome,
                prefixo: data.prefixo,
                categoria: data.categoria,
                empresa: data.empresa,
                removido: false,
            })
            .first()
    ) {
        const message = "Tipo de documento já registado.";
        return handleResponse(req, res, 409, [], message);
    }

    try {
        const [tipo_doc_config] = await knex("tipo_doc_config").insert({
            move_stock: data.move_stock,
            move_conta_corrente: data.move_conta_corrente,
            move_a_credito: data.move_a_credito,
            requer_recibo: data.requer_recibo,
            transfere_stock: data.transfere_stock,
            move_stock_entrada: data.move_stock_entrada,
            referencia_documento: data.referencia_documento,
            empresa: data.empresa,
            usuario_added: data.usuario_added,
            usuario_updated: data.usuario_updated,
        });

        /* #swagger.responses[200] = { 
            schema: { $ref: "#/definitions/Tipo_Doc" },
            description:'Dados adicionados com sucesso.' 
        } */

        const [created] = await knex(tableName).insert({
            nome: data.nome,
            prefixo: data.prefixo,
            categoria: data.categoria,
            descricao: data.descricao,
            tipo_doc_config,
            empresa: data.empresa,
            usuario_added: data.usuario_added,
            usuario_updated: data.usuario_updated,
        });
        const message = "Dados adicionados com sucesso";

        log({
            item_id: created,
            descricao: "Adicionado tipo de documento " + data.prefixo,
            tipo: 1,
            tabela: tableName,
            empresa: req.user.empresa,
            usuario_added: userId,
            usuario_updated: userId,
        });

        return handleResponse(req, res, 200, { id: created }, message);
    } catch (error) {
        return handleResponse(req, res, 500, error);
    }
};

export const updateTipoDoc = async (req, res) => {
    // #swagger.tags = ['Tipo de Documento']
    // #swagger.description = 'Endpoint para criar Tipo de documento'
    const { userId } = req.user;

    if (
        !(await userCanAccess(
            permissionGroup,
            "Editar tipo de documento",
            userId
        ))
    ) {
        const message = "Sem permissão para atualizar tipo de documento.";
        return handleResponse(req, res, 403, [], message);
    }
    const { id } = req.params;
    const data = dadosValidos(req);

    try {
        const tipoDoc = await knex(tableName).where({ id }).first();
        if (!tipoDoc) {
            const message = "Tipo de documento não encontrado.";
            return handleResponse(req, res, 400, message);
        }

        await knex("tipo_doc_config")
            .update({
                move_stock: data.move_stock,
                move_conta_corrente: data.move_conta_corrente,
                move_a_credito: data.move_a_credito,
                requer_recibo: data.requer_recibo,
                transfere_stock: data.transfere_stock,
                move_stock_entrada: data.move_stock_entrada,
                referencia_documento: data.referencia_documento,
                usuario_updated: data.usuario_updated,
            })
            .where({ id: tipoDoc.tipo_doc_config });

        /* #swagger.responses[200] = { 
            schema: { $ref: "#/definitions/Tipo_Doc" },
            description:'Dados adicionados com sucesso.' 
        } */

        await knex(tableName)
            .update({
                nome: data.nome,
                prefixo: data.prefixo,
                categoria: data.categoria,
                descricao: data.descricao,
                tipo_doc_config: tipoDoc.tipo_doc_config,
                usuario_updated: data.usuario_updated,
            })
            .where({ id });

        const message = "Dados atualizados com sucesso";

        log({
            item_id: id,
            descricao: "Actualizado tipo de documento " + data.prefixo,
            tipo: 2,
            tabela: tableName,
            empresa: req.user.empresa,
            usuario_added: userId,
            usuario_updated: userId,
        });

        return handleResponse(req, res, 200, { id: id }, message);
    } catch (error) {
        return handleResponse(req, res, 500, error);
    }
};

export const deleteTipoDoc = async (req, res) => {
    const { userId } = req.user;

    if (
        !(await userCanAccess(
            permissionGroup,
            "Deletar tipo de documento",
            userId
        ))
    ) {
        const message = "Sem permissão para deletar tipo de documento.";
        return handleResponse(req, res, 403, [], message);
    }
    // #swagger.tags = ['Tipo de Documento']
    // #swagger.description = 'Endpoint para remover Tipo de documento'
    const { id } = req.params;
    const { empresa } = req.user;

    const doctype = await knex(tableName).where({ id, empresa }).first();

    return knex(tableName)
        .update({ removido: true })
        .where({ id, empresa })
        .then((row) => {
            if (!row) {
                const message = ` Tipo de documento não encontrado.`;
                return handleResponse(req, res, 404, [], message);
            }

            /* #swagger.responses[200] = { 
                schema: { $ref: "#/definitions/idDelete" },
                description:'Tipo de documento removido com sucesso.' 
            } 
            */
            const message = "`Tipo de documento removido com sucesso.`";

            console.log(doctype);

            log({
                item_id: id,
                descricao: "Removido tipo de documento " + doctype.prefixo,
                tipo: 2,
                tabela: tableName,
                empresa: req.user.empresa,
                usuario_added: userId,
                usuario_updated: userId,
            });

            return handleResponse(req, res, 200, [], message);
        })
        .catch((err) => handleResponse(req, res, 500, err));
};

export const getAll = async (req, res) => {
    const { userId } = req.user;

    if (
        !(await userCanAccess(
            permissionGroup,
            "Mostrar tipo de documento",
            userId
        ))
    ) {
        const message = "Sem permissão para visualizar os tipos de documentos.";
        return handleResponse(req, res, 403, [], message);
    }
    // #swagger.tags = ['Tipo de Documento']
    // #swagger.description = 'Endpoint para listar todos os Tipos de documento'
    const response = [];
    const { empresa } = req.user;
    const tipoDoc = await knex(tableName)
        .where({ removido: false, empresa })
        .orderBy("data_added", "DESC");

    for (let i = 0; i < tipoDoc.length; i++) {
        let categoria = "Venda";

        if (tipoDoc[i].categoria == 1) {
            categoria = "Compra";
        } else if (tipoDoc[i].categoria == 2) {
            categoria = "Documento Interno";
        }

        const docConfig = await knex("tipo_doc_config")
            .where({
                removido: false,
                id: tipoDoc[i].tipo_doc_config,
            })
            .first();

        const docExists = await knex("documento")
            .select(["id"])
            .where({ tipo_doc: tipoDoc[i].id })
            .first();

        response.push({
            ...tipoDoc[i],
            categoria,
            docConfig,
            docExists,
        });
    }
    /* #swagger.responses[200] = { 
        schema: { $ref: "#/definitions/Tipo_Doc" },
        description:'Listando Tipo de documento.' 
    } */

    return handleResponse(req, res, 200, response);
};

export const getById = async (req, res) => {
    const { userId } = req.user;

    if (
        !(await userCanAccess(
            permissionGroup,
            "Detalhes do tipo de documento",
            userId
        ))
    ) {
        const message = "Sem permissão para visualizar o tipo de documento.";
        return handleResponse(req, res, 403, [], message);
    }
    const { id } = req.params;
    const { empresa } = req.user;

    // #swagger.tags = ['Tipo de Documento']
    // #swagger.description = 'Endpoint para listar Tipos de documento em função do Id'

    /* #swagger.responses[404] = { 
        schema: { $ref: "#/definitions/IdNo" },
        description:'Tipo de documento com o ID ${id} não encontrado.' 
    } */

    const tipo_doc = await knex("tipo_doc")
        .where({ id, removido: false, empresa })
        .first();
    if (!tipo_doc) {
        const message = `Tipo de documento não encontrado.`;
        return handleResponse(req, res, 404, [], message);
    }

    const tipo_doc_config = await knex("tipo_doc_config")
        .where({ id: tipo_doc.tipo_doc_config })
        .first();

    /* #swagger.responses[404] = { 
        schema: { $ref: "#/definitions/Tipo_Doc" },
        description:'Listando Tipo de Documento por Id.' 
    } */

    return handleResponse(req, res, 200, { ...tipo_doc, tipo_doc_config });
};

export const getByCategoriaId = async (req, res) => {
    const { categoria } = req.params;
    const { empresa } = req.user;
    const { userId } = req.user;

    if (
        !(await userCanAccess(
            permissionGroup,
            "Detalhes do tipo de documento",
            userId
        ))
    ) {
        const message = "Sem permissão para visualizar o tipo de documento.";
        return handleResponse(req, res, 403, [], message);
    }
    // #swagger.tags = ['Tipo de Documento']
    // #swagger.description = 'Endpoint para listar Tipos de documento em função do Id'

    const tipo_doc = await knex("tipo_doc").where({
        categoria,
        removido: false,
        empresa,
    });

    /* #swagger.responses[200] = { 
        schema: { $ref: "#/definitions/Tipo_Doc" },
        description:'Listando Tipo de Documento por Id.' 
    } */

    return handleResponse(req, res, 200, tipo_doc);
};

const dadosValidos = (req) => {
    const usuario_added = req.userId;
    const usuario_updated = req.userId;
    const { empresa } = req.user;

    const {
        nome,
        prefixo,
        categoria,
        descricao,
        move_stock,
        move_conta_corrente,
        move_a_credito,
        requer_recibo,
        transfere_stock,
        move_stock_entrada,
        referencia_documento,
    } = req.body;

    return {
        nome,
        prefixo: prefixo.toUpperCase(),
        categoria,
        descricao,
        move_stock,
        move_conta_corrente,
        move_a_credito,
        requer_recibo,
        transfere_stock: move_stock ? transfere_stock : 0,
        move_stock_entrada: move_stock ? move_stock_entrada : 0,
        referencia_documento,
        empresa,
        usuario_added,
        usuario_updated,
    };
};

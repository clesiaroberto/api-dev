import knex from "../database";
import { handleResponse } from "../utils/handleResponse";

export const create = async (req, res) => {
    const dados = dataValid(req);

    const tipodocConfig = await knex("tipo_doc_config").insert(data);

    return handleResponse(
        req,
        res,
        200,
        await knex("tipo_doc_config").where("id", tipodocConfig).first(),
        "Adicionado com Sucesso!"
    );
};

export const updateTipoDoc_config = async (req, res) => {
    const { id } = req.params;
    const dados = dadosValidos(req);

    await knex("tipo_doc_config")
        .update(dados)
        .where({ id, removido: false })
        .then((row) => {
            if (!row) {
                return handleResponse(
                    req,
                    res,
                    404,
                    [],
                    `Tipo de documento com o Id ${id} não encontrado`
                );
            }

            return handleResponse(
                req,
                res,
                200,
                { id: id },
                `Actualizado com sucesso.`
            );
        })
        .catch((err) => handleResponse(req, res, 500, err));
};

export const deleteTipoDoc_config = async (req, res) => {
    const { id } = req.params;
    const removido = 1;

    knex("tipo_doc_config")
        .update("removido", removido)
        .where({ id, removido: false })
        .then((row) => {
            if (!row) {
                return handleResponse(
                    req,
                    res,
                    404,
                    [],
                    ` Tipo de documento com ID ${id} não encontrado.`
                );
            }

            return handleResponse(
                req,
                res,
                200,
                [],
                `Tipo de documento removido com sucesso.`
            );
        })
        .catch((err) => handleResponse(req, res, 500, err));
};

export const getAll = async (req, res) => {
    const AllTipoDocConfig = await knex("tipo_doc_config").where({
        removido: false,
    });

    return handleResponse(req, res, 200, AllTipoDocConfig);
};

export const getById = async (req, res) => {
    const { id } = req.params;

    if (
        !(await knex("tipo_doc_config").where({ id, removido: false }).first())
    ) {
        const message = `Tipo de documento com o ID ${id} não encontrado.`;
        return handleResponse(req, res, 404, [], message);
    }

    let AllTipoDocConfig = await knex("tipo_doc_config").where("id", id);

    return handleResponse(req, res, 200, AllTipoDocConfig);
};

const dataValid = (req) => {
    const usuario_added = req.userId;
    const usuario_updated = req.userId;
    const empresa = req.empresaId;
    const tipo_doc = tipodoc.id;
    const {
        move_stock,
        move_conta_corrente,
        move_a_credito,
        requer_recibo,
        transfere_stock,
        move_stock_entrada,
    } = req.body;

    return {
        tipo_doc,
        move_stock,
        move_conta_corrente,
        move_a_credito,
        requer_recibo,
        transfere_stock: move_stock ? transfere_stock : 0,
        move_stock_entrada: move_stock ? move_stock_entrada : 0,
        empresa,
        usuario_added,
        usuario_updated,
        removido,
    };
};

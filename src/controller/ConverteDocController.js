import knex from "../database";
import { userCanAccess } from "../middleware/userCanAccess";
import { handleResponse } from "../utils/handleResponse";

const tableName = "conversao_doc";

export const all = async (req, res) => {};

export const convert = async (req, res) => {
    // #swagger.tags = ['Conversão de Documentos']
    // #swagger.description = 'Endpoint para converter documentos'
    const { empresa } = req.user;
    const { userId } = req.user;

    if (!(await userCanAccess("Documentos", "Converter Documento", userId))) {
        const message = "Sem permissão para Converter Documento.";
        return handleResponse(req, res, 403, [], message);
    }

    const { documento_origem, tipo_doc } = req.body;

    try {
        const documentoOrigem = await knex("documento")
            .where({ id: documento_origem, empresa })
            .first();

        if (!documentoOrigem) {
            const message = "Documento não encontrado.";
            return handleResponse(req, res, 404, [], message);
        }

        const tipoDocDestino = await knex("tipo_doc")
            .where({ id: tipo_doc, empresa })
            .first();

        if (!tipoDocDestino) {
            const message = "Tipo de documento destino não encontrado.";
            return handleResponse(req, res, 404, [], message);
        }

        const tipoDocOrigem = await knex("tipo_doc")
            .where({ id: documentoOrigem.tipo_doc })
            .first();

        if (tipoDocDestino.categoria != tipoDocOrigem.categoria) {
            const message = "A categoria dos documentos não é a mesma.";
            return handleResponse(req, res, 404, [], message);
        }

        documentoOrigem.id = undefined;
        documentoOrigem.usuario_added = undefined;
        documentoOrigem.usuario_updated = undefined;
        documentoOrigem.data_added = undefined;
        documentoOrigem.data_updated = undefined;

        const lastDocInserted = await knex("documento")
            .where({ tipo_doc })
            .orderBy("data_added", "DESC")
            .first();
        let numeroDoc = 1;
        if (lastDocInserted) {
            numeroDoc =
                lastDocInserted.numero != null ? lastDocInserted.numero + 1 : 1;
        }
        const [documentoDestino] = await knex("documento").insert({
            ...documentoOrigem,
            cancelado: false,
            numero: numeroDoc,
            prefixo: tipoDocDestino.prefixo,
            nome: tipoDocDestino.nome,
            tipo_doc,
            usuario_added: req.userId,
            usuario_updated: req.userId,
        });

        const documentoItems = await knex("documento_item").where({
            documento: documento_origem,
        });

        documentoItems.map(async (documentItem) => {
            documentItem.id = undefined;
            documentItem.usuario_added = undefined;
            documentItem.usuario_updated = undefined;
            try {
                await knex("documento_item").insert({
                    ...documentItem,
                    documento: documentoDestino,
                    usuario_added: req.userId,
                    usuario_updated: req.userId,
                });
            } catch (error) {}
        });

        await knex(tableName).insert({
            documento_origem,
            documento_final: documentoDestino,
            empresa,
            usuario_added: req.userId,
            usuario_updated: req.userId,
        });
        const message = "Documento convertido com sucesso";
        return handleResponse(req, res, 200, documentoDestino, message);
    } catch (error) {
        return handleResponse(req, res, 500, error);
    }
};

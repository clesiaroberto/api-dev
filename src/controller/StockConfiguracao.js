import knex from "../database";
import { handleResponse } from "../utils/handleResponse";
import { userCanAccess } from "../middleware/userCanAccess";
import { log } from "../utils/log";

const permissionGroup = "Configurações do Stock";
const tableName = "stock_configuracao";

export const createReferenciaAutomatica = async (req, res) => {
    const { empresa, userId } = req.user;

    if (!(await userCanAccess(permissionGroup, "Criar configuração", userId))) {
        const message = "Sem permissão para criar configuração de stock.";
        return handleResponse(req, res, 403, [], message);
    }
    const { referencia_automatica, prefixo = "" } = req.body;

    try {
        const stockConfig = await knex(tableName).where({ empresa }).first();

        if (stockConfig) {
            await knex(tableName)
                .update({
                    referencia_automatica,
                    prefixo,
                    usuario_updated: userId,
                })
                .where({ id: stockConfig.id });
            const message = "Configuração de stock já está registada.";
            return handleResponse(req, res, 200, stockConfig, message);
        }

        const [id] = await knex(tableName).insert({
            referencia_automatica: Boolean(referencia_automatica),
            empresa,
            prefixo,
            usuario_added: userId,
            usuario_updated: userId,
        });

        const message = "Configuração criada com sucesso.";

        log({
            item_id: id,
            descricao: "Configuração criada",
            tipo: 1,
            tabela: tableName,
            empresa: req.user.empresa,
            usuario_added: userId,
            usuario_updated: userId,
        });

        return handleResponse(req, res, 200, { id }, message);
    } catch (error) {
        console.log(error);
        return handleResponse(req, res, 500, error);
    }
};

export const referenciaAutomatica = async (req, res) => {
    const { empresa } = req.user;
    try {
        const stockConfig = await knex(tableName).where({ empresa }).first();
        if (stockConfig) return handleResponse(req, res, 200, stockConfig);
        return handleResponse(req, res, 200, { referencia_automatica: false });
    } catch (error) {
        return handleResponse(req, res, 500, error);
    }
};

export const configuracoesPorId = async (req, res) => {
    const { empresa } = req.user;
    const { id } = req.params;
    try {
        const stockConfig = await knex(tableName)
            .where({ empresa, id })
            .first();
        if (!stockConfig) {
            const message = "";
            return handleResponse(req, res, 404, {}, message);
        }
        return handleResponse(req, res, 200, stockConfig);
    } catch (error) {
        return handleResponse(req, res, 500, error);
    }
};

export const updateReferenciaAutomatica = async (req, res) => {
    const { empresa, userId } = req.user;

    if (
        !(await userCanAccess(permissionGroup, "Editar configuração", userId))
    ) {
        const message = "Sem permissão para editar configuração de stock.";
        return handleResponse(req, res, 403, [], message);
    }
    const { referencia_automatica, prefixo = "" } = req.body;
    const { id } = req.params;

    try {
        if (!(await knex(tableName).where({ id, empresa }).first())) {
            const message = "Configuração não encontrada.";
            return handleResponse(req, res, 404, {}, message);
        }
        await knex(tableName)
            .update({
                referencia_automatica: Boolean(referencia_automatica),
                prefixo,
                usuario_updated: userId,
            })
            .where({ id });

        const message = "Configuração atualizada com sucesso.";

        log({
            item_id: id,
            descricao: `Configuração de prefixo actualizada para ${prefixo}`,
            tipo: 2,
            tabela: tableName,
            empresa: req.user.empresa,
            usuario_added: userId,
            usuario_updated: userId,
        });

        return handleResponse(req, res, 200, { id }, message);
    } catch (error) {
        console.log(error);
        return handleResponse(req, res, 500, error);
    }
};

export const configuracoesStock = async (req, res) => {
    const { empresa } = req.user;
    const { userId } = req.user;

    if (
        !(await userCanAccess(permissionGroup, "Mostrar configuração", userId))
    ) {
        const message =
            "Sem permissão para visualizar a configuração de stock.";
        return handleResponse(req, res, 403, [], message);
    }
    try {
        const configuracoes = await knex(tableName).where({
            empresa,
            removido: false,
        });
        return handleResponse(req, res, 200, {
            items: configuracoes,
        });
    } catch (error) {
        console.log(error);
        return handleResponse(req, res, 500, error);
    }
};

export const removeConfiguracao = async (req, res) => {
    const { empresa } = req.user;
    const { id } = req.params;
    const { userId } = req.user;

    if (
        !(await userCanAccess(permissionGroup, "Editar configuração", userId))
    ) {
        const message = "Sem permissão para editar a configuração de stock.";
        return handleResponse(req, res, 403, [], message);
    }
    try {
        if (!(await knex(tableName).where({ id, empresa }).first())) {
            const message = "Configuração não encontrada.";
            return handleResponse(req, res, 405, {}, message);
        }

        await knex(tableName).where({ id }).del();
        const message = "Configuração removida com sucesso.";
        return handleResponse(req, res, 200, { id }, message);
    } catch (error) {
        return handleResponse(req, res, 500, error);
    }
};

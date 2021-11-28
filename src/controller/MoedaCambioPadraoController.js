import knex from "../database";
import { handleResponse } from "../utils/handleResponse";
import { userCanAccess } from "../middleware/userCanAccess";

const permissionGroup = "Câmbios";
export const all = async (req, res) => {
    const { userId } = req.user;

    if (!(await userCanAccess(permissionGroup, "Mostrar cambio", userId))) {
        const message = "Sem permissão para visualizar os cambios.";
        return handleResponse(req, res, 403, [], message);
    }
    // #swagger.tags = ['Moeda Cambio Padrao']
    // #swagger.description = 'Endpoint para listar Moeda Cambio Padrao'
    try {
        const { empresa } = req.user;
        const response = [];
        const store = await knex("empresa")
            .select(["id", "moeda_padrao"])
            .where({ id: empresa })
            .first();
        const moeda_padrao = await knex("moeda")
            .select(["id", "nome", "codigo", "simbolo"])
            .where({ id: store.moeda_padrao })
            .first();

        const cambio = await knex("cambio")
            .select("*")
            .groupBy("moeda_conversao")
            .where({
                empresa,
                moeda_padrao: store.moeda_padrao,
                removido: false,
            });

        for (let i = 0; i < cambio.length; i++) {
            response.push({
                ...cambio[i],
                moeda_padrao,
                moeda_conversao: await knex("moeda")
                    .select(["id", "nome", "codigo", "simbolo"])
                    .where({ id: cambio[i].moeda_conversao })
                    .first(),
            });
        }

        return handleResponse(req, res, 200, response);
    } catch (error) {
        return handleResponse(req, res, 500, error);
    }
};

export const findOne = async (req, res) => {
    const { userId } = req.user;

    if (!(await userCanAccess(permissionGroup, "Detalhes do cambio", userId))) {
        const message = "Sem permissão para visualizar o cambio.";
        return handleResponse(req, res, 403, [], message);
    }
    // #swagger.tags = ['Moeda Cambio Padrao']
    // #swagger.description = 'Endpoint para listar Moeda Cambio Padrao'
    const { empresa } = req.user;
    const { moeda } = req.params;
    const response = [];
    try {
        const moeda_padrao = await knex("moeda")
            .select(["id", "nome", "codigo", "simbolo"])
            .where({ id: moeda })
            .first();

        if (!moeda_padrao) {
            const message = "Moeda padrão não encontrada.";
            return handleResponse(req, res, 400, message);
        }

        const cambio = await knex("cambio")
            .select("*")
            .groupBy("moeda_conversao")
            .where({
                empresa,
                moeda_padrao: moeda,
                removido: false,
            });

        for (let i = 0; i < cambio.length; i++) {
            response.push({
                ...cambio[i],
                moeda_padrao,
                moeda_conversao: await knex("moeda")
                    .select(["id", "nome", "codigo", "simbolo"])
                    .where({ id: cambio[i].moeda_conversao })
                    .first(),
            });
        }

        return handleResponse(req, res, 200, response);
    } catch (error) {
        return handleResponse(req, res, 500, error);
    }
};

import { handleResponse } from "../utils/handleResponse";
import knex from "../database";

const onlyAdminAccess = async (req, res, next) => {
    const id = req.userId;

    const user = await knex("usuario").where({ id }).first();

    if (user && user.empresa == 1) return next();

    return handleResponse(req, res, 403);
};

export default onlyAdminAccess;

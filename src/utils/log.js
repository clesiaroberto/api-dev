/**
 *  handle the API response
 * @param {*} data
 * @returns
 */

import knex from "../database";

const log = async (data) => {
    try {
        await knex("actividade").insert(data);
    } catch (err) {
        console.log(err);
    }
};

export { log };

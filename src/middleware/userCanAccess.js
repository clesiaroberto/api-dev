import knex from "../database";

export const userCanAccess = async (group, permission, userId) => {
    const grupo = await knex("permissao_grupo")
        .select(["id"])
        .where({ nome: group })
        .first();

    if (!grupo) return false;
    const permissao = await knex("permissao")
        .select(["id"])
        .where({ nome: permission, grupo: grupo.id })
        .first();

    if (!permissao) return false;
    const usuarioPermissao = await knex("usuario_permissao")
        .select(["id"])
        .where({ permissao: permissao.id, usuario: userId })
        .first();

    return usuarioPermissao;
};

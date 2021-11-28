import knex from "../database";
import { handleResponse } from "../utils/handleResponse";

const tableName = "pacote";

export const all = async (req, res) => {
    // #swagger.tags = ['Pacote']
    // #swagger.description = 'Endpoint para listar Pacotes'
    const response = [];
    const pacotes = await knex(tableName).where({ removido: false });

    for (let i = 0; i < pacotes.length; i++) {
        response.push({
            ...pacotes[i],
            grupo: [],
        });

        const pacoteIndex = response.findIndex((el) => {
            return el.id == pacotes[i].id;
        });

        const atribuidas = await knex("permissao").whereExists(function () {
            this.select("*")
                .from("pacote_permissao")
                .whereRaw("permissao.id = pacote_permissao.permissao")
                .where("pacote_permissao.pacote", pacotes[i].id);
        });

        const naoAtribuidas = await knex("permissao").whereNotExists(
            function () {
                this.select("*")
                    .from("pacote_permissao")
                    .whereRaw("permissao.id = pacote_permissao.permissao")
                    .where("pacote_permissao.pacote", pacotes[i].id);
            }
        );

        for (let i = 0; i < naoAtribuidas.length; i++) {
            const index = response[pacoteIndex].grupo.findIndex((el) => {
                return el.id == naoAtribuidas[i].grupo;
            });

            if (index < 0) {
                const permission = await knex("permissao_grupo")
                    .where("id", naoAtribuidas[i].grupo)
                    .first();

                const { id, nome } = permission;
                response[pacoteIndex].grupo.push({
                    id,
                    nome,
                    permissoes: [
                        {
                            id: naoAtribuidas[i].id,
                            nome: naoAtribuidas[i].nome,
                            atribuido: false,
                        },
                    ],
                });
            } else {
                response[pacoteIndex].grupo[index].permissoes.push({
                    id: naoAtribuidas[i].id,
                    nome: naoAtribuidas[i].nome,
                    atribuido: false,
                });
            }
        }

        for (let i = 0; i < atribuidas.length; i++) {
            const index = response[pacoteIndex].grupo.findIndex((el) => {
                return el.id == atribuidas[i].grupo;
            });

            if (index < 0) {
                const permission = await knex("permissao_grupo")
                    .where("id", atribuidas[i].grupo)
                    .first();

                const { id, nome } = permission;
                response[pacoteIndex].grupo.push({
                    id,
                    nome,
                    permissoes: [
                        {
                            id: atribuidas[i].id,
                            nome: atribuidas[i].nome,
                            atribuido: true,
                        },
                    ],
                });
            } else {
                response[pacoteIndex].grupo[index].permissoes.push({
                    id: atribuidas[i].id,
                    nome: atribuidas[i].nome,
                    atribuido: true,
                });
            }
        }
    }
    return handleResponse(req, res, 200, response);
};

export const create = async (req, res) => {
    // #swagger.tags = ['Pacote']
    // #swagger.description = 'Endpoint para criar Pacotes'
    const { pacote, permissions = [] } = req.body;

    try {
        if (await knex(tableName).where({ pacote }).first()) {
            return handleResponse(req, res, 409, [], "Pacote já cadastrado.");
        }

        const [created] = await knex(tableName).insert({
            pacote,
            usuario_added: req.userId,
            usuario_updated: req.userId,
        });

        permissions.map(async (permissao) => {
            if (await knex("permissao").where({ id: permissao }).first()) {
                await knex("pacote_permissao").insert({
                    permissao,
                    pacote: created,
                    usuario_added: req.userId,
                    usuario_updated: req.userId,
                });
            }
        });

        return handleResponse(req, res, 200, created);
    } catch (error) {
        console.log(error);
        return handleResponse(req, res, 500);
    }
};

export const findById = async (req, res) => {
    // #swagger.tags = ['Pacote']
    // #swagger.description = 'Endpoint para listar Pacotes por Id'
    const { id } = req.params;
    const pacote = await knex(tableName)
        .select(["id", "pacote"])
        .where({ removido: false, id })
        .first();
    const groups = [];

    if (!pacote) {
        return handleResponse(req, res, 404, [], "Pacote não encontrado.");
    }

    const atribuidas = await knex("permissao").whereExists(function () {
        this.select("*")
            .from("pacote_permissao")
            .whereRaw("permissao.id = pacote_permissao.permissao")
            .where("pacote_permissao.pacote", id);
    });

    const naoAtribuidas = await knex("permissao").whereNotExists(function () {
        this.select("*")
            .from("pacote_permissao")
            .whereRaw("permissao.id = pacote_permissao.permissao")
            .where("pacote_permissao.pacote", id);
    });

    for (let i = 0; i < naoAtribuidas.length; i++) {
        const index = groups.findIndex((el) => {
            return el.id == naoAtribuidas[i].grupo;
        });

        if (index < 0) {
            const permission = await knex("permissao_grupo")
                .where("id", naoAtribuidas[i].grupo)
                .first();

            const { id, nome } = permission;
            groups.push({
                id,
                nome,
                permissoes: [
                    {
                        id: naoAtribuidas[i].id,
                        nome: naoAtribuidas[i].nome,
                        atribuido: false,
                    },
                ],
            });
        } else {
            groups[index].permissoes.push({
                id: naoAtribuidas[i].id,
                nome: naoAtribuidas[i].nome,
                atribuido: false,
            });
        }
    }

    for (let i = 0; i < atribuidas.length; i++) {
        const index = groups.findIndex((el) => {
            return el.id == atribuidas[i].grupo;
        });

        if (index < 0) {
            const permission = await knex("permissao_grupo")
                .where("id", atribuidas[i].grupo)
                .first();

            const { id, nome } = permission;
            groups.push({
                id,
                nome,
                permissoes: [
                    {
                        id: atribuidas[i].id,
                        nome: atribuidas[i].nome,
                        atribuido: true,
                    },
                ],
            });
        } else {
            groups[index].permissoes.push({
                id: atribuidas[i].id,
                nome: atribuidas[i].nome,
                atribuido: true,
            });
        }
    }

    return handleResponse(req, res, 200, { ...pacote, grupo: groups });
};

export const update = async (req, res) => {
    // #swagger.tags = ['Pacote']
    // #swagger.description = 'Endpoint para actualizar Pacotes'
    const { id } = req.params;
    const { pacote, permissions = [] } = req.body;

    const pacoteExiste = await knex(tableName)
        .select(["id", "pacote"])
        .where({ removido: false, id })
        .first();

    if (!pacoteExiste) {
        return handleResponse(req, res, 404, [], "Pacote não encontrado.");
    }

    if (
        pacoteExiste.pacote != pacote &&
        (await knex(tableName).where({ pacote, removido: false }).first())
    ) {
        return handleResponse(req, res, 409, [], "Pacote já cadastrado.");
    }

    try {
        await knex(tableName)
            .update({ pacote, usuario_updated: req.userId, removido: false })
            .where({ id });

        await knex("pacote_permissao")
            .del()
            .where({ pacote: id, removido: false });

        // const empresas = await knex("empresa").where({ pacote: id });

        permissions.map(async (permissao) => {
            if (await knex("permissao").where({ id: permissao }).first()) {
                await knex("pacote_permissao").insert({
                    permissao,
                    pacote: id,
                    usuario_added: req.userId,
                    usuario_updated: req.userId,
                });

                // ============== NÃO APAGAR ==============
                // empresas.map(async (empresa) => {
                //   const users = await knex("usuario").where({ empresa: empresa.id });
                //   users.map(async (user) => {
                //     await knex("usuario_permissao").where({ usuario: user.id }).del();
                //     await knex("usuario_permissao").insert({
                //       permissao,
                //       usuario: user.id,
                //       usuario_added: req.userId,
                //       usuario_updated: data.usuario_updated,
                //     });
                //   });
                // });
            }
        });

        return handleResponse(req, res, 200, [], "Atualizado com sucesso.");
    } catch (error) {
        return handleResponse(req, res, 500, error);
    }
};

export const remove = async (req, res) => {
    // #swagger.tags = ['Pacote']
    // #swagger.description = 'Endpoint para remover Pacotes'
    const { id } = req.params;

    if (
        !(await knex(tableName)
            .select(["id"])
            .where({ removido: false, id })
            .first())
    ) {
        return handleResponse(req, res, 404, [], "Pacote não encontrado.");
    }

    try {
        await knex("pacote_permissao")
            .update({ removido: true, usuario_updated: req.userId })
            .where({ pacote: id });

        await knex(tableName)
            .update({
                removido: true,
                usuario_updated: req.userId,
            })
            .where({ id });

        const message = "Removido com sucesso.";
        return handleResponse(req, res, 200, [], message);
    } catch (error) {
        return handleResponse(req, res, 500, error);
    }
};

export const trashed = async (req, res) => {
    // #swagger.tags = ['Pacote']
    // #swagger.description = 'Endpoint para listar Pacotes removidos'
    const response = [];
    const pacotes = await knex(tableName).where({ removido: true });

    for (let i = 0; i < pacotes.length; i++) {
        response.push({
            ...pacotes[i],
            grupo: [],
        });

        const pacoteIndex = response.findIndex((el) => {
            return el.id == pacotes[i].id;
        });

        const atribuidas = await knex("permissao").whereExists(function () {
            this.select("*")
                .from("pacote_permissao")
                .whereRaw("permissao.id = pacote_permissao.permissao")
                .where("pacote_permissao.pacote", pacotes[i].id);
        });

        const naoAtribuidas = await knex("permissao").whereNotExists(
            function () {
                this.select("*")
                    .from("pacote_permissao")
                    .whereRaw("permissao.id = pacote_permissao.permissao")
                    .where("pacote_permissao.pacote", pacotes[i].id);
            }
        );

        for (let i = 0; i < naoAtribuidas.length; i++) {
            const index = response[pacoteIndex].grupo.findIndex((el) => {
                return el.id == naoAtribuidas[i].grupo;
            });

            if (index < 0) {
                const permission = await knex("permissao_grupo")
                    .where("id", naoAtribuidas[i].grupo)
                    .first();

                const { id, nome } = permission;
                response[pacoteIndex].grupo.push({
                    id,
                    nome,
                    permissoes: [
                        {
                            id: naoAtribuidas[i].id,
                            nome: naoAtribuidas[i].nome,
                            atribuido: false,
                        },
                    ],
                });
            } else {
                response[pacoteIndex].grupo[index].permissoes.push({
                    id: naoAtribuidas[i].id,
                    nome: naoAtribuidas[i].nome,
                    atribuido: false,
                });
            }
        }

        for (let i = 0; i < atribuidas.length; i++) {
            const index = response[pacoteIndex].grupo.findIndex((el) => {
                return el.id == atribuidas[i].grupo;
            });

            if (index < 0) {
                const permission = await knex("permissao_grupo")
                    .where("id", atribuidas[i].grupo)
                    .first();

                const { id, nome } = permission;
                response[pacoteIndex].grupo.push({
                    id,
                    nome,
                    permissoes: [
                        {
                            id: atribuidas[i].id,
                            nome: atribuidas[i].nome,
                            atribuido: true,
                        },
                    ],
                });
            } else {
                response[pacoteIndex].grupo[index].permissoes.push({
                    id: atribuidas[i].id,
                    nome: atribuidas[i].nome,
                    atribuido: true,
                });
            }
        }
    }
    return handleResponse(req, res, 200, response);
};

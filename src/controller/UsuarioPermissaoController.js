import knex from "../database";
import { handleResponse } from "../utils/handleResponse";

export const addOnePermission = async (req, res) => {
    // #swagger.tags = ['Permissão de Usuário']
    // #swagger.description = 'Endpoint para atribuir permissao ao Usuario'
    const { permissaoId, usuarioId } = req.body;
    if (!(permissaoId && usuarioId)) {
        res.status(404).json({ message: `Todos os campos são obrigatórios!` });
    } else {
        const checkUsuario = await knex("usuario")
            .where("id", usuarioId)
            .first();

        /* #swagger.responses[404] = { 
               schema: { $ref: "#/definitions/IdNo" },
               description:'Não existe Nenhum usuário com o Id ${usuarioId}.' 
        } */
        if (!checkUsuario) {
            res.status(404).json({
                message: `Não existe Nenhum usuário com o Id ${usuarioId}`,
            });
        }

        const checkPermission = await knex("permissao")
            .where("id", permissaoId)
            .first();
        /* #swagger.responses[404] = { 
               schema: { $ref: "#/definitions/IdNo" },
               description:'Não existe Nenhum usuário com o Id ${usuarioId}.' 
        } */
        if (!checkPermission) {
            res.status(404).json({
                message: `Não existe uma permissão com o Id ${permissaoId}`,
            });
        }
        /* #swagger.responses[400] = { 
               schema: { $ref: "#/definitions/permissaoYes" },
               description:'Um usuário com o Id ${usuarioId} Já possui esta permissão .' 
        } */
        const userPermissaoId = await knex("usuario_permissao")
            .where("usuario", usuarioId)
            .first();

        if (userPermissaoId) {
            var userAsPermissao = await knex("usuario_permissao")
                .where(userPermissaoId.permissao, permissaoId)
                .first();

            if (userAsPermissao) {
                return res.status(400).json({
                    message: `Um usuário com o Id ${usuarioId} Já possui a permissão ${checkPermission.nome}`,
                });
            }
        }

        if (!userAsPermissao && checkUsuario && checkPermission) {
            const add_permission = await knex("usuario_permissao").insert({
                permissao: permissaoId,
                usuario: usuarioId,
                usuario_added: req.userId,
                usuario_updated: req.userId,
            });

            /* #swagger.responses[200] = { 
               schema: { $ref: "#/definitions/registerSuccess" },
               description:'Permissão adicionada com sucesso.' 
        } */

            if (add_permission) {
                return handleResponse(
                    req,
                    res,
                    200,
                    [],
                    "Permissão adicionada com sucesso"
                );
            } else {
                return res.status(404).json({
                    message: `Algo deu errado ao tentar atribuir permissao ao usuário`,
                });
            }
        }
    }
};

export const deletePermissions = async (req, res) => {
    // #swagger.tags = ['Permissão de Usuário']
    // #swagger.description = 'Endpoint para remover permissao de Usuario'
    let { idU, idP } = req.params;

    /* #swagger.responses[404] = { 
               schema: { $ref: "#/definitions/IdNo" },
               description:'Não existe Nenhum usuário com o Id ${Id}.' 
        } */

    let checkUsuario = await knex("usuario").where("id", idU).first();

    if (!checkUsuario) {
        return res
            .status(404)
            .json({ message: `Não existe Nenhum usuário com o Id ${idU}` });
    }

    let checkPermission = await knex("permissao").where("id", idP).first();

    /* #swagger.responses[404] = { 
               schema: { $ref: "#/definitions/IdNo" },
               description:'Não existe uma permissão com o Id ${Id}.' 
        } */
    if (!checkPermission) {
        return res
            .status(404)
            .json({ message: `Não existe uma permissão com o Id ${idP}` });
    }

    /* #swagger.responses[400] = { 
               schema: { $ref: "#/definitions/permissaoNo" },
               description:'Nenhum registro de Permissões encontrado.' 
        } */

    let userPermissaoId = await knex("usuario_permissao")
        .where("usuario", idU)
        .first();

    if (checkUsuario && checkPermission) {
        let checkifEmpty = await knex("usuario_permissao").first();

        if (!checkifEmpty) {
            return res
                .status(400)
                .json({ message: `Nenhum registro de Permissões encontrado!` });
        }
    }

    if (userPermissaoId) {
        var userAsPermissaoD = await knex("usuario_permissao")
            .where(userPermissaoId.permissao, idP)
            .first();

        /* #swagger.responses[200] = { 
               schema: { $ref: "#/definitions/idDelete" },
               description:'Permissao removida com sucesso.' 
        } */

        if (userAsPermissaoD) {
            let apagar = await knex("usuario_permissao")
                .where(userAsPermissaoD)
                .del()
                .then(() => {
                    return res.status(200).json({
                        message: `Permissao ${checkPermission.nome} para o Usuário ${checkUsuario.nome} ${checkUsuario.apelido} removida com sucesso.`,
                    });
                })
                .catch((err) => {
                    return res.status(400).send(err);
                });
        } else {
            return res.status(400).json({
                message: `O Usuário ${checkUsuario.nome} ${checkUsuario.apelido} Não possui a Permissão ${checkPermission.nome}!`,
            });
        }
    }
};

export const getUserPermissionsbyId = async (req, res) => {
    // #swagger.tags = ['Permissão de Usuário']
    // #swagger.description = 'Endpoint listar permissao ao Usuario em função do Id'
    const { id } = req.params;
    return handleResponse(res, res, 200, await getUserPermissions(id));
};

export const addPermissions = async (req, res) => {
    // #swagger.tags = ['Permissão de Usuário']
    // #swagger.description = 'Endpoint para atribuir permissões ao Usuario'
    const { permissions, userId } = req.body;

    /* #swagger.responses[404] = { 
      schema: { $ref: "#/definitions/IdNo" },
      description:'Usuário não encontrado.' 
  } */
    if (!(await knex("usuario").where("id", userId).first())) {
        return handleResponse(req, res, 404, [], "Usuário não encontrado.");
    }

    /* #swagger.responses[200] = { 
      schema: { $ref: "#/definitions/idDelete" },
      description:'Permissões removidas com sucesso.' 
  } */
    try {
        await knex("usuario_permissao").where("usuario", userId).del();
        if (permissions.length == 0) {
            const message = "Permissões removidas com sucesso.";
            return handleResponse(req, res, 200, [], message);
        }

        permissions.map(async (permissao) => {
            await knex("usuario_permissao").insert({
                permissao,
                usuario: userId,
                usuario_added: req.userId,
                usuario_updated: req.userId,
            });
        });

        /* #swagger.responses[200] = { 
        schema: { $ref: "#/definitions/registerSuccess" },
        description:'Permissões adicionadas com sucesso.' 
    } */
        const message = "Permissões adicionadas com sucesso.";
        return handleResponse(req, res, 200, [], message);
    } catch (error) {
        return handleResponse(req, res, 500);
    }
};

export const getUserPermissions = async (userId) => {
    // #swagger.tags = ['Permissão de Usuário']
    // #swagger.description = 'Endpoint para listar Permissão de Usuário'
    const response = [];

    const atribuidas = await knex("permissao")
        .orderBy("nome", "ASC")
        .whereExists(function () {
            this.select("*")
                .from("usuario_permissao")
                .whereRaw("permissao.id = usuario_permissao.permissao")
                .where("usuario_permissao.usuario", userId);
        });

    const naoAtribuidas = await knex("permissao")
        .orderBy("nome", "ASC")
        .whereNotExists(function () {
            this.select("*")
                .from("usuario_permissao")
                .whereRaw("permissao.id = usuario_permissao.permissao")
                .where("usuario_permissao.usuario", userId);
        });

    for (let i = 0; i < atribuidas.length; i++) {
        const index = response.findIndex((el) => {
            return el.id == atribuidas[i].grupo;
        });

        if (index >= 0) {
            response[index].permissoes.push({
                id: atribuidas[i].id,
                nome: atribuidas[i].nome,
                atribuido: true,
            });
        } else {
            const permission = await knex("permissao_grupo")
                .where("id", atribuidas[i].grupo)
                .first();

            const { id, nome } = permission;
            response.push({
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
        }
    }

    for (let i = 0; i < naoAtribuidas.length; i++) {
        const index = response.findIndex((el) => {
            return el.id == naoAtribuidas[i].grupo;
        });

        if (index >= 0) {
            response[index].permissoes.push({
                id: naoAtribuidas[i].id,
                nome: naoAtribuidas[i].nome,
                atribuido: false,
            });
        } else {
            const permission = await knex("permissao_grupo")
                .where("id", naoAtribuidas[i].grupo)
                .first();
            const { id, nome } = permission;

            response.push({
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
        }
    }

    return response;
};

export const userCan = async (action, userId) => {};

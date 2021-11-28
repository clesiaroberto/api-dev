import bcrypt from "bcryptjs";
import knex from "../database";
import { upload } from "../helper/UploadFile";
import { handleResponse } from "../utils/handleResponse";
import fs from "fs";
import { getUserPermissions } from "./UsuarioPermissaoController";

const tableName = "usuario";
let uploadPath = "default.png";
let uploadFolder = "";

export const all = async (req, res) => {
    // #swagger.tags = ['Usuário']
    // #swagger.description = 'Endpoint para Listar Usuário.'
    const users = await knex(tableName).whereNot("empresa", 1);
    const response = [];
    let ultimaEmpresaRequisitada = [];

    for (let i = 0; i < users.length; i++) {
        if (ultimaEmpresaRequisitada.id != users[i].empresa) {
            ultimaEmpresaRequisitada = await knex("empresa")
                .where("id", users[i].empresa)
                .first();
        }

        users[i].password = undefined;
        const image = users[i].imagem;
        users[i].imagem = `${process.env.API_ADDRESS}/static/users/${image}`;

        response.push({
            ...users[i],
            empresa: ultimaEmpresaRequisitada,
        });
    }

    /* #swagger.responses[200] = { 
               schema: { $ref: "#/definitions/User" },
               description:'Listando Usuários.' 
        } */

    return handleResponse(req, res, 200, response);
};

export const register = async (req, res) => {
    // #swagger.tags = ['Usuário']
    // #swagger.description = 'Endpoint para Registar Usuário.'
    const data = dadosValidos(req);

    /* #swagger.parameters['Usuario'] = {
               in: 'body',
               description: 'Informações do Usuário.',
               required: true,
               type: 'object',
               schema: { $ref: "#/definitions/User" }
        } */

    /* #swagger.responses[404] = { 
               schema: { $ref: "#/definitions/IdNo" },
               description:'A empresa informada não existe.' 
        } */

    if (!(await knex("empresa").where("id", data.empresa).first())) {
        const message = `A empresa informada não existe.`;
        return handleResponse(req, res, 404, [], message);
    }

    /* #swagger.responses[400] = { 
               schema: { $ref: "#/definitions/emailNo" },
               description:'Usuário com E-mail ${email} já está cadastrado.' 
        } */

    if (await knex("usuario").where({ email: data.email }).first()) {
        const message = `Usuário com E-mail ${data.email} já está cadastrado.`;
        return handleResponse(req, res, 400, [], message);
    }

    if (req.files && req.files.imagem) {
        let { imagem } = req.files;
        moveUploadedImage(imagem);
    }

    try {
        data.imagem = uploadPath;
        const [created] = await knex(tableName).insert(data);
        const empresa = await knex("empresa")
            .select(["id", "pacote"])
            .where({ id: data.empresa })
            .first();
        const permissions = await knex("pacote_permissao").where({
            pacote: empresa.pacote,
        });

        permissions.map(async (permissao) => {
            await knex("usuario_permissao").insert({
                permissao: permissao.permissao,
                usuario: created,
                usuario_added: data.usuario_added,
                usuario_updated: data.usuario_updated,
            });
        });

        /* #swagger.responses[200] = { 
               schema: { $ref: "#/definitions/User" },
               description:'Usuário registado com sucesso.' 
        } */

        const message = "Usuário registado com sucesso.";
        return handleResponse(res, res, 200, { id: created }, message);
    } catch (error) {
        fs.unlinkSync(`./uploads/${uploadFolder}`);
        return handleResponse(res, res, 500, error);
    }
};

export const findById = async (req, res) => {
    // #swagger.tags = ['Usuário']
    // #swagger.description = 'Endpoint para Listar Usuário por Id.'
    const { id } = req.params;
    const user = await knex(tableName).where({ id }).first();

    /* #swagger.responses[404] = { 
               schema: { $ref: "#/definitions/IdNo" },
               description:'Usuário com ID ${id} não encontrado.' 
        } */

    if (!user) {
        const message = `Usuário com ID ${id} não encontrado.`;
        return handleResponse(req, res, 404, [], message);
    }

    user.password = undefined;
    const image = user.imagem;
    user.imagem = `${process.env.API_ADDRESS}/static/users/${image}`;

    const response = {
        ...user,
        empresa: await knex("empresa").where("id", user.empresa).first(),
        permissoes: await getUserPermissions(id),
    };

    /* #swagger.responses[200] = { 
               schema: { $ref: "#/definitions/User" },
               description:'Listando Usuário em função do Id.' 
        } */

    return handleResponse(req, res, 200, response);
};

export const update = async (req, res) => {
    // #swagger.tags = ['Usuário']
    // #swagger.description = 'Endpoint para Actualizar Usuário.'
    const { id } = req.params;
    const data = dadosValidos(req);
    data.usuario_added = undefined;
    data.password = undefined;

    /* #swagger.responses[404] = { 
               schema: { $ref: "#/definitions/IdNo" },
               description:'Usuário não encontrado.' 
        } */

    if (!(await knex(tableName).where({ id }).first())) {
        const message = `Usuário não encontrado.`;
        return handleResponse(req, res, 404, [], message);
    }

    try {
        if (req.files && req.files.imagem) {
            let { imagem } = req.files;
            moveUploadedImage(imagem);
        }

        data.imagem = uploadPath;
        await knex(tableName).update(data).where({ id });

        /* #swagger.responses[200] = { 
               schema: { $ref: "#/definitions/idUpdate" },
               description:'Dados atualizados com sucesso.' 
        } */

        const message = "Dados atualizados com sucesso.";
        return handleResponse(res, res, 200, { id }, message);
    } catch (error) {
        fs.unlinkSync(`./uploads/${uploadFolder}`);
        return handleResponse(res, res, 500, error);
    }
};

export const updateMe = async (req, res) => {
    // #swagger.tags = ['Usuário']
    // #swagger.description = 'Endpoint para Actualizar Usuário.'
    const { userId } = req.user;
    const data = dadosValidos(req);
    data.usuario_added = undefined;
    data.password = undefined;
    /* #swagger.responses[404] = { 
               schema: { $ref: "#/definitions/IdNo" },
               description:'Usuário não encontrado.' 
        } */

    if (!(await knex(tableName).where({ id: userId }).first())) {
        const message = `Usuário não encontrado.`;
        return handleResponse(req, res, 404, [], message);
    }

    try {
        if (req.files && req.files.imagem) {
            let { imagem } = req.files;
            moveUploadedImage(imagem);
        }

        data.imagem = uploadPath;
        await knex(tableName).update(data).where({ id: userId });

        /* #swagger.responses[200] = { 
               schema: { $ref: "#/definitions/idUpdate" },
               description:'Dados atualizados com sucesso.' 
        } */

        const message = "Dados atualizados com sucesso.";
        return handleResponse(res, res, 200, { id: userId }, message);
    } catch (error) {
        // fs.unlinkSync(`./uploads/${uploadFolder}`);
        return handleResponse(res, res, 500, error);
    }
};
export const updateStatus = async (req, res) => {
    // #swagger.tags = ['Usuário']
    // #swagger.description = 'Endpoint para Actualizar Status.'
    const { estado } = req.body;
    const { id } = req.params;
    const user = await knex(tableName).where({ id }).first();

    /* #swagger.responses[400] = { 
               schema: { $ref: "#/definitions/idUpdate" },
               description:'Usuário não pode alterar o estado da própria conta.' 
        } */
    if (req.userId == id) {
        const message = `Não podes alterar o estado da tua própria conta.`;
        return handleResponse(req, res, 400, [], message);
    }
    /* #swagger.responses[404] = { 
               schema: { $ref: "#/definitions/IdNo" },
               description:'Usuário com ID ${id} não encontrado.' 
        } */

    if (!user) {
        const message = `Usuário com ID ${id} não encontrado.`;
        return handleResponse(req, res, 404, [], message);
    }

    if (estado == undefined || (estado != 1 && estado != 0)) {
        const message = "O estado informado não é válido.";
        return handleResponse(req, res, 404, [], message);
    }

    await knex("usuario")
        .update({ estado, usuario_updated: req.userId })
        .where({ id });

    /* #swagger.responses[200] = { 
               schema: { $ref: "#/definitions/statusUpdate" },
               description:'Status Actualizado com sucesso!.' 
        } */

    const message = estado
        ? "Usuário habilitado com sucesso."
        : "Usuário desabilitado com sucesso";

    return handleResponse(res, res, 200, [], message);
};

export const listUserByStatus = async (req, res) => {
    // #swagger.tags = ['Usuário']
    // #swagger.description = 'Endpoint para Listar Usuarios em função do Status .'
    const { estado = 1 } = req.params;
    const users = await knex(tableName).where({ estado });
    const response = [];

    for (let i = 0; i < users.length; i++) {
        const empresa = await knex("empresa")
            .where("id", users[i].empresa)
            .first();
        users[i].password = undefined;
        const image = users[i].imagem;
        users[i].imagem = `${process.env.API_ADDRESS}/static/users/${image}`;

        response.push({
            ...users[i],
            empresa,
        });
    }
    /* #swagger.responses[200] = { 
               schema: { $ref: "#/definitions/User" },
               description:'Listando usuários em função do Status!.' 
        } */

    const message = `Usuários com estado ${estado == 1 ? "ativo" : "inativo"}`;
    return handleResponse(req, res, 200, response, message);
};

export const myProfile = async (req, res) => {
    // #swagger.tags = ['Usuário']
    // #swagger.description = 'Endpoint para verificar os dados do Usuário Autenticado.'
    const id = req.userId;
    const user = await knex(tableName).where({ id }).first();

    user.password = undefined;
    const image = user.imagem;
    user.imagem = `${process.env.API_ADDRESS}/static/users/${image}`;

    const Empresa = await knex("empresa").where("id", user.empresa).first();

    const anexo = await knex("anexo").where("id", Empresa.logotipo).first();

    let attach = Empresa.logotipo;
    attach = `${process.env.API_ADDRESS}/static/anexos/${
        (anexo && anexo.nome_ficheiro) || "default.png"
    }`;

    const response = {
        ...user,
        empresa: {
            id: Empresa.id,
            nome: Empresa.nome,
            slogan: Empresa.slogan,
            nuit: Empresa.nuit,
            email: Empresa.email,
            logotipo: attach,
            contacto1: Empresa.contacto1,
            contacto2: Empresa.contacto2,
            endereco1: Empresa.endereco1,
            pacote: Empresa.pacote,
            moeda: Empresa.moeda,
            data_added: Empresa.data_added,
            data_updated: Empresa.data_updated,
            estado: Empresa.estado,
        },
        permissoes: await getUserPermissions(id),
    };

    /* #swagger.responses[200] = { 
               schema: { $ref:`#/definitions/Permissao` , $ref:`#/definitions/Empresa` },
               description:'Listando Perfil do Usuário!.' 
        } */

    return handleResponse(req, res, 200, response);
};

export const updatePasswordAdmin = async (req, res) => {
    // #swagger.tags = ['Usuário']
    // #swagger.description = 'Endpoint para Actualizar Senha do Administrador.'
    const { password } = req.body;
    const { id } = req.params;

    const user = await knex("usuario").where({ id }).first();
    /* #swagger.responses[404] = { 
               schema: { $ref: "#/definitions/IdNo" },
               description:'Usuário não encontrado.' 
        } */
    if (!user) {
        return handleResponse(req, res, 404, [], `Usuário não encontrado.`);
    }
    /* #swagger.responses[400] = { 
               schema: { $ref: "#/definitions/SenhaNo" },
               description:'Nenhuma senha informada.' 
        } */

    if (!password) {
        return handleResponse(req, res, 400, [], `Nenhuma senha informada.`);
    }
    /* #swagger.responses[400] = { 
               schema: { $ref: "#/definitions/IdAdmin" },
               description:'Não podes alterar senha de um administrador.' 
        } */
    if (user.empresa == 1) {
        const message = "Não podes alterar senha de um administrador";
        return handleResponse(req, res, 400, [], message);
    }
    /* #swagger.responses[200] = { 
               schema: { $ref: "#/definitions/idUpdate" },
               description:'Senha alterada com Sucesso.' 
        } */
    await knex("usuario")
        .update("password", bcrypt.hashSync(password, 10))
        .where({ id });

    return handleResponse(res, res, 200, [], "Senha alterada com Sucesso.");
};

export const confirmPassword = async (req, res) => {
    // #swagger.tags = ['Usuário']
    // #swagger.description = 'Endpoint para confirmar password do usuário autenticado.'
    const { password } = req.body;
    const { userId } = req.user;

    /* #swagger.responses[403] = { 
               schema: { $ref: "#/definitions/SenhaActual" },
               description:'Senha incorreta.' 
        } */
    const user = await knex("usuario").where({ id: userId }).first();
    if (!bcrypt.compareSync(password, user.password)) {
        return handleResponse(res, res, 403, [], "Senha incorreta.");
    }
    /* #swagger.responses[200] = { 
               schema: { $ref: "#/definitions/SenhaOk" },
               description:'Senha confirmada.' 
        } */

    return handleResponse(res, res, 200, [], "Senha confirmada.");
};

export const userPassUpdate = async (req, res) => {
    // #swagger.tags = ['Usuário']
    // #swagger.description = 'Endpoint para Actualizar Senha do Usuário.'
    const { senha_actual, nova_senha } = req.body;
    const { userId } = req.user;

    const user = await knex("usuario").where("id", userId).first();

    /* #swagger.responses[400] = { 
               schema: { $ref: "#/definitions/SenhaActual" },
               description:'A senha atual não está correta.' 
        } */
    if (!bcrypt.compareSync(senha_actual, user.password)) {
        return handleResponse(
            res,
            res,
            400,
            [],
            "A senha atual não está correta."
        );
    }
    /* #swagger.responses[400] = { 
               schema: { $ref: "#/definitions/NovaSenha" },
               description:'A nova senha não pode ser igual a senha atual.' 
        } */

    if (senha_actual == nova_senha) {
        const message = "A nova senha não pode ser igual a senha atual.";
        return handleResponse(res, res, 400, [], message);
    }

    await knex("usuario")
        .update("password", bcrypt.hashSync(nova_senha, 10))
        .where("id", userId);

    /* #swagger.responses[200] = { 
               schema: { $ref: "#/definitions/SenhaUpdate" },
               description:'Senha alterada com Sucesso.' 
        } */

    return handleResponse(res, res, 200, [], "Senha alterada com Sucesso.");
};

const moveUploadedImage = (imagem) => {
    const { filename, folder } = upload(imagem, "users");
    uploadPath = filename;
    uploadFolder = folder;
};

const dadosValidos = (req) => {
    const usuario_added = req.userId;
    const usuario_updated = req.userId;

    const { nome, apelido, email, contacto1, contacto2, password, empresa } =
        req.body;

    return {
        nome,
        apelido,
        email,
        contacto1,
        contacto2,
        password: password ? bcrypt.hashSync(password, 10) : "",
        empresa,
        usuario_added,
        usuario_updated,
    };
};

import path from "path";
import knex from "../database";
import { upload } from "../helper/UploadFile";
import { handleResponse } from "../utils/handleResponse";

const tableName = "empresa";

export const all = async (req, res) => {
    // #swagger.tags = ['Empresa']
    // #swagger.description = 'Endpoint para listar empresas.'

    const response = [];
    const empresas = await knex(tableName)
        .where({ estado: true })
        .whereNot("id", 1);

    for (let i = 0; i < empresas.length; i++) {
        const pacote = await knex("pacote")
            .where({ id: empresas[i].pacote })
            .first();
        const anexo = await knex("anexo")
            .where("id", empresas[i].logotipo)
            .first();
        let { logotipo } = empresas[i];
        logotipo = `${process.env.API_ADDRESS}/static/anexos/${
            (anexo && anexo.nome_ficheiro) || "default.png"
        }`;

        response.push({
            ...empresas[i],
            logotipo,
            pacote,
        });
    }
    /* #swagger.responses[200] = { 
               schema: { $ref: "#/definitions/Empresa" },
               description:'Listando Empresas' 
    } */

    return handleResponse(req, res, 200, response);
};

export const moedaPadrao = async (req, res) => {
    try {
        const response = await knex("empresa")
            .select(["moeda.*"])
            .leftJoin("moeda", "moeda.id", "empresa.moeda_padrao")
            .first();
        return handleResponse(req, res, 200, response);
    } catch (err) {
        return handleResponse(req, res, 500, err);
    }
};

export const create = async (req, res) => {
    // #swagger.tags = ['Empresa']
    // #swagger.description = 'Endpoint para cadastrar empresas.'
    const data = dadosValidos(req);

    /* #swagger.parameters['Empresa'] = {
               in: 'body',
               description: 'Informações da categoria de stock.',
               required: true,
               type: 'object',
               schema: { $ref: "#/definitions/Empresa" }
        } */

    /* #swagger.responses[409] = { 
               schema: { $ref: "#/definitions/emailNo" },
               description:'Empresa com email ${email} já está cadastrada.' 
        } */
    if (!(await knex("pacote").where({ id: data.pacote }).first())) {
        const message = `Pacote não encontrado.`;
        return handleResponse(req, res, 404, [], message);
    }

    if (await knex(tableName).where("email", data.email).first()) {
        const message = `Empresa com email ${data.email} já está cadastrada.`;
        return handleResponse(req, res, 409, [], message);
    }

    /* #swagger.responses[409] = { 
               schema: { $ref: "#/definitions/NameNo" },
               description:'Empresa com nome ${nome} já está cadastrada.' 
        } */
    if (await knex(tableName).where("nome", data.nome).first()) {
        const message = `Empresa ${data.nome} já está cadastrada.`;
        return handleResponse(req, res, 409, [], message);
    }

    let anexoId = 1;
    if (req.files && req.files.logotipo) {
        anexoId = await uploadLogotype(req.files.logotipo, req);
    }
    data.logotipo = anexoId;
    /* #swagger.responses[200] = { 
               schema: { $ref: "#/definitions/registerSuccess" },
               description:'Empresa registada com sucesso.' 
        } */
    knex(tableName)
        .insert(data)
        .then(async (id) => {
            await knex("stock_configuracao").insert({
                referencia_automatica: false,
                empresa: id,
                prefixo: String(data.nome.substr(0, 2)).toUpperCase(),
                usuario_added: data.usuario_added,
                usuario_updated: data.usuario_updated,
            });
            const store = await knex(tableName).where({ id }).first();
            const anexo = await knex("anexo")
                .where("id", store.logotipo)
                .first();
            store.logotipo = `${process.env.API_ADDRESS}/static/anexos/${anexo.nome_ficheiro}`;
            const message = "Empresa registada com sucesso.";
            return handleResponse(res, res, 200, { id: id[0] }, message);
        })
        .catch((e) => handleResponse(res, res, 500, e));
};

export const findOne = async (req, res) => {
    // #swagger.tags = ['Empresa']
    // #swagger.description = 'Endpoint para listar empresa do Usuário que está autenticado.'
    const empresa = await knex(tableName)
        .where({ id: req.user.empresa })
        .first();

    const anexo = await knex("anexo")
        .select(["id", "nome_ficheiro", "nome_original", "mime_type"])
        .where("id", empresa.logotipo)
        .first();
    console.log(anexo);
    const pacote = await knex("pacote")
        .select(["id", "pacote"])
        .where({ id: empresa.pacote })
        .first();
    const response = {
        ...empresa,
        logotipo: `${process.env.API_ADDRESS}/static/anexos/${anexo.nome_ficheiro}`,
        pacote,
        moeda_padrao: await knex("moeda")
            .select(["id", "nome", "codigo", "simbolo"])
            .where({ id: empresa.moeda_padrao })
            .first(),
    };

    /* #swagger.responses[200] = { 
               schema: { $ref: "#/definitions/Empresa" },
               description:'Encontrada a Empresa.' 
        } */

    return handleResponse(req, res, 200, response);
};

export const findOneById = async (req, res) => {
    // #swagger.tags = ['Empresa']
    // #swagger.description = 'Endpoint para listar empresa em função do Id.'
    const { id } = req.params;
    const empresa = await knex(tableName).where({ id }).first();

    /* #swagger.responses[404] = { 
               schema: { $ref: "#/definitions/IdNo" },
               description:'Empresa com ID ${id} não encontrado.' 
        } */

    if (!empresa) {
        return handleResponse(
            req,
            res,
            404,
            [],
            `Empresa com ID ${id} não encontrado.`
        );
    }

    const anexo = await knex("anexo").where("id", empresa.logotipo).first();
    const pacote = await knex("pacote").where({ id: empresa.pacote }).first();
    const response = {
        ...empresa,
        logotipo: `${process.env.API_ADDRESS}/static/anexos/${anexo.nome_ficheiro}`,
        pacote,
    };
    /* #swagger.responses[200] = { 
               schema: { $ref: "#/definitions/Empresa" },
               description:'Listando Empresas em função do ID.' 
        } */
    return handleResponse(req, res, 200, response);
};

export const update = async (req, res) => {
    // #swagger.tags = ['Empresa']
    // #swagger.description = 'Endpoint para actualizar dados da empresa.'
    const { id } = req.params;
    const data = dadosValidos(req);
    data.usuario_added = undefined;

    /* #swagger.parameters['Empresa'] = {
               in: 'body',
               description: 'Informações da categoria de stock.',
               required: true,
               type: 'object',
               schema: { $ref: "#/definitions/Empresa" }
        } */

    /* #swagger.responses[404] = { 
               schema: { $ref: "#/definitions/IdNo" },
               description:'Empresa com ID ${id} não existe.' 
        } */

    const storeExists = await knex(tableName).where({ id }).first();

    if (!storeExists) {
        return handleResponse(req, res, 404, [], `Empresa  não existe.`);
    }
    /* #swagger.responses[400] = { 
               schema: { $ref: "#/definitions/emailNo" },
               description:'Empresa com email ${email} já está cadastrada.' 
        } */

    if (!(await knex("pacote").where({ id: data.pacote }).first())) {
        const message = `Pacote não encontrado.`;
        return handleResponse(req, res, 404, [], message);
    }

    if (
        storeExists.email != data.email &&
        (await knex("empresa").where("email", data.email).first())
    ) {
        /* #swagger.responses[400] = { 
               schema: { $ref: "#/definitions/emailNo" },
               description:'Empresa com email ${nome} já está cadastrada.' 
        } */
        const message = `Empresa com email ${data.email} já está cadastrada.`;
        return handleResponse(req, res, 400, [], message);
    }
    /* #swagger.responses[400] = { 
               schema: { $ref: "#/definitions/NameNo" },
               description:'Empresa com email ${nome} já está cadastrada.' 
        } */
    if (
        storeExists.nome != data.nome &&
        (await knex("empresa").where("nome", data.nome).first())
    ) {
        const message = `Empresa com o nome ${data.nome} já está cadastrada.`;
        return handleResponse(req, res, 400, [], message);
    }

    let anexoId = storeExists.logotipo;
    if (req.files && req.files.logotipo) {
        anexoId = await uploadLogotype(req.files.logotipo, req);
    }
    data.logotipo = anexoId;

    await knex("empresa").update(data).where({ id });

    try {
        const permissions = await knex("pacote_permissao").where({
            pacote: data.pacote,
        });

        const users = await knex("usuario").where({ empresa: id });

        users.map(async (user) => {
            await knex("usuario_permissao").where({ usuario: user.id }).del();
            permissions.map(async (permissao) => {
                await knex("usuario_permissao").insert({
                    permissao: permissao.permissao,
                    usuario: user.id,
                    usuario_added: req.userId,
                    usuario_updated: data.usuario_updated,
                });
            });
        });
    } catch (error) {}

    /* #swagger.responses[200] = { 
      schema: { $ref: "#/definitions/idUpdate" },
      description:'Dados atualizados com sucesso.' 
  } */
    return handleResponse(res, res, 200, {}, "Dados atualizados com sucesso");
};

export const getStoreUsers = async (req, res) => {
    // #swagger.tags = ['Empresa']
    // #swagger.description = 'Endpoint para usuarios que pertencem a empresa.'
    const { id } = req.params;

    const users = await knex("usuario").where({ empresa: id });
    const response = [];

    for (let i = 0; i < users.length; i++) {
        users[i].password = undefined;
        const image = users[i].imagem;
        users[i].imagem = `${process.env.API_ADDRESS}/static/users/${image}`;

        response.push({
            ...users[i],
        });
    }
    /* #swagger.responses[200] = { 
               schema: { $ref: "#/definitions/User" },
               description:'Listando Usuários que pertencem a empresa' 
        } */
    return handleResponse(req, res, 200, response);
};

/**
 *
 * @param {File} logotipo
 * @param {integer} userId
 * @returns
 */
const uploadLogotype = async (logotipo, req) => {
    // #swagger.tags = ['Empresa']
    // #swagger.description = 'Endpoint para upload de logotipo da empresa'
    try {
        const { name, filename, mimetype } = upload(logotipo, "anexos");
        return await knex("anexo").insert({
            nome_original: name,
            nome_ficheiro: filename,
            mime_type: mimetype,
            extensao: path.extname(logotipo.name),
            usuario_added: req.userId,
            usuario_updated: req.userId,
            empresa: req.user.empresa,
        });
    } catch (error) {
        return 1;
    }
};

const dadosValidos = (req) => {
    const usuario_added = req.userId;
    const usuario_updated = req.userId;

    const {
        nome,
        slogan = "",
        nuit = "",
        email,
        contacto1 = "",
        contacto2 = "",
        endereco1 = "",
        pacote,
    } = req.body;

    return {
        nome,
        slogan,
        nuit,
        email,
        contacto1,
        contacto2,
        endereco1,
        pacote,
        moeda_padrao: 70,
        estado: true,
        usuario_added,
        usuario_updated,
    };
};

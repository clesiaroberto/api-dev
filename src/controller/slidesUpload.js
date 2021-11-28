import knex from "../database";
import { handleResponse } from "../utils/handleResponse";
import path from "path";
import { upload } from "../helper/UploadFile";

const tableName = "slide";

export const addSlide = async (req, res) => {
    // #swagger.tags = ['Slides']
    // #swagger.description = 'Cadastro de Slides.'
    const data = dadosValidos(req);

    /* #swagger.responses[200] = { 
        schema: { $ref: "#/definitions/registerSuccess" },
        description:'Dados adicionados com sucesso' 
    } */

    let anexoId = 1;
    if (req.files && req.files.anexo) {
        anexoId = await uploadLogotype(req.files.anexo, req);
    }
    data.anexo = anexoId;

    knex(tableName)
        .insert(data)
        .then((id) => {
            const message = "Dados adicionados com sucesso";
            return handleResponse(req, res, 200, { id: id[0] }, message);
        })
        .catch((err) => handleResponse(res, res, 500, err));
};

export const multipleSlides = async (req, res) => {
    // #swagger.tags = ['Slides']
    // #swagger.description = 'Cadastro de Slides.'
    const data = dadosValidos(req);
    /* #swagger.responses[200] = { 
        schema: { $ref: "#/definitions/registerSuccess" },
        description:'Dados adicionados com sucesso' 
    } */
    try {
        if (req.files) {
            const files = [req.files];
            const [file] = files;
            console.log(file);
            return res.send(file.length);
        }
        return res.json(false);

        // req.files && [...req.files].map((i) => console.log(i));
        // [...req.files].map(async (anexo) => {
        //     console.log(anexo);
        //     await knex(tableName).insert({
        //         autor: data.autor,
        //         link: data.link,
        //         anexo: await uploadLogotype(anexo, req),
        //         descricao: data.descricao,
        //         usuario_added: data.usuario_added,
        //         usuario_updated: data.usuario_updated,
        //         empresa: data.empresa,
        //     });
        // });
    } catch (error) {
        handleResponse(req, res, 500, error);
    }
};

export const updateSlide = async (req, res) => {
    // #swagger.tags = ['Deposito']
    // #swagger.description = 'Endpoint para actualizar dados dos Depositos.'
    const { id } = req.params;
    const data = dadosValidos(req);
    data.usuario_added = undefined;

    const slideExists = await knex(tableName)
        .where({ id, removido: false, empresa: data.empresa })
        .first();

    if (!slideExists) {
        return handleResponse(req, res, 404, [], `Registo não encontrado.`);
    }

    let anexoId = slideExists.anexo;
    if (req.files && req.files.anexo) {
        anexoId = await uploadLogotype(req.files.anexo, req);
    }
    data.usuario_added = undefined;
    data.anexo = anexoId;

    knex(tableName)
        .update(data)
        .where({ id, removido: false, empresa: data.empresa })
        .then((row) => {
            if (!row) {
                const message = "Registo não encontrado.";
                return handleResponse(req, res, 404, [], message);
            }

            /* #swagger.responses[200] = { 
               schema: { $ref: "#/definitions/idUpdate" },
               description:'Atualizado com sucesso.' 
        } */
            const message = "Atualizado com sucesso.";
            return handleResponse(req, res, 200, [], message);
        })
        .catch((err) => handleResponse(res, res, 500));
};

export const getAll = async (req, res) => {
    // #swagger.tags = ['Slides']
    // #swagger.description = 'Endpoint para listar Slides.'
    const slides = await knex(tableName).where({ removido: false });
    const response = [];

    for (let i = 0; i < slides.length; i++) {
        const anexo = await knex("anexo").where("id", slides[i].anexo).first();

        let attach = slides[i].anexo;
        attach = `${process.env.API_ADDRESS}/static/slides/${
            (anexo && anexo.nome_ficheiro) || "default.png"
        }`;

        response.push({
            id: slides[i].id,
            autor: slides[i].autor,
            link: slides[i].link,
            data_inicio: slides[i].data_inicio,
            data_fim: slides[i].data_fim,
            anexo: attach,
            descricao: slides[i].descricao,
            empresa: slides[i].empresa,
            data_added: slides[i].data_added,
            data_updated: slides[i].data_updated,
            usuario_added: slides[i].usuario_added,
            usuario_updated: slides[i].usuario_updated,
        });
    }
    // console.log(Depositos);

    return handleResponse(req, res, 200, {
        items: response,
    });
};

export const getById = async (req, res) => {
    // #swagger.tags = ['Slides']
    // #swagger.description = 'Endpoint para listar Slides em função do Id.'
    const { id } = req.params;
    const { empresa } = req.user;

    const slide = await knex(tableName)
        .where({ id, empresa, removido: false })
        .first();

    if (!slide) {
        const message = `Registo não encontrado.`;
        return handleResponse(req, res, 404, [], message);
    }

    const anexo = await knex("anexo").where("id", slide.anexo).first();

    let attach = slide.anexo;
    attach = `${process.env.API_ADDRESS}/static/slides/${
        (anexo && anexo.nome_ficheiro) || "default.png"
    }`;

    /* #swagger.responses[404] = { 
        schema: { $ref: "#/definitions/IdNo" },
        description:'Cliente não encontrado.' 
    } */

    /* #swagger.responses[200] = { 
        schema: { $ref: "#/definitions/Cliente" },
        description:'Listando Clientes' 
    } */

    return handleResponse(req, res, 200, { ...slide, anexo: attach });
};

export const deleteSlide = async (req, res) => {
    // #swagger.tags = ['Slide']
    // #swagger.description = 'Endpoint para remover Slides em função do Id.'
    const { id } = req.params;
    const { empresa } = req.user;

    /* #swagger.responses[404] = { 
               schema: { $ref: "#/definitions/IdNo" },
               description:'Removendo Clientes' 
        } */

    knex(tableName)
        .update("removido", true)
        .where({ id, removido: false, empresa })
        .then((row) => {
            if (!row) {
                const message = `Registo não encontrado.`;
                return handleResponse(req, res, 404, [], message);
            }
            /* #swagger.responses[200] = { 
               schema: { $ref: "#/definitions/idDelete" },
               description:'Removido com sucesso' 
            } */
            return handleResponse(req, res, 200, [], `Removido com sucesso.`);
        })
        .catch((err) => handleResponse(req, res, 500, err));
};

export const getLastInsertedId = async (req, res) => {
    const lastInserted = await knex(tableName)
        .where({ empresa: req.user.empresa })
        .orderBy("data_added", "DESC")
        .first();

    if (lastInserted) {
        return handleResponse(req, res, 200, {
            id: `${("" + (lastInserted.id + 1)).slice(-4)}`,
        });
    } else {
        return handleResponse(req, res, 200, {
            id: `${("" + 1).slice(-4)}`,
        });
    }
};

const uploadLogotype = async (anexo, req) => {
    try {
        const { name, filename, mimetype } = upload(anexo, "slides");
        return await knex("anexo").insert({
            nome_original: name,
            nome_ficheiro: filename,
            mime_type: mimetype,
            extensao: path.extname(anexo.name),
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
    const { empresa = 1 } = req.user;

    const { autor = "", link = "", descricao = "" } = req.body;

    return {
        autor,
        link,
        descricao,
        usuario_added,
        usuario_updated,
        empresa,
    };
};

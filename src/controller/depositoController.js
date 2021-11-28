import knex from "../database";
import { handleResponse } from "../utils/handleResponse";
import path from "path";
import { upload } from "../helper/UploadFile";
import { userCanAccess } from "../middleware/userCanAccess";
import { log } from "../utils/log";
import moment from "moment";
import { formatCurrency } from "../helper/FormatCurrency";

const permissionGroup = "Depósitos";
const tableName = "deposito";

export const add = async (req, res) => {
    const { userId } = req.user;

    if (!(await userCanAccess(permissionGroup, "Criar depósito", userId))) {
        const message = "Sem permissão para criar Depósito.";
        return handleResponse(req, res, 403, [], message);
    }
    // #swagger.tags = ['Deposito']
    // #swagger.description = 'Cadastro de Depositos.'
    const data = dadosValidos(req);

    const ContaBancaria = await knex("conta_bancaria")
        .where({
            id: data.conta_bancaria,
            removido: false,
            empresa: data.empresa,
        })
        .first();

    if (!ContaBancaria) {
        const message = "Conta Bancaria não encontrada";
        return handleResponse(req, res, 404, [], message);
    }

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
        .then(async (id) => {
            const message = "Dados adicionados com sucesso";

            const contaBancaria = await knex("conta_bancaria")
                .where({ id: data.conta_bancaria })
                .first();

            log({
                item_id: id[0],
                descricao:
                    "Adicionado depósito " +
                    contaBancaria.nome_banco +
                    ", conta Bancaria: " +
                    data.conta_bancaria,
                tipo: 1,
                tabela: tableName,
                empresa: req.user.empresa,
                usuario_added: userId,
                usuario_updated: userId,
            });

            return handleResponse(req, res, 200, { id: id[0] }, message);
        })
        .catch((err) => handleResponse(res, res, 500, err));
};

export const updateDeposito = async (req, res) => {
    // #swagger.tags = ['Deposito']
    // #swagger.description = 'Endpoint para actualizar dados dos Depositos.'
    const { id } = req.params;
    const { userId } = req.user;

    if (!(await userCanAccess(permissionGroup, "Editar depósito", userId))) {
        const message = "Sem permissão para editar Depósito.";
        return handleResponse(req, res, 403, [], message);
    }
    const data = dadosValidos(req);
    data.usuario_added = undefined;

    const depositoExists = await knex(tableName)
        .where({ id, removido: false, empresa: data.empresa })
        .first();

    if (!depositoExists) {
        return handleResponse(req, res, 404, [], `Registo não encontrado.`);
    }

    let anexoId = depositoExists.anexo;
    if (req.files && req.files.anexo) {
        anexoId = await uploadLogotype(req.files.anexo, req);
    }
    data.usuario_added = undefined;
    data.anexo = anexoId;

    const [updated] = await knex(tableName)
        .update(data)
        .where({ id, removido: false, empresa: data.empresa })
        .then(async (row) => {
            if (!row) {
                const message = "Registo não encontrado.";
                return handleResponse(req, res, 404, [], message);
            }

            /* #swagger.responses[200] = { 
               schema: { $ref: "#/definitions/idUpdate" },
               description:'Atualizado com sucesso.' 
        } */
            const message = "Atualizado com sucesso.";

            const contaBancaria = await knex("conta_bancaria")
                .where({ id: data.conta_bancaria })
                .first();

            log({
                item_id: id,
                descricao:
                    "Actualizado depósito " +
                    contaBancaria.nome_banco +
                    ", conta Bancaria: " +
                    data.conta_bancaria,
                tipo: 2,
                tabela: tableName,
                empresa: req.user.empresa,
                usuario_added: userId,
                usuario_updated: userId,
            });

            return handleResponse(req, res, 200, { id: id });
        })
        .catch((err) => handleResponse(res, res, 500));
};

export const getAll = async (req, res) => {
    // #swagger.tags = ['Deposito']
    // #swagger.description = 'Endpoint para listar Depositos.'
    const { empresa } = req.user;
    const { userId } = req.user;

    if (!(await userCanAccess(permissionGroup, "Mostrar depósito", userId))) {
        const message = "Sem permissão para visualizar os Depósitos.";
        return handleResponse(req, res, 403, [], message);
    }

    const depositos = await knex(tableName).where({ removido: false, empresa });
    const response = [];

    for (let i = 0; i < depositos.length; i++) {
        const conta_bancaria = await knex("conta_bancaria")
            .where({
                empresa,
                removido: false,
                id: depositos[i].conta_bancaria,
            })
            .first();

        const anexo = await knex("anexo")
            .where("id", depositos[i].anexo)
            .first();

        let attach = depositos[i].anexo;
        attach = `${process.env.API_ADDRESS}/static/anexos/${
            (anexo && anexo.nome_ficheiro) || "default.png"
        }`;

        const moeda = await knex("moeda")
            .where({ id: conta_bancaria.moeda })
            .first();

        response.push({
            ...depositos[i],
            conta_bancaria,
            valor: formatCurrency(depositos[i].valor) + " " + moeda.codigo,
            anexo: attach,
        });
    }

    return handleResponse(req, res, 200, {
        items: response,
    });
};

export const getById = async (req, res) => {
    // #swagger.tags = ['Deposito']
    // #swagger.description = 'Endpoint para listar Deposito em função do Id.'
    const { id } = req.params;
    const { empresa } = req.user;
    const { userId } = req.user;

    if (!(await userCanAccess(permissionGroup, "Mostrar depósito", userId))) {
        const message = "Sem permissão para visualizar Depósito.";
        return handleResponse(req, res, 403, [], message);
    }

    const deposito = await knex(tableName)
        .where({ id, empresa, removido: false })
        .first();

    if (!deposito) {
        const message = `Registo não encontrado.`;
        return handleResponse(req, res, 404, [], message);
    }

    const anexo = await knex("anexo").where("id", deposito.anexo).first();

    let attach = deposito.anexo;
    attach = `${process.env.API_ADDRESS}/static/anexos/${
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

    return handleResponse(req, res, 200, { ...deposito, anexo: attach });
};

export const deleteDeposito = async (req, res) => {
    // #swagger.tags = ['Deposito']
    // #swagger.description = 'Endpoint para remover Depositos em função do Id.'
    const { id } = req.params;
    const { empresa } = req.user;
    const { userId } = req.user;

    if (!(await userCanAccess(permissionGroup, "Deletar depósito", userId))) {
        const message = "Sem permissão para deletar Depósito.";
        return handleResponse(req, res, 403, [], message);
    }
    /* #swagger.responses[404] = { 
               schema: { $ref: "#/definitions/IdNo" },
               description:'Removendo Clientes' 
        } */

    knex(tableName)
        .update("removido", true)
        .where({ id, removido: false, empresa })
        .then(async (row) => {
            if (!row) {
                const message = `Registo não encontrado.`;
                return handleResponse(req, res, 404, [], message);
            }
            /* #swagger.responses[200] = { 
               schema: { $ref: "#/definitions/idDelete" },
               description:'Removido com sucesso' 
            } */
            const deposito = await knex(tableName)
                .where({ id, empresa })
                .first();
            const contaBancaria = await knex("conta_bancaria")
                .where({ id: deposito.conta_bancaria })
                .first();

            log({
                item_id: id,
                descricao:
                    "Removido depósito " +
                    contaBancaria.nome_banco +
                    ", conta Bancaria: " +
                    deposito.conta_bancaria,
                tipo: 3,
                tabela: tableName,
                empresa: req.user.empresa,
                usuario_added: userId,
                usuario_updated: userId,
            });

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
        const { name, filename, mimetype } = upload(anexo, "anexos");
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
    const { empresa } = req.user;

    const {
        conta_bancaria,
        valor = "",
        descricao = "",
        codigo_movimento = "",
        data_deposito,
    } = req.body;

    let data = new Date();
    try {
        data = data_deposito
            ? moment(data_deposito).format("Y-M-DD")
            : new Date();
    } catch (error) {}

    return {
        conta_bancaria,
        valor,
        data_deposito: data,
        descricao,
        codigo_movimento,
        usuario_added,
        usuario_updated,
        empresa,
    };
};

const uploadAttach = (anexo, req) => {
    // #swagger.tags = ['Stock']
    // #swagger.description = 'Endpoint para fazer upload de anexo.'
    const { empresa } = req.user;

    try {
        const { name, filename, mimetype } = upload(anexo, "anexos");
        return knex("anexo")
            .insert({
                nome_original: name,
                nome_ficheiro: filename,
                mime_type: mimetype,
                extensao: path.extname(anexo.name),
                empresa,
                usuario_added: req.userId,
                usuario_updated: req.userId,
            })
            .then((id) => id)
            .catch((err) => 1);
    } catch (error) {
        return 1;
    }
};

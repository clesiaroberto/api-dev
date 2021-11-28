import knex from "../database";
import { handleResponse } from "../utils/handleResponse";
import path from "path";
import { upload } from "../helper/UploadFile";
import { userCanAccess } from "../middleware/userCanAccess";
import { log } from "../utils/log";
import { formatCurrency } from "../helper/FormatCurrency";
import moment from "moment";

const permissionGroup = "Transferências";
const tableName = "transferencia";

export const add = async (req, res) => {
    const { userId } = req.user;

    if (
        !(await userCanAccess(permissionGroup, "Criar transferência", userId))
    ) {
        const message = "Sem permissão para Criar transferência.";
        return handleResponse(req, res, 403, [], message);
    }
    // #swagger.tags = ['Deposito']
    // #swagger.description = 'Cadastro de Depositos.'
    const data = dadosValidos(req);

    const ContaBancariaOrigem = await knex("conta_bancaria")
        .where({
            id: data.conta_bancaria_origem,
            removido: false,
            empresa: data.empresa,
        })
        .first();

    const ContaBancariaDestino = await knex("conta_bancaria")
        .where({
            id: data.conta_bancaria_destino,
            removido: false,
            empresa: data.empresa,
        })
        .first();

    if (!ContaBancariaOrigem) {
        const message = "Conta Bancaria de Origem não encontrada";
        return handleResponse(req, res, 404, [], message);
    }

    if (!ContaBancariaDestino) {
        const message = "Conta Bancaria de Destino não encontrada";
        return handleResponse(req, res, 404, [], message);
    }

    let anexoId = 1;
    if (req.files && req.files.anexo) {
        anexoId = await uploadLogotype(req.files.anexo, req);
    }
    data.anexo = anexoId;

    /* #swagger.responses[200] = { 
               schema: { $ref: "#/definitions/registerSuccess" },
               description:'Dados adicionados com sucesso' 
        } */

    knex(tableName)
        .insert(data)
        .then((id) => {
            log({
                item_id: id[0],
                descricao:
                    "Adicionado transferência, conta origem: " +
                    ContaBancariaOrigem.nome_banco +
                    ", conta destino: " +
                    ContaBancariaDestino.nome_banco +
                    ", valor: " +
                    data.valor,
                tipo: 1,
                tabela: tableName,
                empresa: req.user.empresa,
                usuario_added: userId,
                usuario_updated: userId,
            });
            handleResponse(
                req,
                res,
                200,
                { id: id[0] },
                "Dados adicionados com sucesso"
            );
        })
        .catch((err) => handleResponse(res, res, 500, err));
};

export const updateTransferencia = async (req, res) => {
    const { userId } = req.user;

    if (
        !(await userCanAccess(permissionGroup, "Editar transferência", userId))
    ) {
        const message = "Sem permissão para atualizar a transferência.";
        return handleResponse(req, res, 403, [], message);
    }
    // #swagger.tags = ['Deposito']
    // #swagger.description = 'Endpoint para actualizar dados dos Depositos.'
    const { id } = req.params;
    const data = dadosValidos(req);
    data.usuario_added = undefined;

    const transferenciaExists = await knex(tableName)
        .where({ id, removido: false, empresa: data.empresa })
        .first();

    if (!transferenciaExists) {
        return handleResponse(req, res, 404, [], `Registo não encontrado.`);
    }

    const ContaBancariaOrigem = await knex("conta_bancaria")
        .where({
            id: data.conta_bancaria_origem,
            removido: false,
            empresa: data.empresa,
        })
        .first();

    const ContaBancariaDestino = await knex("conta_bancaria")
        .where({
            id: data.conta_bancaria_destino,
            removido: false,
            empresa: data.empresa,
        })
        .first();

    if (!ContaBancariaOrigem) {
        const message = "Conta Bancaria de Origem não encontrada";
        return handleResponse(req, res, 404, [], message);
    }

    if (!ContaBancariaDestino) {
        const message = "Conta Bancaria de Destino não encontrada";
        return handleResponse(req, res, 404, [], message);
    }

    let anexoId = transferenciaExists.anexo;
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

            log({
                item_id: id,
                descricao:
                    "Actualizado transferência conta origem: " +
                    ContaBancariaOrigem.nome_banco +
                    ", conta destino: " +
                    ContaBancariaDestino.nome_banco +
                    ", valor: " +
                    data.valor,
                tipo: 2,
                tabela: tableName,
                empresa: req.user.empresa,
                usuario_added: userId,
                usuario_updated: userId,
            });

            return handleResponse(req, res, 200, { id: id }, message);
        })
        .catch((err) => handleResponse(res, res, 500));
};

export const getAll = async (req, res) => {
    const { userId } = req.user;

    if (
        !(await userCanAccess(permissionGroup, "Mostrar transferência", userId))
    ) {
        const message = "Sem permissão para visualizar as transferência.";
        return handleResponse(req, res, 403, [], message);
    }
    // #swagger.tags = ['Transferencia']
    // #swagger.description = 'Endpoint para listar Transferencia.'
    const { empresa } = req.user;

    const transferencias = await knex(tableName).where({
        removido: false,
        empresa,
    });
    const response = [];

    for (let i = 0; i < transferencias.length; i++) {
        const conta_bancaria_origem = await knex("conta_bancaria")
            .where({
                empresa,
                removido: false,
                id: transferencias[i].conta_bancaria_origem,
            })
            .first();

        const conta_bancaria_destino = await knex("conta_bancaria")
            .where({
                empresa,
                removido: false,
                id: transferencias[i].conta_bancaria_destino,
            })
            .first();

        const moeda = await knex("moeda")
            .where({ id: conta_bancaria_origem.moeda })
            .first();

        response.push({
            ...transferencias[i],
            data_transferencia: moment(
                transferencias[i].data_transferencia
            ).format("DD-MM-yyyy"),
            conta_bancaria_origem,
            conta_bancaria_destino,
            valor: formatCurrency(transferencias[i].valor) + " " + moeda.codigo,
        });
    }

    return handleResponse(req, res, 200, {
        items: response,
    });
};

export const getById = async (req, res) => {
    const { userId } = req.user;

    if (
        !(await userCanAccess(
            permissionGroup,
            "Detalhes da transferência",
            userId
        ))
    ) {
        const message = "Sem permissão para visualizar a transferência.";
        return handleResponse(req, res, 403, [], message);
    }
    // #swagger.tags = ['Transfencia']
    // #swagger.description = 'Endpoint para listar Deposito em função do Id.'
    const { id } = req.params;
    const { empresa } = req.user;

    const transferencia = await knex(tableName)
        .where({ id, empresa, removido: false })
        .first();

    if (!transferencia) {
        const message = `Deposito não encontrado.`;
        return handleResponse(req, res, 404, [], message);
    }

    const anexo = await knex("anexo").where("id", transferencia.anexo).first();

    let attach = transferencia.anexo;
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

    return handleResponse(req, res, 200, { ...transferencia, anexo: attach });
};

export const deleteTransferencia = async (req, res) => {
    const { userId } = req.user;

    if (
        !(await userCanAccess(permissionGroup, "Deletar transferência", userId))
    ) {
        const message = "Sem permissão para deletar transferência.";
        return handleResponse(req, res, 403, [], message);
    }
    // #swagger.tags = ['Deposito']
    // #swagger.description = 'Endpoint para remover Depositos em função do Id.'
    const { id } = req.params;
    const { empresa } = req.user;

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

            const data = await knex(tableName).where({ id, empresa }).first();

            const ContaBancariaOrigem = await knex("conta_bancaria")
                .where({
                    id: data.conta_bancaria_origem,
                    removido: false,
                    empresa: data.empresa,
                })
                .first();

            const ContaBancariaDestino = await knex("conta_bancaria")
                .where({
                    id: data.conta_bancaria_destino,
                    removido: false,
                    empresa: data.empresa,
                })
                .first();

            log({
                item_id: id,
                descricao:
                    "Removido transferência conta origem: " +
                    ContaBancariaOrigem.nome_banco +
                    ", conta destino: " +
                    ContaBancariaDestino.nome_banco +
                    ",  valor: " +
                    data.valor,
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
        conta_bancaria_origem = "",
        conta_bancaria_destino = "",
        valor = "",
        descricao = "",
        codigo_movimento = "",
        data_transferencia,
    } = req.body;

    return {
        conta_bancaria_origem,
        conta_bancaria_destino,
        data_transferencia,
        valor,
        descricao,
        codigo_movimento,
        usuario_added,
        usuario_updated,
        empresa,
    };
};

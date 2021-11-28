import knex from "../database";
import { handleResponse } from "../utils/handleResponse";
import path from "path";
import { upload } from "../helper/UploadFile";
import { userCanAccess } from "../middleware/userCanAccess";
import { log } from "../utils/log";

const permissionGroup = "Despesas";
const tableName = "despesa";

export const add = async (req, res) => {
    // #swagger.tags = ['Despesa']
    // #swagger.description = 'Cadastro de Depositos.'
    const data = dadosValidos(req);
    const { userId } = req.user;

    if (!(await userCanAccess(permissionGroup, "Criar despesa", userId))) {
        const message = "Sem permissão para criar despesa.";
        return handleResponse(req, res, 403, [], message);
    }

    const ContaBancaria = await knex("conta_bancaria")
        .where({
            id: data.conta_bancaria,
            removido: false,
            empresa: data.empresa,
        })
        .first();

    const categoriaDespesa = await knex("categoria_despesa")
        .where({
            id: data.categoria_despesa,
            removido: false,
            empresa: data.empresa,
        })
        .first();

    if (!ContaBancaria) {
        const message = "Conta Bancaria de não encontrada";
        return handleResponse(req, res, 404, [], message);
    }

    if (!categoriaDespesa) {
        const message = "Categoria de despesa não encontrada";
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
            console.log(ContaBancaria);
            console.log(categoriaDespesa);

            log({
                item_id: id[0],
                descricao:
                    "Adicionado despesa categoria: " +
                    categoriaDespesa.nome +
                    ", conta bancaria: " +
                    ContaBancaria.nome_banco +
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

export const updateDespesa = async (req, res) => {
    // #swagger.tags = ['Despesa']
    // #swagger.description = 'Endpoint para actualizar dados dos Depositos.'
    const { id } = req.params;
    const data = dadosValidos(req);
    data.usuario_added = undefined;
    const { userId } = req.user;

    if (!(await userCanAccess(permissionGroup, "Editar despesa", userId))) {
        const message = "Sem permissão para editar despesa.";
        return handleResponse(req, res, 403, [], message);
    }
    const despesaExists = await knex(tableName)
        .where({ id, removido: false, empresa: data.empresa })
        .first();

    if (!despesaExists) {
        return handleResponse(req, res, 404, [], `Registo não encontrado.`);
    }

    const ContaBancaria = await knex("conta_bancaria")
        .where({
            id: data.conta_bancaria,
            removido: false,
            empresa: data.empresa,
        })
        .first();

    const categoriaDespesa = await knex("categoria_despesa")
        .where({
            id: data.categoria_despesa,
            removido: false,
            empresa: data.empresa,
        })
        .first();

    if (!ContaBancaria) {
        const message = "Conta Bancaria de não encontrada";
        return handleResponse(req, res, 404, [], message);
    }

    if (!categoriaDespesa) {
        const message = "Categoria de despesa não encontrada";
        return handleResponse(req, res, 404, [], message);
    }

    let anexoId = despesaExists.anexo;
    if (req.files && req.files.anexo) {
        anexoId = await uploadLogotype(req.files.anexo, req);
    }
    data.usuario_added = undefined;
    data.anexo = anexoId;

    const [updated] = knex(tableName)
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
                    "Actualizado despesa categoria: " +
                    categoriaDespesa.nome +
                    ", conta bancaria: " +
                    ContaBancaria.nome_banco +
                    ", valor: " +
                    data.valor,
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
    // #swagger.tags = ['Despesa']
    // #swagger.description = 'Endpoint para listar Transferencia.'
    const { empresa } = req.user;
    const { userId } = req.user;

    if (!(await userCanAccess(permissionGroup, "Mostrar despesa", userId))) {
        const message = "Sem permissão para visualizar as despesas.";
        return handleResponse(req, res, 403, [], message);
    }
    const despesas = await knex(tableName).where({
        removido: false,
        empresa,
    });
    const response = [];

    for (let i = 0; i < despesas.length; i++) {
        const conta_bancaria = await knex("conta_bancaria")
            .where({
                empresa,
                removido: false,
                id: despesas[i].conta_bancaria,
            })
            .first();
        const categoriaDespesa = await knex("categoria_despesa")
            .where({
                id: despesas[i].categoria_despesa,
            })
            .first();

        const anexo = await knex("anexo")
            .where("id", despesas[i].anexo)
            .first();

        let attach = despesas[i].anexo;
        attach = `${process.env.API_ADDRESS}/static/anexos/${
            (anexo && anexo.nome_ficheiro) || "default.png"
        }`;

        response.push({
            id: despesas[i].id,
            descricao: despesas[i].descricao,
            data: despesas[i].data,
            valor: despesas[i].valor,
            conta_bancaria,
            categoria_despesa: categoriaDespesa.nome,
            referencia: despesas[i].referencia,
            anexo: attach,
            empresa: despesas[i].empresa,
            data_added: despesas[i].data_added,
            data_updated: despesas[i].data_updated,
            usuario_added: despesas[i].usuario_added,
            usuario_updated: despesas[i].usuario_updated,
        });
    }

    return handleResponse(req, res, 200, {
        items: response,
    });
};

export const getById = async (req, res) => {
    // #swagger.tags = ['Despesa']
    // #swagger.description = 'Endpoint para listar Deposito em função do Id.'
    const { id } = req.params;
    const { empresa } = req.user;
    const { userId } = req.user;

    if (
        !(await userCanAccess(permissionGroup, "Detalhes da despesa", userId))
    ) {
        const message = "Sem permissão para visualizar despesa.";
        return handleResponse(req, res, 403, [], message);
    }
    const despesa = await knex(tableName)
        .where({ id, empresa, removido: false })
        .first();

    if (!despesa) {
        const message = `Registo não encontrado.`;
        return handleResponse(req, res, 404, [], message);
    }

    const anexo = await knex("anexo").where("id", despesa.anexo).first();

    let attach = despesa.anexo;
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

    return handleResponse(req, res, 200, { ...despesa, anexo: attach });
};

export const deleteDespesa = async (req, res) => {
    // #swagger.tags = ['Despesa']
    // #swagger.description = 'Endpoint para remover Depositos em função do Id.'
    const { id } = req.params;
    const { empresa } = req.user;
    const { userId } = req.user;

    if (!(await userCanAccess(permissionGroup, "Deletar despesa", userId))) {
        const message = "Sem permissão para deletar despesa.";
        return handleResponse(req, res, 403, [], message);
    }
    /* #swagger.responses[404] = {
               schema: { $ref: "#/definitions/IdNo" },
               description:'Removendo Clientes'
        } */

    const data = await knex(tableName).where({ id, empresa }).first();

    const ContaBancaria = await knex("conta_bancaria")
        .where({
            id: data.conta_bancaria,
            empresa,
        })
        .first();

    const categoriaDespesa = await knex("categoria_despesa")
        .where({
            id: data.categoria_despesa,
            empresa,
        })
        .first();

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

            log({
                item_id: id,
                descricao:
                    "Removido despesa categoria: " +
                    categoriaDespesa.nome +
                    ", conta bancaria: " +
                    ContaBancaria.nome_banco +
                    ", valor: " +
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
        descricao = "",
        valor = "",
        categoria_despesa = "",
        referencia = "",
        conta_bancaria = "",
        data,
    } = req.body;

    let dataF = new Date();
    try {
        dataF = data ? moment(data).format("Y-M-DD") : new Date();
    } catch (error) {}

    return {
        descricao,
        data: dataF,
        valor,
        conta_bancaria,
        categoria_despesa,
        referencia,
        usuario_added,
        usuario_updated,
        empresa,
    };
};

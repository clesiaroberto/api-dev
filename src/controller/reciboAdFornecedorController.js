import knex from "../database";
import { handleResponse } from "../utils/handleResponse";
import { userCanAccess } from "../middleware/userCanAccess";
import { log } from "../utils/log";
import { formatCurrency } from "../helper/FormatCurrency";

const permissionGroup = "Adiantamento ao Fornecedor";
const tableName = "adiantamento_fornecedor";

export const all = async (req, res) => {
    const { userId } = req.user;

    if (
        !(await userCanAccess(permissionGroup, "Mostrar Adiantamento", userId))
    ) {
        const message = "Sem permissão para visualizar os Adiantamentos.";
        return handleResponse(req, res, 403, [], message);
    }
    // const data = dadosValidos(req);
    // #swagger.tags = ['Adiantamento a Fornecedor']
    // #swagger.description = 'Recibo de adiantamento Fornecedor'

    const { empresa } = req.user;
    const fornecedorAd = await knex(tableName).where({
        removido: false,
        empresa,
    });

    const response = [];
    const empresaAssociada = await knex("empresa")
        .where({ id: empresa })
        .first();
    const moeda = await knex("moeda")
        .where({ id: empresaAssociada.moeda_padrao })
        .first();

    let date = new Date();

    for (let i = 0; i < fornecedorAd.length; i++) {
        response.push({
            ...fornecedorAd[i],
            valor: fornecedorAd[i].valor,
            valor_formatado:
                formatCurrency(fornecedorAd[i].valor) + " " + moeda.codigo,
            data_emissao: `${date.getDate(fornecedorAd[i])}-${date.getMonth(
                fornecedorAd[i]
            )}-${date.getFullYear(fornecedorAd[i])}`,
            referencia: numeroDocFormat(fornecedorAd[i]),
        });
    }

    return handleResponse(req, res, 200, response);
};

export const create = async (req, res) => {
    const { userId } = req.user;

    if (!(await userCanAccess(permissionGroup, "Criar Adiantamento", userId))) {
        const message = "Sem permissão para criar os Adiantamentos.";
        return handleResponse(req, res, 403, [], message);
    }
    // #swagger.tags = ['Recibo']
    // #swagger.description = 'Recibo de adiantamento Fornecedor'
    const data = dadosValidos(req);

    if (
        !(await knex("fornecedor")
            .where({
                id: data.fornecedor,
                empresa: data.empresa,
                removido: false,
            })
            .first())
    ) {
        return handleResponse(req, res, 409, [], "Fornecedor não encontrado");
    }

    if (
        !(await knex("metodo_pagamento")
            .where({
                id: data.metodo_pagamento,
                removido: false,
            })
            .first())
    ) {
        const message = "Método de pagamento não encontrado";
        return handleResponse(req, res, 409, [], message);
    }

    const check_number = await knex(tableName).orderBy("id", "desc").first();

    let num = 1;
    if (typeof check_number == "undefined") {
        num = 1;
    } else {
        if (
            new Date(check_number.data_added).getFullYear() ==
            new Date().getFullYear()
        ) {
            num = check_number.numero + 1;
        } else {
            num = 1;
        }
    }

    try {
        const [ad] = await knex(tableName).insert({
            numero: num,
            fornecedor: data.fornecedor,
            descricao: data.descricao,
            valor: data.valor,
            metodo_pagamento: data.metodo_pagamento,
            nome_banco: data.nome_banco,
            numero_cheque: data.numero_cheque,
            codigo_movimento: data.codigo_movimento,
            data_emissao: data.data_emissao,
            empresa: data.empresa,
            usuario_added: data.usuario_added,
            usuario_updated: data.usuario_updated,
        });

        const message = ` Dados adicionados com sucesso.`;

        const fornecedor = await knex("fornecedor")
            .where({ id: data.fornecedor, empresa: data.empresa })
            .first();
        const metodo_pagamento = await await knex("metodo_pagamento")
            .where({ id: data.metodo_pagamento, removido: false })
            .first();

        log({
            item_id: ad,
            descricao:
                "Adcionado adiantamento fornecedor: " +
                fornecedor.nome +
                ", metodo do pagamento: " +
                metodo_pagamento.metodo +
                ", valor: " +
                data.valor,
            tipo: 1,
            tabela: tableName,
            empresa: req.user.empresa,
            usuario_added: userId,
            usuario_updated: userId,
        });

        return handleResponse(req, res, 200, { id: ad });
    } catch (error) {
        handleResponse(req, res, 500, error);
    }
};

export const findById = async (req, res) => {
    const { userId } = req.user;

    if (
        !(await userCanAccess(
            permissionGroup,
            "Detalhes do Adiantamento",
            userId
        ))
    ) {
        const message = "Sem permissão para visualizar o Adiantamento.";
        return handleResponse(req, res, 403, [], message);
    }
    // #swagger.tags = ['Recibo']
    // #swagger.description = 'Endpoint para listar Recibo por Id'
    const { id } = req.params;
    const { empresa } = req.user;

    const recibo = await knex(tableName)
        .where({
            id,
            empresa,
            removido: false,
        })
        .first();
    const empresaAssociada = await knex("empresa")
        .where({ id: empresa })
        .first();
    const moeda = await knex("moeda")
        .where({ id: empresaAssociada.moeda_padrao })
        .first();

    if (!recibo) {
        return handleResponse(req, res, 404, [], "Registo não encontrado.");
    }

    return handleResponse(req, res, 200, {
        ...recibo,
        valor_formatado: formatCurrency(recibo.valor) + " " + moeda.codigo,
        referencia: numeroDocFormat(recibo),
    });
};

export const findByAdiantamento = async (req, res) => {
    const { userId } = req.user;

    if (
        !(await userCanAccess(
            permissionGroup,
            "Detalhes do Adiantamento",
            userId
        ))
    ) {
        const message = "Sem permissão para visualizar o Adiantamento.";
        return handleResponse(req, res, 403, [], message);
    }
    // #swagger.tags = ['Recibo']
    // #swagger.description = 'Endpoint para listar Recibo por Id'
    const { fornecedor } = req.params;
    const { empresa } = req.user;
    let response = [];

    const recibo = await knex(tableName)
        .where({
            fornecedor,
            empresa,
            removido: false,
        })
        .first();
    const empresaAssociada = await knex("empresa")
        .where({ id: empresa })
        .first();
    const moeda = await knex("moeda")
        .where({ id: empresaAssociada.moeda_padrao })
        .first();

    if (!recibo) {
        return handleResponse(req, res, 404, [], "Registo não encontrado.");
    }
    response.push({
        ...recibo,
        valor_formatado: formatCurrency(recibo.valor) + " " + moeda.codigo,
        referencia: numeroDocFormat(recibo),
    });

    return handleResponse(req, res, 200, { items: response });
};

export const update = async (req, res) => {
    // #swagger.tags = ['Recibo']
    // #swagger.description = 'Endpoint para actualizar Recibo'
    const { id } = req.params;
    const { userId } = req.user;

    if (
        !(await userCanAccess(permissionGroup, "Editar Adiantamento", userId))
    ) {
        const message = "Sem permissão para editar os Adiantamentos.";
        return handleResponse(req, res, 403, [], message);
    }
    const data = dadosValidos(req);
    data.usuario_added = undefined;

    if (
        !(await knex("fornecedor")
            .where({
                id: data.fornecedor,
                empresa: data.empresa,
                removido: false,
            })
            .first())
    ) {
        return handleResponse(req, res, 409, [], "Fornecedor não encontrado");
    }

    if (
        !(await knex("metodo_pagamento")
            .where({
                id: data.metodo_pagamento,
                removido: false,
            })
            .first())
    ) {
        return handleResponse(
            req,
            res,
            409,
            [],
            "Método de pagamento não encontrado"
        );
    }

    try {
        const [updated] = await knex(tableName)
            .update(data)
            .where({ id, removido: false, empresa: data.empresa })
            .then(async () => {
                const message = "Atualizado com sucesso.";

                const fornecedor = await knex("fornecedor")
                    .where({ id: data.fornecedor, empresa: data.empresa })
                    .first();
                const metodo_pagamento = await await knex("metodo_pagamento")
                    .where({ id: data.metodo_pagamento, removido: false })
                    .first();

                log({
                    item_id: id,
                    descricao:
                        "Actualizado adiantamento fornecedor: " +
                        fornecedor.nome +
                        ", metodo do pagamento: " +
                        metodo_pagamento.metodo +
                        ", valor: " +
                        data.valor,
                    tipo: 3,
                    tabela: tableName,
                    empresa: req.user.empresa,
                    usuario_added: userId,
                    usuario_updated: userId,
                });

                return handleResponse(req, res, 200, { id: id });
            });
    } catch (err) {
        return handleResponse(req, res, 500, [], err);
    }
};

export const remove = async (req, res) => {
    const { id } = req.params;
    const { userId } = req.user;

    if (
        !(await userCanAccess(permissionGroup, "Deletar Adiantamento", userId))
    ) {
        const message = "Sem permissão para deletar os Adiantamentos.";
        return handleResponse(req, res, 403, [], message);
    }
    const { empresa } = req.user;

    const data = await knex(tableName).where({ id, empresa }).first();

    knex(tableName)
        .update("removido", true)
        .where({ id, removido: false, empresa })
        .then(async (row) => {
            if (!row) {
                return handleResponse(
                    req,
                    res,
                    404,
                    [],
                    `Registo não encontrado.`
                );
            }

            const fornecedor = await knex("fornecedor")
                .where({ id: data.fornecedor, empresa: data.empresa })
                .first();
            const metodo_pagamento = await await knex("metodo_pagamento")
                .where({ id: data.metodo_pagamento, removido: false })
                .first();

            log({
                item_id: id,
                descricao:
                    "Removido adiantamento fornecedor: " +
                    fornecedor.nome +
                    ", metodo do pagamento: " +
                    metodo_pagamento.metodo +
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
        .catch((err) => handleResponse(req, res, 500));
};

export const getLastInsertedFornecedor = async (req, res) => {
    // #swagger.tags = ['Documento']
    // #swagger.description = 'Endpoint para listar ultimo documento Inserido'

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

const dadosValidos = (req) => {
    const usuario_added = req.userId;
    const usuario_updated = req.userId;
    const { empresa } = req.user;

    const {
        fornecedor,
        descricao,
        valor,
        metodo_pagamento,
        nome_banco,
        numero_cheque,
        codigo_movimento,
        data_emissao = new Date(),
    } = req.body;

    let data = new Date();
    try {
        data = data_emissao
            ? moment(data_emissao).format("Y-M-DD")
            : new Date();
    } catch (error) {}

    return {
        fornecedor,
        metodo_pagamento,
        data_emissao: data,
        nome_banco,
        descricao,
        valor,
        numero_cheque,
        codigo_movimento,
        empresa,
        usuario_added,
        usuario_updated,
    };
};

export const numeroDocFormat = (fornecedorAd) => {
    return `AF-${("0000" + fornecedorAd.numero).slice(-4)}/${new Date(
        fornecedorAd.data_added
    ).getFullYear()}`;
};

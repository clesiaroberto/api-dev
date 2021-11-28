import knex from "../database";
import { handleResponse } from "../utils/handleResponse";
import moment from "moment";
import { numeroDocFormat as documentoNumeroDocFormat } from "./DocumentoController";
import { numeroDocFormat as reciboAdNumeroDocFormat } from "./reciboAdController";
import { userCanAccess } from "../middleware/userCanAccess";
import { formatCurrency } from "../helper/FormatCurrency";

const permissionGroup = "Recibos";
const tableName = "recibo";

export const all = async (req, res) => {
    const { userId } = req.user;

    if (!(await userCanAccess(permissionGroup, "Mostrar Recibo", userId))) {
        const message = "Sem permissão para visualizar os recibos.";
        return handleResponse(req, res, 403, [], message);
    }
    // #swagger.tags = ['Recibo']
    // #swagger.description = 'Endpoint para listar Recibo'
    const { empresa } = req.user;
    const recibo = await knex(tableName).where({
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

    try {
        for (let i = 0; i < recibo.length; i++) {
            let total = 0;
            const reciboItems = await knex("recibo_item").where({
                recibo: recibo[i].id,
            });

            reciboItems.map((item) => {
                if (item.recibo_adiantamento) {
                    return (total -= item.valor);
                }

                return (total += item.valor);
            });

            response.push({
                ...recibo[i],
                referencia: numeroDocFormat(recibo[i]),
                data_emissao: moment(recibo[i].data_emissao).format(
                    "DD-MM-yyyy"
                ),
                total,
                total_formatado: formatCurrency(total) + " " + moeda.codigo,
            });
        }

        return handleResponse(req, res, 200, response);
    } catch (error) {
        console.log(error);
        return handleResponse(req, res, 500);
    }
};

export const create = async (req, res) => {
    const { userId } = req.user;

    if (!(await userCanAccess(permissionGroup, "Criar Recibo", userId))) {
        const message = "Sem permissão para criar os recibos.";
        return handleResponse(req, res, 403, [], message);
    }
    // #swagger.tags = ['Recibo']
    // #swagger.description = 'Endpoint para criar Recibo'
    const data = dadosValidos(req);
    const { reciboItems = [] } = req.body;
    const { pagamentoItems = [] } = req.body;

    if (
        !(await knex("cliente")
            .where({
                id: data.cliente,
                empresa: data.empresa,
                removido: false,
            })
            .first())
    ) {
        return handleResponse(req, res, 409, [], "Cliente não encontrado");
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
        return handleResponse(req, res, 404, [], message);
    }

    if (
        !(await knex("conta_bancaria")
            .where({
                id: data.conta_bancaria,
                empresa: data.empresa,
                removido: false,
            })
            .first())
    ) {
        const message = "Conta Bancária não encontrada";
        return handleResponse(req, res, 404, [], message);
    }

    if (reciboItems.length == 0) {
        const message = "Nenhum item selecionado.";
        return handleResponse(req, res, 400, [], message);
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
        const [created] = await knex(tableName).insert({
            numero: num,
            cliente: data.cliente,
            conta_bancaria: data.conta_bancaria,
            metodo_pagamento: data.metodo_pagamento,
            data_emissao: data.data_emissao,
            nome_banco: data.nome_banco,
            codigo_movimento: data.codigo_movimento,
            empresa: data.empresa,
            usuario_added: data.usuario_added,
            usuario_updated: data.usuario_updated,
        });

        pagamentoItems.map(async (item) => {
            await knex("metodo_pagamento_recibo").insert({
                recibo: created,
                metodo_pagamento: item.metodo_pagamento,
                conta_bancaria: item.conta_bancaria,
                nome_banco: item.nome_banco,
                codigo_movimento: item.codigo_movimento,
                valor: item.valor,
                usuario_added: data.usuario_added,
                usuario_updated: data.usuario_updated,
            });
        });

        let count = 0;
        reciboItems.map(async (item) => {
            if (item.valor > 0) {
                count++;
                if (
                    await knex("documento")
                        .where({ id: item.documento, empresa: data.empresa })
                        .first()
                ) {
                    await knex("recibo_item").insert({
                        recibo: created,
                        documento: item.documento,
                        recibo_adiantamento: null,
                        valor: item.valor,
                        usuario_added: data.usuario_added,
                        usuario_updated: data.usuario_updated,
                    });
                } else if (
                    await knex("recibo_adiantamento")
                        .where({
                            id: item.recibo_adiantamento,
                            empresa: data.empresa,
                        })
                        .first()
                ) {
                    await knex("recibo_item").insert({
                        recibo: created,
                        documento: null,
                        recibo_adiantamento: item.recibo_adiantamento,
                        valor: item.valor,
                        usuario_added: data.usuario_added,
                        usuario_updated: data.usuario_updated,
                    });
                }
            }
        });

        // if (count == 0) {
        //     await knex("recibo").where({ id: created }).del();
        //     const message = "Nenhum item selecionado.";
        //     return handleResponse(req, res, 400, [], message);
        // }

        const message = ` Dados adicionados com sucesso.`;

        return handleResponse(req, res, 200, created, message);
    } catch (error) {
        console.log(error);
        handleResponse(req, res, 500, error);
    }
};

export const findById = async (req, res) => {
    const { userId } = req.user;

    if (!(await userCanAccess(permissionGroup, "Detalhes do Recibo", userId))) {
        const message = "Sem permissão para visualizar o recibo.";
        return handleResponse(req, res, 403, [], message);
    }
    // #swagger.tags = ['Recibo']
    // #swagger.description = 'Endpoint para listar Recibo por Id'
    const { id } = req.params;
    const { empresa } = req.user;
    const metodoPagamentoRecibos = [];
    const recibo = await knex(tableName)
        .where({
            id,
            empresa,
            removido: false,
        })
        .first();

    if (!recibo) {
        return handleResponse(req, res, 404, [], "Registo não encontrado.");
    }

    const metodoPagamentoRecibo = await knex("metodo_pagamento_recibo").where({
        recibo: recibo.id,
    });
    console.log(metodoPagamentoRecibo);

    const empresaAssociada = await knex("empresa")
        .where({ id: empresa })
        .first();
    const moeda = await knex("moeda")
        .where({ id: empresaAssociada.moeda_padrao })
        .first();

    for (let i = 0; i < metodoPagamentoRecibo.length; i++) {
        metodoPagamentoRecibos.push({
            ...metodoPagamentoRecibo[i],
            data_pagamento: moment(
                metodoPagamentoRecibo[i].data_emissao
            ).format("DD-MM-yyyy"),
            valor_formatado:
                formatCurrency(metodoPagamentoRecibo[i].valor) +
                " " +
                moeda.codigo,
            metodo_pagamento: await knex("metodo_pagamento")
                .select(["id", "metodo"])
                .where({ id: metodoPagamentoRecibo[i].metodo_pagamento }),
            conta_bancaria: await knex("conta_bancaria")
                .select(["id", "nome_banco"])
                .where({ id: metodoPagamentoRecibo[i].conta_bancaria }),
        });
    }

    const reciboItems = await knex("recibo_item").where({ recibo: recibo.id });
    let total = 0;
    for (let i = 0; i < reciboItems.length; i++) {
        reciboItems[i].valor_f =
            formatCurrency(reciboItems[i].valor) + " " + moeda.codigo;
        if (reciboItems[i].documento) {
            total += reciboItems[i].valor;
            reciboItems[i].documento = await knex("documento")
                .select([
                    "id",
                    "prefixo",
                    "numero",
                    "tipo_doc",
                    "cliente",
                    "data_emissao",
                    "data_added",
                ])
                .where({ id: reciboItems[i].documento })
                .first();
            reciboItems[i].documento.referencia = documentoNumeroDocFormat(
                reciboItems[i].documento
            );
            reciboItems[i].documento.data_emissao = moment(
                reciboItems[i].data_emissao
            ).format("DD-MM-yyyy");
        } else {
            total -= reciboItems[i].valor;
            reciboItems[i].recibo_adiantamento = await knex(
                "recibo_adiantamento"
            )
                .select([
                    "id",
                    "numero",
                    "valor",
                    "cliente",
                    "data_emissao",
                    "data_added",
                ])
                .where({ id: reciboItems[i].recibo_adiantamento })
                .first();
            reciboItems[i].recibo_adiantamento.referencia =
                reciboAdNumeroDocFormat(reciboItems[i].recibo_adiantamento);
            reciboItems[i].recibo_adiantamento.total =
                reciboItems[i].recibo_adiantamento.valor;
            reciboItems[i].recibo_adiantamento.valor_formatado =
                formatCurrency(reciboItems[i].recibo_adiantamento.valor) +
                " " +
                moeda.codigo;
            reciboItems[i].recibo_adiantamento.total_formatado =
                formatCurrency(reciboItems[i].recibo_adiantamento.valor) +
                " " +
                moeda.codigo;
            reciboItems[i].recibo_adiantamento.data_emissao = moment(
                reciboItems[i].data_emissao
            ).format("DD-MM-yyyy");
        }
    }

    return handleResponse(req, res, 200, {
        ...recibo,
        data_emissao: moment(recibo.data_emissao).format("DD-MM-yyyy"),
        referencia: numeroDocFormat(recibo),
        reciboItems,
        data_emissao: moment(reciboItems.data_emissao).format("DD-MM-yyyy"),
        metodoPagamentoRecibos,
        total,
        total_formatado: formatCurrency(total) + " " + moeda.codigo,
    });
};

export const findByCliente = async (req, res) => {
    const { userId } = req.user;
    const { cliente } = req.params;

    if (!(await userCanAccess(permissionGroup, "Mostrar Recibo", userId))) {
        const message = "Sem permissão para visualizar os recibos.";
        return handleResponse(req, res, 403, [], message);
    }
    // #swagger.tags = ['Recibo']
    // #swagger.description = 'Endpoint para listar Recibo'
    const { empresa } = req.user;
    const recibo = await knex(tableName).where({
        cliente,
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

    try {
        for (let i = 0; i < recibo.length; i++) {
            let total = 0;
            const reciboItems = await knex("recibo_item").where({
                recibo: recibo[i].id,
            });

            reciboItems.map((item) => {
                if (item.recibo_adiantamento) {
                    return (total -= item.valor);
                }

                return (total += item.valor);
            });

            response.push({
                ...recibo[i],
                referencia: numeroDocFormat(recibo[i]),
                data_emissao: moment(recibo[i].data_emissao).format(
                    "DD-MM-yyyy"
                ),
                total,
                total_formatado: formatCurrency(total) + " " + moeda.codigo,
            });
        }

        return handleResponse(req, res, 200, response);
    } catch (error) {
        console.log(error);
        return handleResponse(req, res, 500);
    }
};

export const update = async (req, res) => {
    const { userId } = req.user;

    if (!(await userCanAccess(permissionGroup, "Editar Recibo", userId))) {
        const message = "Sem permissão para editar recibo.";
        return handleResponse(req, res, 403, [], message);
    }
    // #swagger.tags = ['Recibo']
    // #swagger.description = 'Endpoint para actualizar Recibo'
    const { id } = req.params;
    const data = dadosValidos(req);
    data.usuario_added = undefined;
    const { documento, valor } = req.body;

    if (
        !(await knex("cliente")
            .where({
                id: data.cliente,
                empresa: data.empresa,
                removido: false,
            })
            .first())
    ) {
        return handleResponse(req, res, 409, [], "Cliente não encontrado");
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

    if (
        !(await knex("conta_bancaria")
            .where({
                id: data.conta_bancaria,
                empresa: data.empresa,
                removido: false,
            })
            .first())
    ) {
        return handleResponse(
            req,
            res,
            409,
            [],
            "Conta Bancária não encontrada"
        );
    }
    if (
        !(await knex("documento")
            .where({
                id: documento,
                removido: false,
            })
            .first())
    ) {
        return handleResponse(req, res, 404, [], "Documento não encontrado");
    }

    // const knx = await knex(tableName)
    //     .where({ id: id, removido: false, empresa: data.empresa })
    //     .first();

    // if (!knx) {
    //     return handleResponse(req, res, 404, [], `Registo mao encontrado.`);
    // }
    const updated = knex(tableName)
        .update(data)
        .where({ id: id, removido: false, empresa: data.empresa })
        .then((row) => {
            if (!row) {
                return handleResponse(
                    req,
                    res,
                    404,
                    [],
                    `Registo nao encontrado.`
                );
            }
            const recibo_item = knex("recibo_item")
                .update({
                    documento,
                    valor,
                })
                .where({ recibo: id, removido: false });

            const message = "Atualizado com sucesso.";
            return handleResponse(req, res, 200, { id: id }, message);
        })
        .catch((err) => handleResponse(res, res, 500));
};

export const remove = async (req, res) => {
    const { userId } = req.user;

    if (!(await userCanAccess(permissionGroup, "Deletar Recibo", userId))) {
        const message = "Sem permissão para deletar recibo.";
        return handleResponse(req, res, 403, [], message);
    }
    const { id } = req.params;
    const { empresa } = req.user;

    knex(tableName)
        .update("removido", true)
        .where({ id, removido: false, empresa })
        .then((row) => {
            if (!row) {
                return handleResponse(
                    req,
                    res,
                    404,
                    [],
                    `Registo não encontrado.`
                );
            }

            return handleResponse(req, res, 200, [], `Removido com sucesso.`);
        })
        .catch((err) => handleResponse(req, res, 500));
};

const dadosValidos = (req) => {
    const usuario_added = req.userId;
    const usuario_updated = req.userId;
    const { empresa } = req.user;

    const {
        cliente,
        conta_bancaria,
        metodo_pagamento,
        nome_banco,
        codigo_movimento,
        data_emissao,
    } = req.body;
    let data = new Date();
    try {
        data = data_emissao
            ? moment(data_emissao).format("Y-M-DD")
            : new Date();
    } catch (error) {}

    return {
        cliente,
        conta_bancaria,
        metodo_pagamento,
        nome_banco,
        codigo_movimento,
        data_emissao: data,
        empresa,
        usuario_added,
        usuario_updated,
    };
};

export const numeroDocFormat = (recibo) => {
    return `RE-${("0000" + recibo.numero).slice(-4)}/${new Date(
        recibo.data_added
    ).getFullYear()}`;
};

export const getLastInsertedRecibo = async (req, res) => {
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

import knex from "../database";
import { handleResponse } from "../utils/handleResponse";
import { userCanAccess } from "../middleware/userCanAccess";
import { log } from "../utils/log";
import { formatCurrency } from "../helper/FormatCurrency";
import moment from "moment";

const permissionGroup = "Contas Bancárias";
const tableName = "conta_bancaria";

export const all = async (req, res) => {
    // #swagger.tags = ['Conta Bancária']
    // #swagger.description = 'Endpoint para listar Conta Bancária'
    const { empresa, userId } = req.user;
    const { activo } = req.query;
    const response = [];

    if (
        !(await userCanAccess(
            permissionGroup,
            "Mostrar conta bancaria",
            userId
        ))
    ) {
        const message = "Sem permissão para visualizar a conta bancaria.";
        return handleResponse(req, res, 403, [], message);
    }

    let contasBancaria = [];

    if (activo) {
        contasBancaria = await knex(tableName).where({
            removido: false,
            empresa,
            activo,
        });
    } else {
        contasBancaria = await knex(tableName).where({
            removido: false,
            empresa,
        });
    }

    for (let i = 0; i < contasBancaria.length; i++) {
        let docExists = await knex("documento")
            .select(["id"])
            .where({ conta_bancaria: contasBancaria[i].id })
            .first();

        if (!docExists) {
            docExists = await knex("recibo")
                .select(["id"])
                .where({ conta_bancaria: contasBancaria[i].id })
                .first();
        }
        if (!docExists) {
            docExists = await knex("pagamento_fornecedor")
                .select(["id"])
                .where({ conta_bancaria: contasBancaria[i].id })
                .first();
        }
        const getSaldo = await knex("saldo_banco")
            .where({
                empresa,
                id: contasBancaria[i].id,
            })
            .first();
        const moeda = await knex("moeda")
            .where({ id: contasBancaria[i].moeda })
            .first();

        response.push({
            ...contasBancaria[i],
            saldo: getSaldo.saldo,
            saldo_formatado:
                formatCurrency(getSaldo.saldo) + " " + moeda.codigo,
            docExists,
        });
    }

    return handleResponse(req, res, 200, { items: response });
};

export const getTransacoes = async (req, res) => {
    const { empresa } = req.user;
    const { conta_bancaria } = req.params;
    let response = [];

    const getTransacao = await knex("transacoes").where({
        conta_bancaria,
        empresa,
    });

    const contaBancaria = await knex("conta_bancaria")
        .where({ id: conta_bancaria })
        .first();

    const moeda = await knex("moeda")
        .where({ id: contaBancaria.moeda })
        .first();

    if (!getTransacao) {
        const message = "Nenhum registo encontrado";
        return handleResponse(req, res, 404, [], message);
    }
    for (let i = 0; i < getTransacao.length; i++) {
        response.push({
            ...getTransacao[i],
            total_formatado:
                formatCurrency(getTransacao[i].total) + " " + moeda.codigo,
            data: moment(getTransacao[i].data).format("DD-MM-yyyy"),
        });
    }

    return handleResponse(req, res, 200, {
        items: response,
    });
};

export const create = async (req, res) => {
    // #swagger.tags = ['Conta Bancária']
    // #swagger.description = 'Endpoint para cadastrar Conta Bancária'
    const data = dadosValidos(req);
    const { userId } = req.user;

    if (
        !(await userCanAccess(permissionGroup, "Criar conta bancaria", userId))
    ) {
        const message = "Sem permissão para criar a conta bancaria.";
        return handleResponse(req, res, 403, [], message);
    }

    if (
        await knex(tableName)
            .where({
                numero_conta: data.numero_conta,
                empresa: data.empresa,
                removido: false,
            })
            .first()
    ) {
        const message = "Número da conta já registado";
        return handleResponse(req, res, 409, [], message);
    }

    if (
        data.nib &&
        (await knex(tableName)
            .where({
                nib: data.nib,
                empresa: data.empresa,
                removido: false,
            })
            .first())
    ) {
        return handleResponse(req, res, 409, [], "NIB já registado");
    }

    try {
        const [created] = await knex(tableName).insert(data);
        const message = "Dados adicionados com sucesso.";

        log({
            item_id: created,
            descricao:
                "Adcionado conta bancária " +
                data.abreviatura_banco +
                ", N° da Conta: " +
                data.numero_conta,
            tipo: 1,
            tabela: tableName,
            empresa: req.user.empresa,
            usuario_added: userId,
            usuario_updated: userId,
        });

        return handleResponse(req, res, 200, { id: created }, message);
    } catch (error) {
        return handleResponse(req, res, 500, error);
    }
};

export const findById = async (req, res) => {
    // #swagger.tags = ['Conta Bancária']
    // #swagger.description = 'Endpoint para listar Conta Bancária por Id'
    const { id } = req.params;
    const { userId } = req.user;
    const { empresa } = req.user;

    if (
        !(await userCanAccess(
            permissionGroup,
            "Mostrar conta bancaria",
            userId
        ))
    ) {
        const message = "Sem permissão para visualizar a conta bancaria.";
        return handleResponse(req, res, 403, [], message);
    }

    const contaBancaria = await knex(tableName)
        .where({
            id,
            empresa: req.user.empresa,
        })
        .first();

    const getSaldo = await knex("saldo_banco")
        .where({
            empresa,
            id: contaBancaria.id,
        })
        .first();
    const moeda = await knex("moeda")
        .where({ id: contaBancaria.moeda })
        .first();

    if (!contaBancaria) {
        return handleResponse(
            req,
            res,
            404,
            [],
            "Conta bancária não registada."
        );
    }

    return handleResponse(req, res, 200, {
        ...contaBancaria,
        saldo: getSaldo.saldo,
        saldo_formatado: formatCurrency(getSaldo.saldo) + " " + moeda.codigo,
    });
};

export const update = async (req, res) => {
    // #swagger.tags = ['Conta Bancária']
    // #swagger.description = 'Endpoint para actualizar Conta Bancária'
    const { id } = req.params;
    const { userId } = req.user;

    if (
        !(await userCanAccess(permissionGroup, "Editar conta bancaria", userId))
    ) {
        const message = "Sem permissão para editar a conta bancaria.";
        return handleResponse(req, res, 403, [], message);
    }
    const data = dadosValidos(req);
    data.usuario_added = undefined;

    const [updated] = knex(tableName)
        .update(data)
        .where({ id, removido: false, empresa: data.empresa })
        .then((row) => {
            if (!row) {
                const message = "Registo não encontrado.";
                return handleResponse(req, res, 404, [], message);
            }

            const message = "Atualizado com sucesso.";

            log({
                item_id: id,
                descricao:
                    "Actualizado conta bancária " +
                    data.abreviatura_banco +
                    ", N° da Conta: " +
                    data.numero_conta,
                tipo: 2,
                tabela: tableName,
                empresa: req.user.empresa,
                usuario_added: userId,
                usuario_updated: userId,
            });

            return handleResponse(req, res, 200, { id: id });
        })
        .catch((err) => handleResponse(res, res, 500, err));
};

export const remove = async (req, res) => {
    const { id } = req.params;
    const { empresa } = req.user;
    const { userId } = req.user;

    if (
        !(await userCanAccess(
            permissionGroup,
            "Deletar conta bancaria",
            userId
        ))
    ) {
        const message = "Sem permissão para deletar a conta bancaria.";
        return handleResponse(req, res, 403, [], message);
    }

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

            const updated = await knex(tableName)
                .where({ id, empresa })
                .first();

            log({
                item_id: id,
                descricao:
                    "Removido conta bancária " +
                    updated.abreviatura_banco +
                    ", N° da Conta: " +
                    updated.numero_conta,
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

export const getLastInsertedContaBancaria = async (req, res) => {
    // #swagger.tags = ['Documento']
    // #swagger.description = 'Endpoint para listar ultimo documento Inserido'

    const lastInserted = await knex("conta_bancaria")
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
        abreviatura_banco,
        nome_banco,
        numero_conta,
        nib,
        swift,
        iban,
        mostrar_no_doc,
        moeda,
        activo = 1,
    } = req.body;

    return {
        abreviatura_banco,
        nome_banco,
        numero_conta,
        nib,
        swift,
        iban,
        mostrar_no_doc,
        empresa,
        usuario_added,
        usuario_updated,
        moeda,
        activo,
    };
};

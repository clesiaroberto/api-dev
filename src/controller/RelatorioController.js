import knex from "../database";
import { handleResponse } from "../utils/handleResponse";
import { userCanAccess } from "../middleware/userCanAccess";
import moment from "moment";
import XLSX from "xlsx";

export const getPendenteClientes = async (req, res) => {
    const { userId } = req.user;

    if (
        !(await userCanAccess(
            "Pendentes dos Clientes",
            "Mostrar pendentes",
            userId
        ))
    ) {
        const message = "Sem permissão para visualizar os pendentes.";
        return handleResponse(req, res, 403, [], message);
    }

    const { empresa } = req.user;
    const response = [];
    const pendenteClientes = await knex("pendente_cliente").where({ empresa });
    let lastCliente = 0;
    let cliente = {};
    let total = 0;

    for (let i = 0; i < pendenteClientes.length; i++) {
        const index = response.findIndex((item) => {
            return item.id == pendenteClientes[i].cliente;
        });
        if (pendenteClientes[i].move_a_credito) {
            pendenteClientes[i].saldo = -pendenteClientes[i].saldo;
        }

        if (index >= 0) {
            response[index].group.push({
                ...pendenteClientes[i],
                valor_pago: pendenteClientes[i].valor_pago.toFixed(2),
            });
        } else {
            if (lastCliente != pendenteClientes[i].cliente) {
                cliente = await knex("cliente")
                    .select(["id", "nome"])
                    .where({
                        id: pendenteClientes[i].cliente,
                    })
                    .first();
            }
            response.push({
                ...cliente,
                group: [
                    {
                        ...pendenteClientes[i],
                        valor_pago: pendenteClientes[i].valor_pago.toFixed(2),
                    },
                ],
            });
        }
    }

    for (let i = 0; i < response.length; i++) {
        let subTotal = 0;

        response[i].group.map((group) => (subTotal += Number(group.saldo)));
        response[i].subTotal = subTotal.toFixed(2);
        total += subTotal;
    }
    return handleResponse(req, res, 200, { total, items: response });
};

export const getRelatorioStock = async (req, res) => {
    const { empresa } = req.user;
    let relatorio = [];
    let armazensWithName = [];
    try {
        const stock = await knex("stock")
            .select(["stock.*"])
            .leftJoin("empresa", "stock.empresa", "empresa.id")
            .where("empresa.id", empresa);

        const armazens = await knex("estado_stock").where("empresa", empresa);

        for (let i = 0; i < armazens.length; i++) {
            const armazemName = await knex("armazem")
                .where("id", armazens[i].armazem)
                .where("empresa", empresa)
                .where("removido", 0)
                .first();
            if (armazemName || armazens[i].armazem == null) {
                const obj = {
                    ...armazens[i],
                    name: armazemName,
                };

                armazensWithName.push(obj);
            }
        }

        for (let i = 0; i < stock.length; i++) {
            const armazensDisponivel = await knex("estado_stock")
                .where("stock", stock[i].id)
                .where("empresa", empresa);
            const obj = {
                ...stock[i],
                armazemDisponivel: armazensDisponivel,
            };

            relatorio.push(obj);
        }

        //return console.log(armazensWithName);

        return handleResponse(req, res, 200, {
            relatorio,
            armazens: armazensWithName,
        });
    } catch (err) {
        return handleResponse(req, res, 500, {
            error: err,
        });
    }
};

export const getRelatorioStockByArmazem = async (req, res) => {
    const { empresa } = req.user;
    let id = req.params.id;
    let relatorio = [];

    if (id == "null") {
        id = null;
    }

    try {
        const armazem = await knex("estado_stock").where("armazem", id);

        if (!armazem) {
            const message = "Armazem não encontrado.";
            return handleResponse(req, res, 404, [], message);
        }

        for (let i = 0; i < armazem.length; i++) {
            const stock = await knex("stock")
                .select(["stock.*"])
                .leftJoin("empresa", "stock.empresa", "empresa.id")
                .where("stock.id", armazem[i].stock)
                .where("empresa.id", empresa)
                .first();
            const obj = {
                ...stock,
                quantidade_total: armazem[i].quantidade_actual,
            };
            relatorio.push(obj);
        }

        return handleResponse(req, res, 200, {
            relatorio,
        });
    } catch (err) {
        return handleResponse(req, res, 500, {
            error: err,
        });
    }
};

export const getClientePendentesById = async (req, res) => {
    const { empresa } = req.user;
    const { id } = req.params;
    const response = [];
    let subTotal = 0;
    const { userId } = req.user;

    if (
        !(await userCanAccess(
            "Pendentes dos Clientes",
            "Mostrar pendentes",
            userId
        ))
    ) {
        const message = "Sem permissão para visualizar os pendentes.";
        return handleResponse(req, res, 403, [], message);
    }
    const cliente = await knex("cliente")
        .select(["id", "nome"])
        .where({ id, empresa })
        .first();
    if (!cliente) {
        const message = "Cliente não encontrado.";
        return handleResponse(req, res, 404, [], message);
    }

    const pendenteClientes = await knex("pendente_cliente").where({
        empresa,
        cliente: id,
    });

    for (let i = 0; i < pendenteClientes.length; i++) {
        pendenteClientes[i].valor_pago = Number(
            pendenteClientes[i].valor_pago
        ).toFixed(2);

        if (pendenteClientes[i].move_a_credito) {
            pendenteClientes[i].saldo = -pendenteClientes[i].saldo;
        }
        subTotal += Number(pendenteClientes[i].saldo);
        // const documento = await knex("documento")
        //     .where({ id: pendenteClientes[i].documento_id })
        //     .first();
        // let total = 0;
        // const documentoItems = await knex("documento_item").where({
        //     documento: documento.id,
        // });

        // const moedaPadrao = await knex("moeda")
        //     .select(["codigo"])
        //     .where({ id: documento.moeda_padrao })
        //     .first();

        // documentoItems.map(async (item) => {
        //     const taxa = await knex("taxa")
        //         .select(["id", "valor"])
        //         .where({ id: item.taxa })
        //         .first();

        //     total +=
        //         item.preco * item.quantidade +
        //         (item.preco * item.quantidade * taxa.valor) / 100 +
        //         (item.preco * item.quantidade * item.desconto) / 100;
        // });
        response.push({
            ...pendenteClientes[i],
            data_emissao: moment(pendenteClientes[i].data_emissao).format(
                "DD-M-Y"
            ),
            // documento,
            // total:
            //     total
            //         .toLocaleString("en-US", {
            //             style: "currency",
            //             currency: "USD",
            //         })
            //         .replaceAll("$", "") +
            //     " " +
            //     moedaPadrao.codigo,
        });
    }

    return handleResponse(req, res, 200, {
        total: subTotal,
        items: { ...cliente, subTotal, group: response },
    });
};

export const getPendenteFornecedores = async (req, res) => {
    const { userId } = req.user;

    if (
        !(await userCanAccess(
            "Pendentes dos Fornecedores",
            "Mostrar pendentes",
            userId
        ))
    ) {
        const message = "Sem permissão para visualizar os pendentes.";
        return handleResponse(req, res, 403, [], message);
    }
    const { empresa } = req.user;
    const response = [];
    const pendenteFornecedores = await knex("pendente_fornecedor").where({
        empresa,
    });
    let lastFornecedor = 0;
    let fornecedor = {};
    let total = 0;

    for (let i = 0; i < pendenteFornecedores.length; i++) {
        const index = response.findIndex((item) => {
            return item.id == pendenteFornecedores[i].fornecedor;
        });
        if (pendenteFornecedores[i].move_a_credito) {
            pendenteFornecedores[i].saldo = -pendenteFornecedores[i].saldo;
        }

        if (index >= 0) {
            response[index].group.push({
                ...pendenteFornecedores[i],
                valor_pago: pendenteFornecedores[i].valor_pago.toFixed(2),
            });
        } else {
            if (lastFornecedor != pendenteFornecedores[i].cliente) {
                fornecedor = await knex("fornecedor")
                    .select(["id", "nome"])
                    .where({
                        id: pendenteFornecedores[i].fornecedor,
                    })
                    .first();
            }
            response.push({
                ...fornecedor,
                group: [
                    {
                        ...pendenteFornecedores[i],
                        valor_pago:
                            pendenteFornecedores[i].valor_pago.toFixed(2),
                    },
                ],
            });
        }
    }

    for (let i = 0; i < response.length; i++) {
        let subTotal = 0;
        response[i].group.map((group) => (subTotal += Number(group.saldo)));
        response[i].subTotal = subTotal.toFixed(2);
        total += subTotal;
    }
    return handleResponse(req, res, 200, { total, items: response });
};

export const getFornecedorPendentesById = async (req, res) => {
    const { userId } = req.user;

    if (
        !(await userCanAccess(
            "Pendentes dos Fornecedores",
            "Mostrar pendentes",
            userId
        ))
    ) {
        const message = "Sem permissão para visualizar os pendentes.";
        return handleResponse(req, res, 403, [], message);
    }
    const { empresa } = req.user;
    const { id } = req.params;
    const response = [];
    let subTotal = 0;

    const fornecedor = await knex("fornecedor")
        .select(["id", "nome"])
        .where({ id, empresa })
        .first();
    if (!fornecedor) {
        const message = "Fornecedor não encontrado.";
        return handleResponse(req, res, 404, [], message);
    }

    const pendenteFornecedores = await knex("pendente_fornecedor").where({
        empresa,
        fornecedor: id,
    });

    for (let i = 0; i < pendenteFornecedores.length; i++) {
        pendenteFornecedores[i].valor_pago = Number(
            pendenteFornecedores[i].valor_pago
        ).toFixed(2);
        if (pendenteFornecedores[i].move_a_credito) {
            pendenteFornecedores[i].saldo = -pendenteFornecedores[i].saldo;
        }
        subTotal += Number(pendenteFornecedores[i].saldo);
        response.push({ ...pendenteFornecedores[i] });
    }

    return handleResponse(req, res, 200, {
        total: subTotal,
        items: { ...fornecedor, subTotal, group: response },
    });
};

export const getFornecedorExtratoID = async (req, res) => {
    const { userId } = req.user;

    if (
        !(await userCanAccess(
            "Extratos dos Fornecedores",
            "Mostrar extrato",
            userId
        ))
    ) {
        const message = "Sem permissão para visualizar os extratos.";
        return handleResponse(req, res, 403, [], message);
    }
    // #swagger.tags = ['Cliente']
    // #swagger.description = 'Endpoint para listar Clientes.'
    const { empresa } = req.user;
    const { id } = req.params;
    const extrato = await knex("extrato_fornecedor").where({
        empresa,
        fornecedor: id,
    });
    let extratos = [];

    for (let i = 0; i < extrato.length; i++) {
        extratos.push(extrato[i]);
    }

    if (!extrato) {
        const message = "Registo não encontrado";
        return handleResponse(req, res, 404, [], message);
    }

    return handleResponse(req, res, 200, {
        items: extratos,
    });
};

export const getRelatorioDespesas = async (req, res) => {
    const { userId } = req.user;

    if (
        !(await userCanAccess(
            "Relatório de despesas",
            "Mostrar relatório",
            userId
        ))
    ) {
        const message = "Sem permissão para visualizar o relatório de despesa.";
        return handleResponse(req, res, 403, [], message);
    }
    const { empresa } = req.user;
    const { ano = new Date().getFullYear() } = req.params;
    const response = [];
    try {
        const despensas = await knex("relatorio_despesa")
            .where({ empresa })
            .whereRaw("YEAR(data) = ?", [ano]);
        for (let i = 0; i < despensas.length; i++) {
            const index = response.findIndex(
                (item) => item.id == despensas[i].id
            );

            if (index >= 0) {
                response[index].valor += despensas[i].valor;
                response[index].jan += despensas[i].jan;
                response[index].fev += despensas[i].fev;
                response[index].marc += despensas[i].marc;
                response[index].abr += despensas[i].abr;
                response[index].mai += despensas[i].mai;
                response[index].jun += despensas[i].jun;
                response[index].jul += despensas[i].jul;
                response[index].ago += despensas[i].ago;
                response[index].sep += despensas[i].sep;
                response[index].oct += despensas[i].oct;
                response[index].nov += despensas[i].nov;
                response[index].dez += despensas[i].dez;
            } else {
                response.push({
                    ...despensas[i],
                });
            }
        }

        let total = 0;
        let jan = 0;
        let fev = 0;
        let marc = 0;
        let abr = 0;
        let mai = 0;
        let jun = 0;
        let jul = 0;
        let ago = 0;
        let sep = 0;
        let oct = 0;
        let nov = 0;
        let dez = 0;

        for (let i = 0; i < response.length; i++) {
            total += Number(response[i].valor);
            jan += Number(response[i].jan);
            fev += Number(response[i].fev);
            marc += Number(response[i].marc);
            abr += Number(response[i].abr);
            mai += Number(response[i].mai);
            jun += Number(response[i].jun);
            jul += Number(response[i].jul);
            ago += Number(response[i].ago);
            sep += Number(response[i].sep);
            oct += Number(response[i].oct);
            nov += Number(response[i].nov);
            dez += Number(response[i].dez);
        }

        return handleResponse(req, res, 200, {
            total,
            jan,
            fev,
            marc,
            abr,
            mai,
            jun,
            jul,
            ago,
            sep,
            oct,
            nov,
            dez,
            response,
        });
    } catch (error) {
        return handleResponse(req, res, 500, error);
    }
};

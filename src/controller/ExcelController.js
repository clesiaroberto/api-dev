import knex from "../database";
import { handleResponse } from "../utils/handleResponse";
import { userCanAccess } from "../middleware/userCanAccess";
import XLSX from "xlsx";
import { formatCurrency } from "../helper/FormatCurrency";
import moment from "moment";

export const relaorioStock = async (req, res) => {
    const { empresa } = req.user;
    let armazensWithName = [];
    const semArmazem = [];

    const excelData = [];

    const stock = await knex("stock").select(["stock.*"])
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

    let armazemObj = [];

    for (let i = 0; i < armazensWithName.length; i++) {
        const curret = i + 1;
        if (armazensWithName[i].armazem !== null) {
            armazemObj.push(armazensWithName[i].name.nome);
        }

        if (armazensWithName[i].armazem == null) {
            semArmazem.push("Sem armazem");
        }
    }

    for (let i = 0; i < stock.length; i++) {
        let armazem = [];
        let total = 0;
        armazensWithName.map((ar) => {
            let armazemData = {};
            if (ar.armazem !== null) {
                if (ar.stock == stock[i].id) {
                    total += ar.quantidade_actual;
                    armazemData = ar.quantidade_actual;
                } else {
                    armazemData = 0;
                }
                armazem.push(armazemData);
            }
        });

        armazensWithName.map((ar) => {
            let armazemData = {};
            if (ar.armazem == null) {
                if (ar.stock == stock[i].id) {
                    total += ar.quantidade_actual;
                    armazemData = ar.quantidade_actual;
                } else {
                    armazemData = 0;
                }
                armazem.push(armazemData);
            }
        });

        const obj = [
            stock[i].referencia,
            stock[i].designacao,
            ...armazem,
            total
        ];

        excelData.push(obj)

    }
    
    const subData = [
        "Referência",
        "Designação",
        ...armazemObj,
        ...semArmazem,
        'Total'
    ];

    let data = [subData,...excelData];

    const rand = Math.floor(Math.random() * (10000 - 100)) + 100

    var ws = XLSX.utils.aoa_to_sheet(data);
    ws['!cols'] = [{ width: 20 }, { width: 20 }, { width: 20 },{ width: 20 }, { width: 20 } ];
    var wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "SheetJS");
    var buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    res.setHeader("Content-Type", "application/vnd.ms-excel");
    res.setHeader("content-disposition", "attachment; filename=export"+rand+".xlsx");
    res.send(buf);
}

export const relaorioStockById = async (req, res) => {
    const { empresa } = req.user;
    let id = req.params.id;
    let armazensWithName = [];
    const semArmazem = [];
    let name = "Sem armazem";

    const excelData = [];

    const armazens = await knex("estado_stock")
            .where("armazem", id)
            .where("empresa", empresa);

    const armazemNome = await knex("armazem")
            .where("id", id)
            .where("empresa", empresa)
            .where("removido", 0)
            .first();

    if (armazemNome) {
        name = armazemNome.nome;
    }

    if (!armazens) {
        const message = "Armazem não encontrado.";
        return handleResponse(req, res, 404, [], message);
    }

    for (let i = 0; i < armazens.length; i++) {
        const armazemName = await knex("armazem")
            .where("id", armazens[i].armazem)
            .where("empresa", empresa)
            .where("removido", 0)
            .first();
        const obj = {
            ...armazens[i],
            name: armazemName,
        };

        armazensWithName.push(obj);
    }

    let armazemObj = [];
    
    for (let i = 0; i < armazensWithName.length; i++) {
        const stock = await knex("stock")
            .select(["stock.*"])
            .leftJoin("empresa", "stock.empresa", "empresa.id")
            .where("stock.id", armazensWithName[i].stock)
            .where("empresa.id", empresa)
            .first();

            const obj = [
                stock.referencia,
                stock.designacao,
                armazensWithName[i].quantidade_actual
            ];
    
            excelData.push(obj)
    }
    
    const subData = [
        "Referência",
        "Designação",
        'Total'
    ];

    let data = [subData,...excelData];

    const rand = Math.floor(Math.random() * (10000 - 100)) + 100

    var ws = XLSX.utils.aoa_to_sheet(data);
    ws['!cols'] = [{ width: 20 }, { width: 20 }, { width: 20 },{ width: 20 }, { width: 20 } ];
    var wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "SheetJS");
    var buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    res.setHeader("Content-Type", "application/vnd.ms-excel");
    res.setHeader("content-disposition", "attachment; filename=Armazem-"+name+""+rand+".xlsx");
    res.send(buf);
}

export const relaorioExtratoCliente = async (req, res) => {
    const { id, firstdate, seconddate } = req.params;
    const { empresa } = req.user;

    const response = [];
    let total = 0;
    let credito = 0;
    let debito = 0;
    let extenso = "";

    const header = [
        "Data de emissão",
        "N. do documento",
        "Débito",
        "Crédito",
        "Saldo"
    ];

    const cliente = await knex("cliente").where({ id, empresa }).first();

    if (!cliente) {
        const message = "Cliente não encontrado.";
        return handleResponse(req, res, 404, [], message);
    }

    const clienteExtratos = await knex("extrato_cliente").where({
        cliente: id,
    });

    const pertencenteA = await knex("empresa")
        .where({ id: empresa })
        .first();
    const moedaPadrao = await knex("moeda")
        .where({ id: pertencenteA.moeda_padrao })
        .first();

    for (let i = 0; i < clienteExtratos.length; i++) {
        clienteExtratos[i].valor_pago = formatCurrency(
            clienteExtratos[i].valor_pago
        );

        response.push([
            clienteExtratos[i].data_emissao,
            clienteExtratos[i].referencia,
            formatCurrency(clienteExtratos[i].debito),
            formatCurrency(clienteExtratos[i].credito),
            formatCurrency(
                debito - credito + clienteExtratos[i].debito - clienteExtratos[i].credito
            ),
        ]);

        credito += Number(clienteExtratos[i].credito);
        debito += Number(clienteExtratos[i].debito);
    }

    total = debito - credito;

    const footer = [
        '',
        'Total',
        formatCurrency(debito) + " " + moedaPadrao.codigo,
        formatCurrency(credito) + " " + moedaPadrao.codigo,
        formatCurrency(total) + " " + moedaPadrao.codigo
    ]

    const data = [
        header,
        ...response,
        footer
    ];

    const rand = Math.floor(Math.random() * (10000 - 100)) + 100

    var ws = XLSX.utils.aoa_to_sheet(data);
    ws['!cols'] = [{ width: 20 }, { width: 20 }, { width: 20 },{ width: 20 }, { width: 20 } ];
    var wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "SheetJS");
    var buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    res.setHeader("Content-Type", "application/vnd.ms-excel");
    res.setHeader("content-disposition", "attachment; filename=extrato-cliente-"+cliente.nome+"-"+rand+".xlsx");
    res.send(buf);
} 

export const relaorioExtratoClienteByDate = async (req, res) => {
    const { id, firstdate, seconddate } = req.params;
    const { empresa } = req.user;

    const response = [];
    let total = 0;
    let credito = 0;
    let debito = 0;

    const header = [
        "Data de emissão",
        "N. do documento",
        "Débito",
        "Crédito",
        "Saldo"
    ];

    const cliente = await knex("cliente").where({ id, empresa }).first();

    if (!cliente) {
        const message = "Cliente não encontrado.";
        return handleResponse(req, res, 404, [], message);
    }

    let lastAnterior;

    const lastExtrato = await knex("extrato_cliente")
    .where('data_emissao', '<', firstdate).where('cliente',id);

    let debLast= 0;
    let credLast = 0;
    for(let i = 0; i < lastExtrato.length; i++){
        credLast += Number(lastExtrato[i].credito);
        debLast += Number(lastExtrato[i].debito);
    }

    lastAnterior = [
        "Saldo Anterior",
        "",
        "",
        "",
        credLast - lastAnterior != 0 ? formatCurrency(debLast - credLast) : 0
    ];

    const clienteExtratos = await knex("extrato_cliente").where({
        cliente: id,
    }).whereBetween('data_emissao', [firstdate, seconddate]);

    const pertencenteA = await knex("empresa")
        .where({ id: empresa })
        .first();
    const moedaPadrao = await knex("moeda")
        .where({ id: pertencenteA.moeda_padrao })
        .first();

    for (let i = 0; i < clienteExtratos.length; i++) {
        clienteExtratos[i].valor_pago = formatCurrency(
            clienteExtratos[i].valor_pago
        );

        response.push([
            clienteExtratos[i].data_emissao,
            clienteExtratos[i].referencia,
            formatCurrency(clienteExtratos[i].debito),
            formatCurrency(clienteExtratos[i].credito),
            formatCurrency(
                debito - credito + clienteExtratos[i].debito - clienteExtratos[i].credito
            ),
        ]);

        credito += Number(clienteExtratos[i].credito);
        debito += Number(clienteExtratos[i].debito);
    }

    total = debito - credito;

    const footer = [
        '',
        'Total',
        formatCurrency(debito) + " " + moedaPadrao.codigo,
        formatCurrency(credito) + " " + moedaPadrao.codigo,
        formatCurrency(total) + " " + moedaPadrao.codigo
    ]

    const data = [
        header,
        lastAnterior,
        ...response,
        footer
    ];

    const rand = Math.floor(Math.random() * (10000 - 100)) + 100

    var ws = XLSX.utils.aoa_to_sheet(data);
    ws['!cols'] = [{ width: 20 }, { width: 20 }, { width: 20 },{ width: 20 }, { width: 20 } ];
    var wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "SheetJS");
    var buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    res.setHeader("Content-Type", "application/vnd.ms-excel");
    res.setHeader("content-disposition", "attachment; filename=extrato-cliente-"+cliente.nome+"-"+firstdate+"-"+seconddate+rand+".xlsx");
    res.send(buf);
}

export const relaorioExtratoFornecedor = async (req, res) => {
    const { userId } = req.user;
    if (
        !(await userCanAccess(
            "Extratos dos Fornecedores",
            "Imprimir extrato",
            userId
        ))
    ) {
        const message = "Sem permissão para imprimir o extrato.";
        return handleResponse(req, res, 403, [], message);
    }
    const { empresa } = req.user;
    const { id } = req.params;
    const response = [];
    let total = 0;
    let credito = 0;
    let debito = 0;

    const fornecedor = await knex("fornecedor").where({ id, empresa }).first();

    const header = [
        "Data de emissão",
        "N. do documento",
        "Débito",
        "Crédito",
        'Saldo'
    ]

    if (!fornecedor) {
        const message = "Fornecedor não encontrado.";
        return handleResponse(req, res, 404, [], message);
    }

    const fornecedorExtratos = await knex("extrato_fornecedor").where({
        fornecedor: id,
    });

    const pertencenteA = await knex("empresa")
            .where({ id: empresa })
            .first();
    const moedaPadrao = await knex("moeda")
            .where({ id: pertencenteA.moeda_padrao })
            .first();

    for (let i = 0; i < fornecedorExtratos.length; i++) {
        fornecedorExtratos[i].valor_pago = formatCurrency(
            fornecedorExtratos[i].valor_pago
        );
        
        response.push([
            fornecedorExtratos[i].data_emissao,
            fornecedorExtratos[i].referencia,
            formatCurrency(fornecedorExtratos[i].debito),
            formatCurrency(fornecedorExtratos[i].credito),
            formatCurrency(
                debito - credito + fornecedorExtratos[i].debito - fornecedorExtratos[i].credito
            )
        ]);

        credito += Number(fornecedorExtratos[i].credito);
        debito += Number(fornecedorExtratos[i].debito);
    }

    total = debito - credito;

    const footer = [
        "",
        "Total:",
        formatCurrency(debito) + " " + moedaPadrao.codigo,
        formatCurrency(credito) + " " + moedaPadrao.codigo,
        formatCurrency(total) + " " + moedaPadrao.codigo,
    ]

    const data = [
        header,
        ...response,
        footer
    ];

    const rand = Math.floor(Math.random() * (10000 - 100)) + 100

    var ws = XLSX.utils.aoa_to_sheet(data);
    ws['!cols'] = [{ width: 20 }, { width: 20 }, { width: 20 },{ width: 20 }, { width: 20 } ];
    var wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "SheetJS");
    var buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    res.setHeader("Content-Type", "application/vnd.ms-excel");
    res.setHeader("content-disposition", "attachment; filename=extrato-fornecedor-"+fornecedor.nome+"-"+rand+".xlsx");
    res.send(buf);
}

export const relaorioExtratoFornecedorByDate = async (req, res) => {
    const { userId } = req.user;
    if (
        !(await userCanAccess(
            "Extratos dos Fornecedores",
            "Imprimir extrato",
            userId
        ))
    ) {
        const message = "Sem permissão para imprimir o extrato.";
        return handleResponse(req, res, 403, [], message);
    }
    const { empresa } = req.user;
    const { id, firstdate, seconddate } = req.params;
    const response = [];
    let total = 0;
    let credito = 0;
    let debito = 0;

    const fornecedor = await knex("fornecedor").where({ id, empresa }).first();

    const header = [
        "Data de emissão",
        "N. do documento",
        "Débito",
        "Crédito",
        'Saldo'
    ]

    if (!fornecedor) {
        const message = "Fornecedor não encontrado.";
        return handleResponse(req, res, 404, [], message);
    }

    let lastAnterior;

    const lastFornecedorExtratos = await knex("extrato_fornecedor")
    .where('data_emissao', '<', firstdate).where('fornecedor',id);

    let debLast= 0;
    let credLast = 0;
    for(let i = 0; i < lastFornecedorExtratos.length; i++){
        credLast += Number(lastFornecedorExtratos[i].credito);
        debLast += Number(lastFornecedorExtratos[i].debito);
    }

    lastAnterior = [
        "Saldo Anterior",
        "",
        "",
        "",
        credLast - lastAnterior != 0 ? formatCurrency(debLast - credLast) : 0
    ];

    const fornecedorExtratos = await knex("extrato_fornecedor").where({
        fornecedor: id,
    }).whereBetween('data_emissao', [firstdate, seconddate]);

    const pertencenteA = await knex("empresa")
            .where({ id: empresa })
            .first();
    const moedaPadrao = await knex("moeda")
            .where({ id: pertencenteA.moeda_padrao })
            .first();

    for (let i = 0; i < fornecedorExtratos.length; i++) {
        fornecedorExtratos[i].valor_pago = formatCurrency(
            fornecedorExtratos[i].valor_pago
        );
        
        response.push([
            fornecedorExtratos[i].data_emissao,
            fornecedorExtratos[i].referencia,
            formatCurrency(fornecedorExtratos[i].debito),
            formatCurrency(fornecedorExtratos[i].credito),
            formatCurrency(
                debito - credito + fornecedorExtratos[i].debito - fornecedorExtratos[i].credito
            )
        ]);

        credito += Number(fornecedorExtratos[i].credito);
        debito += Number(fornecedorExtratos[i].debito);
    }

    total = debito - credito;

    const footer = [
        "",
        "Total:",
        formatCurrency(debito) + " " + moedaPadrao.codigo,
        formatCurrency(credito) + " " + moedaPadrao.codigo,
        formatCurrency(total) + " " + moedaPadrao.codigo,
    ]

    const data = [
        header,
        lastAnterior,
        ...response,
        footer
    ];

    const rand = Math.floor(Math.random() * (10000 - 100)) + 100

    var ws = XLSX.utils.aoa_to_sheet(data);
    ws['!cols'] = [{ width: 20 }, { width: 20 }, { width: 20 },{ width: 20 }, { width: 20 } ];
    var wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "SheetJS");
    var buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    res.setHeader("Content-Type", "application/vnd.ms-excel");
    res.setHeader("content-disposition", "attachment; filename=extrato-fornecedor-"+fornecedor.nome+"-"+firstdate+"-"+seconddate+"-"+rand+".xlsx");
    res.send(buf);
}

export const transacoesById = async (req, res) => {
    const { empresa } = req.user;
    const { id } = req.params;
    const conta_bancaria = id;
    let response = [];
    let saldo = 0;

    const getTransacao = await knex("transacoes").where({
        conta_bancaria,
        empresa,
    });

    const header = [
        "NOME BANCO",
        "REFERENCIA",
        "MOVIMENTO",
        "DATA",
        "TOTAL"
    ]

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
        response.push([
            getTransacao[i].nome_banco,
            getTransacao[i].referencia,
            getTransacao[i].movimento,
            moment(getTransacao[i].data).format("DD-MM-yyyy"),
            formatCurrency(getTransacao[i].total) + " " + moeda.codigo
        ]);

        saldo += getTransacao[i].total
    }

    const footer = [
        "",
        "Saldo",
        "",
        "",
        formatCurrency(saldo) + " " +  moeda.codigo
    ];

    const data = [
        header,
        ...response,
        footer
    ];

    const rand = Math.floor(Math.random() * (10000 - 100)) + 100

    var ws = XLSX.utils.aoa_to_sheet(data);
    ws['!cols'] = [{ width: 20 }, { width: 20 }, { width: 20 },{ width: 20 }, { width: 20 } ];
    var wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "SheetJS");
    var buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    res.setHeader("Content-Type", "application/vnd.ms-excel");
    res.setHeader("content-disposition", "attachment; filename=conta-bancaria-transacoes-"+contaBancaria.nome_banco+"-"+rand+".xlsx");
    res.send(buf);
}

export const transacoesByDate = async (req, res) => {
    const { empresa } = req.user;
    const { id, firstdate, seconddate } = req.params;
    const conta_bancaria = id;
    let response = [];
    let saldo = 0;
    let saldoAnterior = 0;
    let saldoAnteriorColumn;

    const getTransacao = await knex("transacoes").where({
        conta_bancaria,
        empresa,
    }).whereBetween('data_added', [firstdate, seconddate]);

    const header = [
        "NOME BANCO",
        "REFERENCIA",
        "MOVIMENTO",
        "DATA",
        "TOTAL"
    ]

    const getTransacaoAnterior = await knex("transacoes").where({
        conta_bancaria,
        empresa,
    }).where('data_added', '<', firstdate);

    for (let i = 0; i < getTransacaoAnterior.length; i++) {
        saldoAnterior += getTransacaoAnterior[i].total;
    }

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

    saldoAnteriorColumn = [
        "Saldo Anterior",
        "",
        "",
        "",
        formatCurrency(saldoAnterior) + " " + moeda.codigo
    ];

    for (let i = 0; i < getTransacao.length; i++) {
        response.push([
            getTransacao[i].nome_banco,
            getTransacao[i].referencia,
            getTransacao[i].movimento,
            moment(getTransacao[i].data).format("DD-MM-yyyy"),
            formatCurrency(getTransacao[i].total) + " " + moeda.codigo
        ]);

        saldo += getTransacao[i].total
    }

    const footer = [
        "",
        "Saldo",
        "",
        "",
        formatCurrency(saldo + saldoAnterior) + " " +  moeda.codigo
    ];

    const data = [
        header,
        saldoAnteriorColumn,
        ...response,
        footer
    ];

    const rand = Math.floor(Math.random() * (10000 - 100)) + 100

    var ws = XLSX.utils.aoa_to_sheet(data);
    ws['!cols'] = [{ width: 20 }, { width: 20 }, { width: 20 },{ width: 20 }, { width: 20 } ];
    var wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "SheetJS");
    var buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    res.setHeader("Content-Type", "application/vnd.ms-excel");
    res.setHeader("content-disposition", "attachment; filename=conta-bancaria-transacoes-"+contaBancaria.nome_banco+"-"+firstdate+"-"+seconddate+"-"+rand+".xlsx");
    res.send(buf);
}
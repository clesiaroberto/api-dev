import knex from "../database";
import pdfPrinter from "pdfmake/src/printer";
import path from "path";
import { handleResponse } from "../utils/handleResponse";
import moment from "moment";
import numeroPorExtenso from "numero-por-extenso";
import { fonts } from "../helper/PrintConfig";
import { userCanAccess } from "../middleware/userCanAccess";
import { formatCurrency } from "../helper/FormatCurrency";

export const getRelatorioStock = async (req, res) => {
    const { empresa } = req.user;
    let relatorio = [];
    let armazensWithName = [];
    const semArmazemTotal = [];
    const semArmazem = [];
    try {
        const printer = new pdfPrinter(fonts);
        const pertencenteA = await knex("empresa")
            .where({ id: empresa })
            .first();
        const logotipo = await knex("anexo")
            .where({ id: pertencenteA.logotipo })
            .first();
        const moedaPadrao = await knex("moeda")
            .where({ id: pertencenteA.moeda_padrao })
            .first();
        const contaBancaria = await knex("conta_bancaria")
            .where({
                removido: false,
                empresa,
            })
            .limit(3);

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
            let armazem = [];
            let total = 0;
            armazensWithName.map((ar) => {
                let armazemData = {};
                if (ar.armazem !== null) {
                    if (ar.stock == stock[i].id) {
                        total += ar.quantidade_actual;
                        armazemData = {
                            text: ar.quantidade_actual,
                            border: [true, true, true, true],
                            characterSpacing: 1,
                            fontSize: 7,
                        };
                    } else {
                        armazemData = {
                            text: 0,
                            border: [true, true, true, true],
                            characterSpacing: 1,
                            fontSize: 7,
                        };
                    }
                    armazem.push(armazemData);
                }
            });

            armazensWithName.map((ar) => {
                let armazemData = {};
                if (ar.armazem == null) {
                    if (ar.stock == stock[i].id) {
                        total += ar.quantidade_actual;
                        armazemData = {
                            text: ar.quantidade_actual,
                            border: [true, true, true, true],
                            characterSpacing: 1,
                            fontSize: 7,
                        };
                    } else {
                        armazemData = {
                            text: 0,
                            border: [true, true, true, true],
                            characterSpacing: 1,
                            fontSize: 7,
                        };
                    }
                    armazem.push(armazemData);
                }
            });

            const obj = [
                {
                    text: stock[i].referencia,
                    border: [true, true, true, true],
                    characterSpacing: 1,
                    fontSize: 7,
                },
                {
                    text: stock[i].designacao,
                    border: [true, true, true, true],
                    characterSpacing: 1,
                    fontSize: 7,
                },
                ...armazem,
                {
                    text: total,
                    border: [true, true, true, true],
                    characterSpacing: 1,
                    fontSize: 7,
                },
            ];

            relatorio.push(obj);
        }

        const totalColums = [];

        if (relatorio.length > 0) {
            for (let i = 0; i < relatorio[0].length; i++) {
                totalColums.push("*");
            }
        }

        let armazemObj = [];

        for (let i = 0; i < armazensWithName.length; i++) {
            const curret = i + 1;
            if (armazensWithName[i].armazem !== null) {
                const obj = {
                    text: armazensWithName[i].name.nome,
                    fillColor: "#6e6e6e",
                    color: "white",
                    border: [true, true, true, true],
                    characterSpacing: 1,
                    fontSize: 6.5,
                };
                armazemObj.push(obj);
            }

            if (armazensWithName[i].armazem == null) {
                semArmazem.push({
                    text: "Sem armazem",
                    fillColor: "#6e6e6e",
                    color: "white",
                    border: [true, true, true, true],
                    characterSpacing: 1,
                    fontSize: 6.5,
                });
            }
        }

        const documentData = {
            pageSize: "A4",
            defaultStyle: {
                font: "Courier",
            },
            pageMargins: [40, 35, 40, 80],
            content: [
                {
                    style: "header",
                    alignment: "justify",
                    columns: [
                        {
                            image: path.resolve(
                                `./uploads/anexos/${logotipo.nome_ficheiro}`
                            ),
                            fit: [70, 70],
                        },
                        [
                            {
                                text: "Relatorios do stock",
                                normal: true,
                                bold: false,
                                fontSize: 12,
                                characterSpacing: 1,
                            },
                            {
                                text:
                                    "Data: " +
                                    moment(new Date()).format("DD-MM-yyyy"),
                                normal: true,
                                bold: false,
                                fontSize: 8,
                                characterSpacing: 1,
                            },
                        ],
                    ],
                },
                {
                    columns: [
                        [
                            {
                                text: `\n${pertencenteA.nome}`,
                                normal: false,
                                bold: true,
                                fontSize: 12,
                                characterSpacing: 1,
                            },
                            {
                                text: `\n${
                                    pertencenteA.endereco1
                                        ? pertencenteA.endereco1
                                        : "Endereço: -"
                                }`,
                                normal: true,
                                bold: false,
                                fontSize: 10,
                                characterSpacing: 1,
                            },
                            {
                                text: `Contacto(s): ${
                                    pertencenteA.contacto1
                                        ? pertencenteA.contacto1
                                        : "-"
                                }`,
                                normal: true,
                                bold: false,
                                fontSize: 10,
                                characterSpacing: 1,
                            },
                            {
                                text: `E-mail: ${pertencenteA.email}`,
                                normal: true,
                                bold: false,
                                fontSize: 10,
                                characterSpacing: 1,
                            },
                            {
                                text: `Nuit: ${
                                    pertencenteA.nuit ? pertencenteA.nuit : "-"
                                }`,
                                normal: true,
                                bold: false,
                                fontSize: 10,
                                characterSpacing: 1,
                            },
                        ],
                    ],
                },
                { columns: [{ text: "\n" }] },
                {
                    layout: {
                        defaultBorder: false,
                        hLineWidth: function (i, node) {
                            return 1;
                        },
                        vLineWidth: function (i, node) {
                            return 1;
                        },
                        hLineColor: function (i, node) {
                            return "lightgrey";
                        },
                        vLineColor: function (i, node) {
                            return "white";
                        },
                        hLineWidth: function (i, node) {
                            return 0.1;
                        },
                        hLineStyle: function (i, node) {
                            // if (i === 0 || i === node.table.body.length) {
                            return null;
                            //}
                        },
                        // vLineStyle: function (i, node) { return {dash: { length: 10, space: 4 }}; },
                        paddingLeft: function (i, node) {
                            return 5;
                        },
                        paddingRight: function (i, node) {
                            return 5;
                        },
                        paddingTop: function (i, node) {
                            return 3;
                        },
                        paddingBottom: function (i, node) {
                            return 2;
                        },
                        fillColor: function (rowIndex, node, columnIndex) {
                            return "white";
                        },
                        hLineWidth: function (i, node) {
                            return 0.1;
                        },
                    },
                    table: {
                        headerRows: 1,
                        widths: totalColums,
                        body: [
                            [
                                {
                                    text: "Referência",
                                    fillColor: "#6e6e6e",
                                    color: "white",
                                    border: [true, true, true, true],
                                    characterSpacing: 1,
                                    fontSize: 6.5,
                                },
                                {
                                    text: "Designação",
                                    fillColor: "#6e6e6e",
                                    color: "white",
                                    border: [true, true, true, true],
                                    characterSpacing: 1,
                                    fontSize: 6.5,
                                },
                                ...armazemObj,
                                ...semArmazem,
                                {
                                    text: `Total`,
                                    fillColor: "#6e6e6e",
                                    color: "white",
                                    border: [true, true, true, true],
                                    characterSpacing: 1,
                                    fontSize: 6.5,
                                },
                            ],
                            ...relatorio,
                        ],
                    },
                },
            ],
        };

        const pdfDoc = printer.createPdfKitDocument(documentData);
        let chunks = [];
        pdfDoc.on("data", (chunk) => {
            chunks.push(chunk);
        });
        pdfDoc.on("end", () => {
            const result = Buffer.concat(chunks);
            res.setHeader("Content-Type", "Application/pdf");
            res.setHeader(
                "content-disposition",
                "attachment; filename=export.pdf"
            );
            res.send(result);
        });
        pdfDoc.end();
    } catch (error) {
        return handleResponse(req, res, 500, error);
    }
};

export const getRelatorioStockId = async (req, res) => {
    const { empresa } = req.user;
    let id = req.params.id;
    let relatorio = [];
    let armazensWithName = [];
    let name = "Sem armazem";
    const semArmazemTotal = [];
    const semArmazem = [];

    if (id == "null") {
        id = null;
    }

    try {
        const printer = new pdfPrinter(fonts);
        const pertencenteA = await knex("empresa")
            .where({ id: empresa })
            .first();
        const logotipo = await knex("anexo")
            .where({ id: pertencenteA.logotipo })
            .first();
        const moedaPadrao = await knex("moeda")
            .where({ id: pertencenteA.moeda_padrao })
            .first();
        const contaBancaria = await knex("conta_bancaria")
            .where({
                removido: false,
                empresa,
            })
            .limit(3);

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

        for (let i = 0; i < armazensWithName.length; i++) {
            const stock = await knex("stock")
                .select(["stock.*"])
                .leftJoin("empresa", "stock.empresa", "empresa.id")
                .where("stock.id", armazensWithName[i].stock)
                .where("empresa.id", empresa)
                .first();

            const obj = [
                {
                    text: stock.referencia,
                    border: [true, true, true, true],
                    characterSpacing: 1,
                    fontSize: 7,
                },
                {
                    text: stock.designacao,
                    border: [true, true, true, true],
                    characterSpacing: 1,
                    fontSize: 7,
                },
                /* 
                {
                    text: armazensWithName[i].quantidade_actual,
                    border: [true, true, true, true],
                    characterSpacing: 1,
                    fontSize: 7
                },
                */
                {
                    text: armazensWithName[i].quantidade_actual,
                    border: [true, true, true, true],
                    characterSpacing: 1,
                    fontSize: 7,
                },
            ];

            relatorio.push(obj);
        }

        const totalColums = [];

        if (relatorio.length > 0) {
            for (let i = 0; i < relatorio[0].length; i++) {
                totalColums.push("*");
            }
        }

        const documentData = {
            pageSize: "A4",
            defaultStyle: {
                font: "Courier",
            },
            pageMargins: [40, 35, 40, 80],
            content: [
                {
                    style: "header",
                    alignment: "justify",
                    columns: [
                        {
                            image: path.resolve(
                                `./uploads/anexos/${logotipo.nome_ficheiro}`
                            ),
                            fit: [70, 70],
                        },
                        [
                            {
                                text: "Relatorios do stock",
                                normal: true,
                                bold: false,
                                fontSize: 12,
                                characterSpacing: 1,
                            },
                            {
                                text: "Armazem: " + name,
                                normal: true,
                                bold: false,
                                marginTop: 10,
                                fontSize: 10,
                                characterSpacing: 1,
                            },
                            {
                                text:
                                    "Data: " +
                                    moment(new Date()).format("DD-MM-yyyy"),
                                normal: true,
                                bold: false,
                                fontSize: 8,
                                characterSpacing: 1,
                            },
                        ],
                    ],
                },
                {
                    columns: [
                        [
                            {
                                text: `\n${pertencenteA.nome}`,
                                normal: false,
                                bold: true,
                                fontSize: 12,
                                characterSpacing: 1,
                            },
                            {
                                text: `\n${
                                    pertencenteA.endereco1
                                        ? pertencenteA.endereco1
                                        : "Endereço: -"
                                }`,
                                normal: true,
                                bold: false,
                                fontSize: 10,
                                characterSpacing: 1,
                            },
                            {
                                text: `Contacto(s): ${
                                    pertencenteA.contacto1
                                        ? pertencenteA.contacto1
                                        : "-"
                                }`,
                                normal: true,
                                bold: false,
                                fontSize: 10,
                                characterSpacing: 1,
                            },
                            {
                                text: `E-mail: ${pertencenteA.email}`,
                                normal: true,
                                bold: false,
                                fontSize: 10,
                                characterSpacing: 1,
                            },
                            {
                                text: `Nuit: ${
                                    pertencenteA.nuit ? pertencenteA.nuit : "-"
                                }`,
                                normal: true,
                                bold: false,
                                fontSize: 10,
                                characterSpacing: 1,
                            },
                        ],
                    ],
                },
                { columns: [{ text: "\n" }] },
                {
                    layout: {
                        defaultBorder: false,
                        hLineWidth: function (i, node) {
                            return 1;
                        },
                        vLineWidth: function (i, node) {
                            return 1;
                        },
                        hLineColor: function (i, node) {
                            return "lightgrey";
                        },
                        vLineColor: function (i, node) {
                            return "white";
                        },
                        hLineWidth: function (i, node) {
                            return 0.1;
                        },
                        hLineStyle: function (i, node) {
                            // if (i === 0 || i === node.table.body.length) {
                            return null;
                            //}
                        },
                        // vLineStyle: function (i, node) { return {dash: { length: 10, space: 4 }}; },
                        paddingLeft: function (i, node) {
                            return 5;
                        },
                        paddingRight: function (i, node) {
                            return 5;
                        },
                        paddingTop: function (i, node) {
                            return 3;
                        },
                        paddingBottom: function (i, node) {
                            return 2;
                        },
                        fillColor: function (rowIndex, node, columnIndex) {
                            return "white";
                        },
                        hLineWidth: function (i, node) {
                            return 0.1;
                        },
                    },
                    table: {
                        headerRows: 1,
                        widths: totalColums,
                        body: [
                            [
                                {
                                    text: "Referência",
                                    fillColor: "#6e6e6e",
                                    color: "white",
                                    border: [true, true, true, true],
                                    characterSpacing: 1,
                                    fontSize: 6.5,
                                },
                                {
                                    text: "Designação",
                                    fillColor: "#6e6e6e",
                                    color: "white",
                                    border: [true, true, true, true],
                                    characterSpacing: 1,
                                    fontSize: 6.5,
                                },
                                //...armazemObj,
                                ...semArmazem,
                                {
                                    text: `Total`,
                                    fillColor: "#6e6e6e",
                                    color: "white",
                                    border: [true, true, true, true],
                                    characterSpacing: 1,
                                    fontSize: 6.5,
                                },
                            ],
                            ...relatorio,
                        ],
                    },
                },
            ],
        };

        const pdfDoc = printer.createPdfKitDocument(documentData);
        let chunks = [];
        pdfDoc.on("data", (chunk) => {
            chunks.push(chunk);
        });
        pdfDoc.on("end", () => {
            const result = Buffer.concat(chunks);
            res.setHeader("Content-Type", "Application/pdf");
            res.setHeader(
                "content-disposition",
                "attachment; filename=export.pdf"
            );
            res.send(result);
        });
        pdfDoc.end();
    } catch (error) {
        return handleResponse(req, res, 500, error);
    }
};

export const getClientesPendentes = async (req, res) => {
    const { empresa } = req.user;
    const response = [];
    const { userId } = req.user;

    if (
        !(await userCanAccess(
            "Pendentes dos Clientes",
            "Imprimir pendentes",
            userId
        ))
    ) {
        const message =
            "Sem permissão para imprimir os pendentes dos clientes.";
        return handleResponse(req, res, 403, [], message);
    }
    const pendenteClientes = await knex("pendente_cliente").where({ empresa });
    let lastCliente = 0;
    let cliente = {};
    let total = 0;
    const dadosBancarios = [];
    let extenso = "";

    for (let i = 0; i < pendenteClientes.length; i++) {
        const index = response.findIndex(
            (item) => item.id == pendenteClientes[i].cliente
        );
        if (pendenteClientes[i].move_a_credito) {
            pendenteClientes[i].saldo = -pendenteClientes[i].saldo;
        }
        if (index >= 0) {
            response[index].group.push({
                ...pendenteClientes[i],
                valor_pago: formatCurrency(pendenteClientes[i].valor_pago),
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
                        valor_pago: formatCurrency(
                            pendenteClientes[i].valor_pago
                        ),
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

    try {
        const printer = new pdfPrinter(fonts);
        const pertencenteA = await knex("empresa")
            .where({ id: empresa })
            .first();
        const logotipo = await knex("anexo")
            .where({ id: pertencenteA.logotipo })
            .first();
        const moedaPadrao = await knex("moeda")
            .where({ id: pertencenteA.moeda_padrao })
            .first();
        const contaBancaria = await knex("conta_bancaria")
            .where({
                removido: false,
                empresa,
            })
            .limit(3);

        for (let i = 0; i < contaBancaria.length; i++) {
            dadosBancarios.push([
                {
                    text: contaBancaria[i].nome_banco,
                    characterSpacing: 1,
                    fontSize: 6,
                    normal: true,
                    bold: false,
                },
                {
                    text: contaBancaria[i].numero_conta,
                    characterSpacing: 1,
                    fontSize: 6,
                    normal: true,
                    bold: false,
                },
                {
                    text: contaBancaria[i].nib,
                    characterSpacing: 1,
                    fontSize: 6,
                    normal: true,
                    bold: false,
                },
                {
                    text: contaBancaria[i].swift,
                    characterSpacing: 1,
                    fontSize: 6,
                    normal: true,
                    bold: false,
                },
            ]);
        }

        if (dadosBancarios.length == 0) {
            dadosBancarios.push([
                {
                    text: "-",
                    characterSpacing: 1,
                    fontSize: 6,
                    normal: true,
                    bold: false,
                },
                {
                    text: "-",
                    characterSpacing: 1,
                    fontSize: 6,
                    normal: true,
                    bold: false,
                },
                {
                    text: "-",
                    characterSpacing: 1,
                    fontSize: 6,
                    normal: true,
                    bold: false,
                },
                {
                    text: "-",
                    characterSpacing: 1,
                    fontSize: 6,
                    normal: true,
                    bold: false,
                },
            ]);
        }

        try {
            extenso = numeroPorExtenso.porExtenso(
                total,
                numeroPorExtenso.estilo.monetario
            );
            if (extenso.startsWith("um")) {
                extenso = extenso
                    .substr(2)
                    .replaceAll("reais", "meticais")
                    .trim();
            } else {
                extenso = extenso.replaceAll("reais", "meticais");
            }
        } catch (error) {
            console.log(error);
        }

        const data = [];

        for (let i = 0; i < response.length; i++) {
            data.push([
                {
                    text: response[i].nome,
                    border: [true, true, true, true],
                    characterSpacing: 1,
                    fontSize: 7,
                    fillColor: "#28c76f",
                    color: "black",
                },
                {
                    text: "",
                    border: [true, true, true, true],
                    characterSpacing: 1,
                    fontSize: 7,
                    fillColor: "#28c76f",
                    color: "black",
                },
                {
                    text: "",
                    border: [true, true, true, true],
                    characterSpacing: 1,
                    fontSize: 7,
                    fillColor: "#28c76f",
                    color: "black",
                },
                {
                    text: "",
                    border: [true, true, true, true],
                    characterSpacing: 1,
                    fontSize: 7,
                    fillColor: "#28c76f",
                    color: "black",
                },
                {
                    text: "",
                    border: [true, true, true, true],
                    characterSpacing: 1,
                    fontSize: 7,
                    fillColor: "#28c76f",
                    color: "black",
                },
                {
                    text: "",
                    border: [true, true, true, true],
                    characterSpacing: 1,
                    fontSize: 7,
                    fillColor: "#28c76f",
                    color: "black",
                },
            ]);

            response[i].group.map((group) => {
                data.push([
                    {
                        text: group.data_emissao,
                        border: [true, true, true, true],
                        characterSpacing: 1,
                        fontSize: 7,
                    },
                    {
                        text: group.referencia,
                        border: [true, true, true, true],
                        characterSpacing: 1,
                        fontSize: 7,
                    },
                    {
                        text: "-",
                        border: [true, true, true, true],
                        characterSpacing: 1,
                        fontSize: 7,
                    },
                    {
                        text: formatCurrency(group.total_com_taxa),
                        border: [true, true, true, true],
                        characterSpacing: 1,
                        fontSize: 7,
                        alignment: "right",
                    },
                    {
                        text: group.valor_pago,
                        border: [true, true, true, true],
                        characterSpacing: 1,
                        fontSize: 7,
                        alignment: "right",
                    },
                    {
                        text: formatCurrency(group.saldo),
                        border: [true, true, true, true],
                        characterSpacing: 1,
                        alignment: "right",
                        fontSize: 7,
                    },
                ]);
            });

            data.push([
                {
                    text: "",
                    border: [true, true, true, true],
                    characterSpacing: 1,
                    fontSize: 7,
                },
                {
                    text: "",
                    border: [true, true, true, true],
                    characterSpacing: 1,
                    fontSize: 7,
                },
                {
                    text: "",
                    border: [true, true, true, true],
                    characterSpacing: 1,
                    fontSize: 7,
                },
                {
                    text: "",
                    border: [true, true, true, true],
                    characterSpacing: 1,
                    fontSize: 7,
                },
                {
                    text: "Sub Total:",
                    border: [true, true, true, true],
                    characterSpacing: 1,
                    fontSize: 7,
                    bold: true,
                },
                {
                    text:
                        formatCurrency(response[i].subTotal) +
                        " " +
                        moedaPadrao.codigo,
                    border: [true, true, true, true],
                    characterSpacing: 1,
                    fontSize: 7,
                    bold: true,
                    alignment: "right",
                },
            ]);
        }

        const documentData = {
            pageSize: "A4",
            defaultStyle: {
                font: "Courier",
            },
            pageMargins: [40, 35, 40, 80],
            content: [
                {
                    style: "header",
                    alignment: "justify",
                    columns: [
                        {
                            image: path.resolve(
                                `./uploads/anexos/${logotipo.nome_ficheiro}`
                            ),
                            fit: [70, 70],
                        },
                        [
                            {
                                text: "Pendentes dos Clientes",
                                normal: true,
                                bold: false,
                                fontSize: 12,
                                characterSpacing: 1,
                            },
                            {
                                text:
                                    "Data: " +
                                    moment(new Date()).format("DD-MM-yyyy"),
                                normal: true,
                                bold: false,
                                fontSize: 8,
                                characterSpacing: 1,
                            },
                        ],
                    ],
                },
                {
                    columns: [
                        [
                            {
                                text: `\n${pertencenteA.nome}`,
                                normal: false,
                                bold: true,
                                fontSize: 12,
                                characterSpacing: 1,
                            },
                            {
                                text: `\n${
                                    pertencenteA.endereco1
                                        ? pertencenteA.endereco1
                                        : "Endereço: -"
                                }`,
                                normal: true,
                                bold: false,
                                fontSize: 10,
                                characterSpacing: 1,
                            },
                            {
                                text: `Contacto(s): ${
                                    pertencenteA.contacto1
                                        ? pertencenteA.contacto1
                                        : "-"
                                }`,
                                normal: true,
                                bold: false,
                                fontSize: 10,
                                characterSpacing: 1,
                            },
                            {
                                text: `E-mail: ${pertencenteA.email}`,
                                normal: true,
                                bold: false,
                                fontSize: 10,
                                characterSpacing: 1,
                            },
                            {
                                text: `Nuit: ${
                                    pertencenteA.nuit ? pertencenteA.nuit : "-"
                                }`,
                                normal: true,
                                bold: false,
                                fontSize: 10,
                                characterSpacing: 1,
                            },
                        ],
                    ],
                },
                { columns: [{ text: "\n" }] },
                {
                    layout: {
                        defaultBorder: false,
                        hLineWidth: function (i, node) {
                            return 1;
                        },
                        vLineWidth: function (i, node) {
                            return 1;
                        },
                        hLineColor: function (i, node) {
                            return "lightgrey";
                        },
                        vLineColor: function (i, node) {
                            return "white";
                        },
                        hLineWidth: function (i, node) {
                            return 0.1;
                        },
                        hLineStyle: function (i, node) {
                            // if (i === 0 || i === node.table.body.length) {
                            return null;
                            //}
                        },
                        // vLineStyle: function (i, node) { return {dash: { length: 10, space: 4 }}; },
                        paddingLeft: function (i, node) {
                            return 5;
                        },
                        paddingRight: function (i, node) {
                            return 5;
                        },
                        paddingTop: function (i, node) {
                            return 3;
                        },
                        paddingBottom: function (i, node) {
                            return 2;
                        },
                        fillColor: function (rowIndex, node, columnIndex) {
                            return "white";
                        },
                        hLineWidth: function (i, node) {
                            return 0.1;
                        },
                    },
                    table: {
                        headerRows: 1,
                        widths: ["*", "*", "*", "*", "*", "*"],
                        body: [
                            [
                                {
                                    text: "Data de emissão",
                                    fillColor: "#6e6e6e",
                                    color: "white",
                                    border: [true, true, true, true],
                                    characterSpacing: 1,
                                    fontSize: 6.5,
                                },
                                {
                                    text: "N. do documento",
                                    fillColor: "#6e6e6e",
                                    color: "white",
                                    border: [true, true, true, true],
                                    characterSpacing: 1,
                                    fontSize: 6.5,
                                },
                                {
                                    text: "D. Expiração",
                                    fillColor: "#6e6e6e",
                                    color: "white",
                                    border: [true, true, true, true],
                                    characterSpacing: 1,
                                    fontSize: 6.5,
                                },
                                {
                                    text: "Preço total",
                                    fillColor: "#6e6e6e",
                                    color: "white",
                                    border: [true, true, true, true],
                                    characterSpacing: 1,
                                    fontSize: 6.5,
                                },
                                {
                                    text: `Valor pago`,
                                    fillColor: "#6e6e6e",
                                    color: "white",
                                    border: [true, true, true, true],
                                    characterSpacing: 1,
                                    fontSize: 6.5,
                                },
                                {
                                    text: `Saldo`,
                                    fillColor: "#6e6e6e",
                                    color: "white",
                                    border: [true, true, true, true],
                                    characterSpacing: 1,
                                    fontSize: 6.5,
                                },
                            ],
                            ...data,
                        ],
                    },
                },
                {
                    layout: {
                        defaultBorder: false,
                        hLineWidth: function (i, node) {
                            return 1;
                        },
                        vLineWidth: function (i, node) {
                            return 1;
                        },
                        hLineColor: function (i, node) {
                            return "white";
                        },
                        vLineColor: function (i, node) {
                            return "white";
                        },
                        hLineStyle: function (i, node) {
                            // if (i === 0 || i === node.table.body.length) {
                            return null;
                            //}
                        },
                        // vLineStyle: function (i, node) { return {dash: { length: 10, space: 4 }}; },
                        paddingLeft: function (i, node) {
                            return 10;
                        },
                        paddingRight: function (i, node) {
                            return 10;
                        },
                        paddingTop: function (i, node) {
                            return 3;
                        },
                        paddingBottom: function (i, node) {
                            return 3;
                        },
                        fillColor: function (rowIndex, node, columnIndex) {
                            return "white";
                        },
                    },
                    table: {
                        headerRows: 1,
                        widths: ["*", 80],
                        body: [
                            [
                                {
                                    text: `Total`,
                                    border: [false, true, false, true],
                                    alignment: "right",
                                    characterSpacing: 1,
                                    fontSize: 8,
                                },
                                {
                                    text:
                                        formatCurrency(total) +
                                        " " +
                                        moedaPadrao.codigo,
                                    border: [true, true, true, true],
                                    color: "white",
                                    characterSpacing: 1,
                                    fontSize: 8,
                                    fillColor: "#6e6e6e",
                                    alignment: "right",
                                },
                            ],
                        ],
                    },
                },
                [
                    {
                        canvas: [
                            {
                                lineColor: "#6e6e6e",
                                type: "line",
                                x1: 0,
                                y1: 0.1,
                                x2: 515,
                                y2: 0.3,
                                lineWidth: 1,
                                lineHeight: 0.1,
                            },
                        ],
                    },
                ],
                [
                    {
                        text: "\nValor por extenso: " + extenso,
                        border: [true, true, true, true],
                        alignment: "left",
                        characterSpacing: 1,
                        fontSize: 8,
                    },
                ],
            ],
            footer: {
                margin: [20, 20, 20, 20],
                layout: {
                    defaultBorder: false,
                    hLineWidth: function (i, node) {
                        return 1;
                    },
                    vLineWidth: function (i, node) {
                        return 1;
                    },
                    hLineColor: function (i, node) {
                        return "white";
                    },
                    vLineColor: function (i, node) {
                        return "white";
                    },
                    hLineStyle: function (i, node) {
                        // if (i === 0 || i === node.table.body.length) {
                        return null;
                        //}
                    },
                    // vLineStyle: function (i, node) { return {dash: { length: 10, space: 4 }}; },
                    paddingLeft: function (i, node) {
                        return 10;
                    },
                    paddingRight: function (i, node) {
                        return 10;
                    },
                    paddingTop: function (i, node) {
                        return 3;
                    },
                    paddingBottom: function (i, node) {
                        return 3;
                    },
                    fillColor: function (rowIndex, node, columnIndex) {
                        return "white";
                    },
                },
                table: {
                    headerRows: 1,
                    widths: ["*", "*", "*", "*"],
                    body: [
                        [
                            {
                                text: "Instituição Bancária",
                                fillColor: "#6e6e6e",
                                color: "white",
                                border: [false, false, false, false],
                                characterSpacing: 1,
                                fontSize: 6,
                                normal: true,
                                bold: false,
                            },
                            {
                                text: "Numero da Conta",
                                fillColor: "#6e6e6e",
                                color: "white",
                                border: [false, false, false, false],
                                characterSpacing: 1,
                                fontSize: 6,
                                normal: true,
                                bold: false,
                            },
                            {
                                text: "NIB",
                                fillColor: "#6e6e6e",
                                color: "white",
                                border: [false, false, false, false],
                                characterSpacing: 1,
                                fontSize: 6,
                                normal: true,
                                bold: false,
                            },
                            {
                                text: "Swift",
                                fillColor: "#6e6e6e",
                                color: "white",
                                border: [false, false, false, false],
                                characterSpacing: 1,
                                fontSize: 6,
                                normal: true,
                                bold: false,
                            },
                        ],
                        ...dadosBancarios,

                        [
                            {
                                text: "Processado por Computador",
                                characterSpacing: 0.8,
                                fontSize: 5,
                                normal: false,
                                bold: true,
                                border: [false, true, false, false],
                            },
                            {
                                text: "",
                                characterSpacing: 1,
                                fontSize: 6,
                                normal: true,
                                bold: false,
                                border: [false, true, false, false],
                            },
                            {
                                text: "Licenciado a: ",
                                characterSpacing: 1,
                                fontSize: 6,
                                normal: true,
                                bold: false,
                                border: [false, true, false, false],
                                alignment: "right",
                            },
                            {
                                text: pertencenteA.nome,
                                characterSpacing: 0.8,
                                fontSize: 6,
                                normal: false,
                                bold: true,
                                border: [false, true, false, false],
                            },
                        ],
                    ],
                },
            },
        };

        const pdfDoc = printer.createPdfKitDocument(documentData);
        let chunks = [];
        pdfDoc.on("data", (chunk) => {
            chunks.push(chunk);
        });
        pdfDoc.on("end", () => {
            const result = Buffer.concat(chunks);
            res.setHeader("Content-Type", "Application/pdf");
            res.setHeader(
                "content-disposition",
                "attachment; filename=export.pdf"
            );
            res.send(result);
        });
        pdfDoc.end();
    } catch (error) {
        return handleResponse(req, res, 500, error);
    }
};

export const getPendentesClienteById = async (req, res) => {
    const { empresa } = req.user;
    const { id } = req.params;
    const response = [];
    const { userId } = req.user;

    if (
        !(await userCanAccess(
            "Pendentes dos Clientes",
            "Imprimir pendentes",
            userId
        ))
    ) {
        const message = "Sem permissão para imprimir os pendentes.";
        return handleResponse(req, res, 403, [], message);
    }
    const cliente = await knex("cliente").where({ id, empresa }).first();
    if (!cliente) {
        const message = "Cliente não encontrado.";
        return handleResponse(req, res, 404, [], message);
    }

    const pendenteClientes = await knex("pendente_cliente").where({
        empresa,
        cliente: id,
    });
    let total = 0;
    let subTotal = 0;
    const dadosBancarios = [];
    let extenso = "";

    for (let i = 0; i < pendenteClientes.length; i++) {
        pendenteClientes[i].valor_pago = formatCurrency(
            pendenteClientes[i].valor_pago
        );
        if (pendenteClientes[i].move_a_credito) {
            pendenteClientes[i].saldo = -pendenteClientes[i].saldo;
        }
        subTotal += Number(pendenteClientes[i].saldo);
        response.push({ ...pendenteClientes[i] });
    }
    total = subTotal;

    try {
        const printer = new pdfPrinter(fonts);
        const pertencenteA = await knex("empresa")
            .where({ id: empresa })
            .first();
        const logotipo = await knex("anexo")
            .where({ id: pertencenteA.logotipo })
            .first();
        const moedaPadrao = await knex("moeda")
            .where({ id: pertencenteA.moeda_padrao })
            .first();
        const contaBancaria = await knex("conta_bancaria")
            .where({
                removido: false,
                empresa,
            })
            .limit(3);

        for (let i = 0; i < contaBancaria.length; i++) {
            dadosBancarios.push([
                {
                    text: contaBancaria[i].nome_banco,
                    characterSpacing: 1,
                    fontSize: 6,
                    normal: true,
                    bold: false,
                },
                {
                    text: contaBancaria[i].numero_conta,
                    characterSpacing: 1,
                    fontSize: 6,
                    normal: true,
                    bold: false,
                },
                {
                    text: contaBancaria[i].nib,
                    characterSpacing: 1,
                    fontSize: 6,
                    normal: true,
                    bold: false,
                },
                {
                    text: contaBancaria[i].swift,
                    characterSpacing: 1,
                    fontSize: 6,
                    normal: true,
                    bold: false,
                },
            ]);
        }

        if (dadosBancarios.length == 0) {
            dadosBancarios.push([
                {
                    text: "-",
                    characterSpacing: 1,
                    fontSize: 6,
                    normal: true,
                    bold: false,
                },
                {
                    text: "-",
                    characterSpacing: 1,
                    fontSize: 6,
                    normal: true,
                    bold: false,
                },
                {
                    text: "-",
                    characterSpacing: 1,
                    fontSize: 6,
                    normal: true,
                    bold: false,
                },
                {
                    text: "-",
                    characterSpacing: 1,
                    fontSize: 6,
                    normal: true,
                    bold: false,
                },
            ]);
        }

        try {
            extenso = numeroPorExtenso.porExtenso(
                total,
                numeroPorExtenso.estilo.monetario
            );
            if (extenso.startsWith("um")) {
                extenso = extenso
                    .substr(2)
                    .replaceAll("reais", "meticais")
                    .trim();
            } else {
                extenso = extenso.replaceAll("reais", "meticais");
            }
        } catch (error) {
            console.log(error);
        }

        const data = [];

        for (let i = 0; i < response.length; i++) {
            data.push([
                {
                    text: response[i].data_emissao,
                    border: [true, true, true, true],
                    characterSpacing: 1,
                    fontSize: 7,
                },
                {
                    text: response[i].referencia,
                    border: [true, true, true, true],
                    characterSpacing: 1,
                    fontSize: 7,
                },
                {
                    text: response[i].data_vencimento,
                    border: [true, true, true, true],
                    characterSpacing: 1,
                    fontSize: 7,
                },
                {
                    text: formatCurrency(response[i].total_com_taxa),
                    border: [true, true, true, true],
                    characterSpacing: 1,
                    fontSize: 7,
                    alignment: "right",
                },
                {
                    text: response[i].valor_pago,
                    border: [true, true, true, true],
                    characterSpacing: 1,
                    fontSize: 7,
                    alignment: "right",
                },
                {
                    text: formatCurrency(response[i].saldo),
                    border: [true, true, true, true],
                    characterSpacing: 1,
                    fontSize: 7,
                    alignment: "right",
                },
            ]);
        }

        const documentData = {
            pageSize: "A4",
            defaultStyle: {
                font: "Courier",
            },
            pageMargins: [40, 35, 40, 80],
            content: [
                {
                    style: "header",
                    alignment: "justify",
                    columns: [
                        {
                            image: path.resolve(
                                `./uploads/anexos/${logotipo.nome_ficheiro}`
                            ),
                            fit: [70, 70],
                        },
                        [
                            {
                                text: "Pendentes do Cliente",
                                normal: true,
                                bold: false,
                                fontSize: 12,
                                characterSpacing: 1,
                            },
                            {
                                text:
                                    "Data: " +
                                    moment(new Date()).format("DD-MM-yyyy"),
                                normal: true,
                                bold: false,
                                fontSize: 8,
                                characterSpacing: 1,
                            },
                        ],
                    ],
                },
                {
                    columns: [
                        [
                            {
                                text: `\n${pertencenteA.nome}`,
                                normal: false,
                                bold: true,
                                fontSize: 12,
                                characterSpacing: 1,
                            },
                            {
                                text: `\n${
                                    pertencenteA.endereco1
                                        ? pertencenteA.endereco1
                                        : "Endereço: -"
                                }`,
                                normal: true,
                                bold: false,
                                fontSize: 10,
                                characterSpacing: 1,
                            },
                            {
                                text: `Contacto(s): ${
                                    pertencenteA.contacto1
                                        ? pertencenteA.contacto1
                                        : "-"
                                }`,
                                normal: true,
                                bold: false,
                                fontSize: 10,
                                characterSpacing: 1,
                            },
                            {
                                text: `E-mail: ${pertencenteA.email}`,
                                normal: true,
                                bold: false,
                                fontSize: 10,
                                characterSpacing: 1,
                            },
                            {
                                text: `Nuit: ${
                                    pertencenteA.nuit ? pertencenteA.nuit : "-"
                                }`,
                                normal: true,
                                bold: false,
                                fontSize: 10,
                                characterSpacing: 1,
                            },
                        ],
                        [
                            {
                                text: `\n${cliente.nome}`,
                                color: "",
                                normal: false,
                                bold: true,
                                fontSize: 12,
                                characterSpacing: 1,
                            },
                            {
                                text: `\n${
                                    cliente.endereco
                                        ? cliente.endereco
                                        : "Endereço: -"
                                }`,
                                normal: true,
                                bold: false,
                                fontSize: 10,
                                characterSpacing: 1,
                            },
                            {
                                text: `Contacto: ${
                                    cliente.contacto1 ? cliente.contacto1 : "-"
                                }`,
                                normal: true,
                                bold: false,
                                fontSize: 10,
                                characterSpacing: 1,
                            },
                            {
                                text: `E-mail: ${
                                    cliente.email ? cliente.email : "-"
                                }`,
                                normal: true,
                                bold: false,
                                fontSize: 10,
                                characterSpacing: 1,
                            },
                            {
                                text: `Nuit: ${
                                    cliente.nuit ? cliente.nuit : "-"
                                }`,
                                normal: true,
                                bold: false,
                                fontSize: 10,
                                characterSpacing: 1,
                            },
                        ],
                    ],
                },
                { columns: [{ text: "\n" }] },
                {
                    layout: {
                        defaultBorder: false,
                        hLineWidth: function (i, node) {
                            return 1;
                        },
                        vLineWidth: function (i, node) {
                            return 1;
                        },
                        hLineColor: function (i, node) {
                            return "lightgrey";
                        },
                        vLineColor: function (i, node) {
                            return "white";
                        },
                        hLineWidth: function (i, node) {
                            return 0.1;
                        },
                        hLineStyle: function (i, node) {
                            // if (i === 0 || i === node.table.body.length) {
                            return null;
                            //}
                        },
                        // vLineStyle: function (i, node) { return {dash: { length: 10, space: 4 }}; },
                        paddingLeft: function (i, node) {
                            return 5;
                        },
                        paddingRight: function (i, node) {
                            return 5;
                        },
                        paddingTop: function (i, node) {
                            return 3;
                        },
                        paddingBottom: function (i, node) {
                            return 2;
                        },
                        fillColor: function (rowIndex, node, columnIndex) {
                            return "white";
                        },
                        hLineWidth: function (i, node) {
                            return 0.1;
                        },
                    },
                    table: {
                        headerRows: 1,
                        widths: ["*", "*", "*", "*", "*", "*"],
                        body: [
                            [
                                {
                                    text: "Data de emissão",
                                    fillColor: "#6e6e6e",
                                    color: "white",
                                    border: [true, true, true, true],
                                    characterSpacing: 1,
                                    fontSize: 6.5,
                                },
                                {
                                    text: "N. do documento",
                                    fillColor: "#6e6e6e",
                                    color: "white",
                                    border: [true, true, true, true],
                                    characterSpacing: 1,
                                    fontSize: 6.5,
                                },
                                {
                                    text: "D. Expiração",
                                    fillColor: "#6e6e6e",
                                    color: "white",
                                    border: [true, true, true, true],
                                    characterSpacing: 1,
                                    fontSize: 6.5,
                                },
                                {
                                    text: "Preço total",
                                    fillColor: "#6e6e6e",
                                    color: "white",
                                    border: [true, true, true, true],
                                    characterSpacing: 1,
                                    fontSize: 6.5,
                                },
                                {
                                    text: `Valor pago`,
                                    fillColor: "#6e6e6e",
                                    color: "white",
                                    border: [true, true, true, true],
                                    characterSpacing: 1,
                                    fontSize: 6.5,
                                },
                                {
                                    text: `Saldo`,
                                    fillColor: "#6e6e6e",
                                    color: "white",
                                    border: [true, true, true, true],
                                    characterSpacing: 1,
                                    fontSize: 6.5,
                                },
                            ],
                            ...data,
                        ],
                    },
                },
                {
                    layout: {
                        defaultBorder: false,
                        hLineWidth: function (i, node) {
                            return 1;
                        },
                        vLineWidth: function (i, node) {
                            return 1;
                        },
                        hLineColor: function (i, node) {
                            return "white";
                        },
                        vLineColor: function (i, node) {
                            return "white";
                        },
                        hLineStyle: function (i, node) {
                            // if (i === 0 || i === node.table.body.length) {
                            return null;
                            //}
                        },
                        // vLineStyle: function (i, node) { return {dash: { length: 10, space: 4 }}; },
                        paddingLeft: function (i, node) {
                            return 10;
                        },
                        paddingRight: function (i, node) {
                            return 10;
                        },
                        paddingTop: function (i, node) {
                            return 3;
                        },
                        paddingBottom: function (i, node) {
                            return 3;
                        },
                        fillColor: function (rowIndex, node, columnIndex) {
                            return "white";
                        },
                    },
                    table: {
                        headerRows: 1,
                        widths: ["*", 80],
                        body: [
                            [
                                {
                                    text: `Total`,
                                    border: [false, true, false, true],
                                    alignment: "right",
                                    characterSpacing: 1,
                                    fontSize: 8,
                                },
                                {
                                    text:
                                        formatCurrency(total) +
                                        " " +
                                        moedaPadrao.codigo,
                                    border: [true, true, true, true],
                                    alignment: "right",
                                    color: "white",
                                    characterSpacing: 1,
                                    fontSize: 8,
                                    fillColor: "#6e6e6e",
                                },
                            ],
                        ],
                    },
                },
                [
                    {
                        canvas: [
                            {
                                lineColor: "#6e6e6e",
                                type: "line",
                                x1: 0,
                                y1: 0.1,
                                x2: 515,
                                y2: 0.3,
                                lineWidth: 1,
                                lineHeight: 0.1,
                            },
                        ],
                    },
                ],
                [
                    {
                        text: "\nValor por extenso: " + extenso,
                        border: [true, true, true, true],
                        alignment: "left",
                        characterSpacing: 1,
                        fontSize: 8,
                    },
                ],
            ],
            footer: {
                margin: [20, 20, 20, 20],
                layout: {
                    defaultBorder: false,
                    hLineWidth: function (i, node) {
                        return 1;
                    },
                    vLineWidth: function (i, node) {
                        return 1;
                    },
                    hLineColor: function (i, node) {
                        return "white";
                    },
                    vLineColor: function (i, node) {
                        return "white";
                    },
                    hLineStyle: function (i, node) {
                        // if (i === 0 || i === node.table.body.length) {
                        return null;
                        //}
                    },
                    // vLineStyle: function (i, node) { return {dash: { length: 10, space: 4 }}; },
                    paddingLeft: function (i, node) {
                        return 10;
                    },
                    paddingRight: function (i, node) {
                        return 10;
                    },
                    paddingTop: function (i, node) {
                        return 3;
                    },
                    paddingBottom: function (i, node) {
                        return 3;
                    },
                    fillColor: function (rowIndex, node, columnIndex) {
                        return "white";
                    },
                },
                table: {
                    headerRows: 1,
                    widths: ["*", "*", "*", "*"],
                    body: [
                        [
                            {
                                text: "Instituição Bancária",
                                fillColor: "#6e6e6e",
                                color: "white",
                                border: [false, false, false, false],
                                characterSpacing: 1,
                                fontSize: 6,
                                normal: true,
                                bold: false,
                            },
                            {
                                text: "Numero da Conta",
                                fillColor: "#6e6e6e",
                                color: "white",
                                border: [false, false, false, false],
                                characterSpacing: 1,
                                fontSize: 6,
                                normal: true,
                                bold: false,
                            },
                            {
                                text: "NIB",
                                fillColor: "#6e6e6e",
                                color: "white",
                                border: [false, false, false, false],
                                characterSpacing: 1,
                                fontSize: 6,
                                normal: true,
                                bold: false,
                            },
                            {
                                text: "Swift",
                                fillColor: "#6e6e6e",
                                color: "white",
                                border: [false, false, false, false],
                                characterSpacing: 1,
                                fontSize: 6,
                                normal: true,
                                bold: false,
                            },
                        ],
                        ...dadosBancarios,

                        [
                            {
                                text: "Processado por Computador",
                                characterSpacing: 0.8,
                                fontSize: 5,
                                normal: false,
                                bold: true,
                                border: [false, true, false, false],
                            },
                            {
                                text: "",
                                characterSpacing: 1,
                                fontSize: 6,
                                normal: true,
                                bold: false,
                                border: [false, true, false, false],
                            },
                            {
                                text: "Licenciado a: ",
                                characterSpacing: 1,
                                fontSize: 6,
                                normal: true,
                                bold: false,
                                border: [false, true, false, false],
                                alignment: "right",
                            },
                            {
                                text: pertencenteA.nome,
                                characterSpacing: 0.8,
                                fontSize: 6,
                                normal: false,
                                bold: true,
                                border: [false, true, false, false],
                            },
                        ],
                    ],
                },
            },
        };

        const pdfDoc = printer.createPdfKitDocument(documentData);
        let chunks = [];
        pdfDoc.on("data", (chunk) => {
            chunks.push(chunk);
        });
        pdfDoc.on("end", () => {
            const result = Buffer.concat(chunks);
            res.setHeader("Content-Type", "Application/pdf");
            res.setHeader(
                "content-disposition",
                "attachment; filename=export.pdf"
            );
            res.send(result);
        });
        pdfDoc.end();
    } catch (error) {
        return handleResponse(req, res, 500, error);
    }
};

export const getExtratoClienteById = async (req, res) => {
    const { userId } = req.user;

    if (
        !(await userCanAccess(
            "Extratos dos Clientes",
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
    let extenso = "";
    const dadosBancarios = [];

    const cliente = await knex("cliente").where({ id, empresa }).first();

    if (!cliente) {
        const message = "Cliente não encontrado.";
        return handleResponse(req, res, 404, [], message);
    }

    const clienteExtratos = await knex("extrato_cliente").where({
        cliente: id,
    });

    for (let i = 0; i < clienteExtratos.length; i++) {
        clienteExtratos[i].valor_pago = formatCurrency(
            clienteExtratos[i].valor_pago
        );

        response.push([
            {
                text: clienteExtratos[i].data_emissao,
                border: [true, true, true, true],
                characterSpacing: 1,
                fontSize: 7,
            },
            {
                text: clienteExtratos[i].referencia,
                border: [true, true, true, true],
                characterSpacing: 1,
                fontSize: 7,
            },
            {
                text: formatCurrency(clienteExtratos[i].debito),
                border: [true, true, true, true],
                characterSpacing: 1,
                fontSize: 7,
                alignment: "right",
            },
            {
                text: formatCurrency(clienteExtratos[i].credito),
                border: [true, true, true, true],
                characterSpacing: 1,
                fontSize: 7,
                alignment: "right",
            },
            {
                text: formatCurrency(
                    debito -
                        credito +
                        clienteExtratos[i].debito -
                        clienteExtratos[i].credito
                ),
                border: [true, true, true, true],
                characterSpacing: 1,
                fontSize: 7,
                alignment: "right",
            },
        ]);

        credito += Number(clienteExtratos[i].credito);
        debito += Number(clienteExtratos[i].debito);
    }

    total = debito - credito;

    try {
        const printer = new pdfPrinter(fonts);
        const pertencenteA = await knex("empresa")
            .where({ id: empresa })
            .first();
        const logotipo = await knex("anexo")
            .where({ id: pertencenteA.logotipo })
            .first();
        const moedaPadrao = await knex("moeda")
            .where({ id: pertencenteA.moeda_padrao })
            .first();
        const contaBancaria = await knex("conta_bancaria")
            .where({
                removido: false,
                empresa,
            })
            .limit(3);

        for (let i = 0; i < contaBancaria.length; i++) {
            dadosBancarios.push([
                {
                    text: contaBancaria[i].nome_banco,
                    characterSpacing: 1,
                    fontSize: 6,
                    normal: true,
                    bold: false,
                },
                {
                    text: contaBancaria[i].numero_conta,
                    characterSpacing: 1,
                    fontSize: 6,
                    normal: true,
                    bold: false,
                },
                {
                    text: contaBancaria[i].nib,
                    characterSpacing: 1,
                    fontSize: 6,
                    normal: true,
                    bold: false,
                },
                {
                    text: contaBancaria[i].swift,
                    characterSpacing: 1,
                    fontSize: 6,
                    normal: true,
                    bold: false,
                },
            ]);
        }

        if (dadosBancarios.length == 0) {
            dadosBancarios.push([
                {
                    text: "-",
                    characterSpacing: 1,
                    fontSize: 6,
                    normal: true,
                    bold: false,
                },
                {
                    text: "-",
                    characterSpacing: 1,
                    fontSize: 6,
                    normal: true,
                    bold: false,
                },
                {
                    text: "-",
                    characterSpacing: 1,
                    fontSize: 6,
                    normal: true,
                    bold: false,
                },
                {
                    text: "-",
                    characterSpacing: 1,
                    fontSize: 6,
                    normal: true,
                    bold: false,
                },
            ]);
        }

        try {
            extenso = numeroPorExtenso.porExtenso(
                total,
                numeroPorExtenso.estilo.monetario
            );
            if (extenso.startsWith("um")) {
                extenso = extenso
                    .substr(2)
                    .replaceAll("reais", "meticais")
                    .trim();
            } else {
                extenso = extenso.replaceAll("reais", "meticais");
            }
        } catch (error) {
            console.log(error);
        }

        const documentData = {
            pageSize: "A4",
            defaultStyle: {
                font: "Courier",
            },
            pageMargins: [40, 35, 40, 80],
            content: [
                {
                    style: "header",
                    alignment: "justify",
                    columns: [
                        {
                            image: path.resolve(
                                `./uploads/anexos/${logotipo.nome_ficheiro}`
                            ),
                            fit: [70, 70],
                        },
                        [
                            {
                                text: "Extrato do Cliente",
                                normal: true,
                                bold: false,
                                fontSize: 12,
                                characterSpacing: 1,
                            },
                            {
                                text:
                                    "Data: " +
                                    moment(new Date()).format("DD-MM-yyyy"),
                                normal: true,
                                bold: false,
                                fontSize: 8,
                                characterSpacing: 1,
                            },
                        ],
                    ],
                },
                {
                    columns: [
                        [
                            {
                                text: `\n${pertencenteA.nome}`,
                                normal: false,
                                bold: true,
                                fontSize: 12,
                                characterSpacing: 1,
                            },
                            {
                                text: `\n${
                                    pertencenteA.endereco1
                                        ? pertencenteA.endereco1
                                        : "Endereço: -"
                                }`,
                                normal: true,
                                bold: false,
                                fontSize: 10,
                                characterSpacing: 1,
                            },
                            {
                                text: `Contacto(s): ${
                                    pertencenteA.contacto1
                                        ? pertencenteA.contacto1
                                        : "-"
                                }`,
                                normal: true,
                                bold: false,
                                fontSize: 10,
                                characterSpacing: 1,
                            },
                            {
                                text: `E-mail: ${pertencenteA.email}`,
                                normal: true,
                                bold: false,
                                fontSize: 10,
                                characterSpacing: 1,
                            },
                            {
                                text: `Nuit: ${
                                    pertencenteA.nuit ? pertencenteA.nuit : "-"
                                }`,
                                normal: true,
                                bold: false,
                                fontSize: 10,
                                characterSpacing: 1,
                            },
                        ],
                        [
                            {
                                text: `\n${cliente.nome}`,
                                color: "",
                                normal: false,
                                bold: true,
                                fontSize: 12,
                                characterSpacing: 1,
                            },
                            {
                                text: `\n${
                                    cliente.endereco
                                        ? cliente.endereco
                                        : "Endereço: -"
                                }`,
                                normal: true,
                                bold: false,
                                fontSize: 10,
                                characterSpacing: 1,
                            },
                            {
                                text: `Contacto: ${
                                    cliente.contacto1 ? cliente.contacto1 : "-"
                                }`,
                                normal: true,
                                bold: false,
                                fontSize: 10,
                                characterSpacing: 1,
                            },
                            {
                                text: `E-mail: ${
                                    cliente.email ? cliente.email : "-"
                                }`,
                                normal: true,
                                bold: false,
                                fontSize: 10,
                                characterSpacing: 1,
                            },
                            {
                                text: `Nuit: ${
                                    cliente.nuit ? cliente.nuit : "-"
                                }`,
                                normal: true,
                                bold: false,
                                fontSize: 10,
                                characterSpacing: 1,
                            },
                        ],
                    ],
                },
                { columns: [{ text: "\n" }] },
                {
                    layout: {
                        defaultBorder: false,
                        hLineWidth: function (i, node) {
                            return 1;
                        },
                        vLineWidth: function (i, node) {
                            return 1;
                        },
                        hLineColor: function (i, node) {
                            return "lightgrey";
                        },
                        vLineColor: function (i, node) {
                            return "white";
                        },
                        hLineWidth: function (i, node) {
                            return 0.1;
                        },
                        hLineStyle: function (i, node) {
                            // if (i === 0 || i === node.table.body.length) {
                            return null;
                            //}
                        },
                        // vLineStyle: function (i, node) { return {dash: { length: 10, space: 4 }}; },
                        paddingLeft: function (i, node) {
                            return 5;
                        },
                        paddingRight: function (i, node) {
                            return 5;
                        },
                        paddingTop: function (i, node) {
                            return 3;
                        },
                        paddingBottom: function (i, node) {
                            return 2;
                        },
                        fillColor: function (rowIndex, node, columnIndex) {
                            return "white";
                        },
                        hLineWidth: function (i, node) {
                            return 0.1;
                        },
                    },
                    table: {
                        headerRows: 1,
                        widths: ["*", "*", "*", "*", "*"],
                        body: [
                            [
                                {
                                    text: "Data de emissão",
                                    fillColor: "#6e6e6e",
                                    color: "white",
                                    border: [true, true, true, true],
                                    characterSpacing: 1,
                                    fontSize: 6.5,
                                },
                                {
                                    text: "N. do documento",
                                    fillColor: "#6e6e6e",
                                    color: "white",
                                    border: [true, true, true, true],
                                    characterSpacing: 1,
                                    fontSize: 6.5,
                                },
                                {
                                    text: "Débito",
                                    fillColor: "#6e6e6e",
                                    color: "white",
                                    border: [true, true, true, true],
                                    characterSpacing: 1,
                                    fontSize: 6.5,
                                },
                                {
                                    text: "Crédito",
                                    fillColor: "#6e6e6e",
                                    color: "white",
                                    border: [true, true, true, true],
                                    characterSpacing: 1,
                                    fontSize: 6.5,
                                },
                                {
                                    text: `Saldo`,
                                    fillColor: "#6e6e6e",
                                    color: "white",
                                    border: [true, true, true, true],
                                    characterSpacing: 1,
                                    fontSize: 6.5,
                                },
                            ],
                            ...response,
                            [
                                {
                                    text: "",
                                    border: [true, true, true, true],
                                    characterSpacing: 1,
                                    fontSize: 6.5,
                                },
                                {
                                    text: "Total:",
                                    border: [true, true, true, true],
                                    characterSpacing: 1,
                                    fontSize: 7,
                                    bold: true,
                                    fillColor: "#28c76f",
                                    color: "black",
                                },
                                {
                                    text:
                                        formatCurrency(debito) +
                                        " " +
                                        moedaPadrao.codigo,
                                    border: [true, true, true, true],
                                    characterSpacing: 1,
                                    fontSize: 7,
                                    fillColor: "#28c76f",
                                    color: "black",
                                    alignment: "right",
                                },
                                {
                                    text:
                                        formatCurrency(credito) +
                                        " " +
                                        moedaPadrao.codigo,
                                    border: [true, true, true, true],
                                    characterSpacing: 1,
                                    fontSize: 7,
                                    fillColor: "#28c76f",
                                    color: "black",
                                    alignment: "right",
                                },
                                {
                                    text:
                                        formatCurrency(total) +
                                        " " +
                                        moedaPadrao.codigo,
                                    border: [true, true, true, true],
                                    characterSpacing: 1,
                                    fontSize: 7,
                                    fillColor: "#28c76f",
                                    color: "black",
                                    alignment: "right",
                                },
                            ],
                        ],
                    },
                },
                [
                    {
                        canvas: [
                            {
                                lineColor: "#6e6e6e",
                                type: "line",
                                x1: 0,
                                y1: 0.1,
                                x2: 515,
                                y2: 0.3,
                                lineWidth: 1,
                                lineHeight: 0.1,
                            },
                        ],
                    },
                ],
                [
                    {
                        text: "\nValor por extenso: " + extenso,
                        border: [true, true, true, true],
                        alignment: "left",
                        characterSpacing: 1,
                        fontSize: 8,
                    },
                ],
            ],
            footer: {
                margin: [20, 20, 20, 20],
                layout: {
                    defaultBorder: false,
                    hLineWidth: function (i, node) {
                        return 1;
                    },
                    vLineWidth: function (i, node) {
                        return 1;
                    },
                    hLineColor: function (i, node) {
                        return "white";
                    },
                    vLineColor: function (i, node) {
                        return "white";
                    },
                    hLineStyle: function (i, node) {
                        // if (i === 0 || i === node.table.body.length) {
                        return null;
                        //}
                    },
                    // vLineStyle: function (i, node) { return {dash: { length: 10, space: 4 }}; },
                    paddingLeft: function (i, node) {
                        return 10;
                    },
                    paddingRight: function (i, node) {
                        return 10;
                    },
                    paddingTop: function (i, node) {
                        return 3;
                    },
                    paddingBottom: function (i, node) {
                        return 3;
                    },
                    fillColor: function (rowIndex, node, columnIndex) {
                        return "white";
                    },
                },
                table: {
                    headerRows: 1,
                    widths: ["*", "*", "*", "*"],
                    body: [
                        [
                            {
                                text: "Instituição Bancária",
                                fillColor: "#6e6e6e",
                                color: "white",
                                border: [false, false, false, false],
                                characterSpacing: 1,
                                fontSize: 6,
                                normal: true,
                                bold: false,
                            },
                            {
                                text: "Numero da Conta",
                                fillColor: "#6e6e6e",
                                color: "white",
                                border: [false, false, false, false],
                                characterSpacing: 1,
                                fontSize: 6,
                                normal: true,
                                bold: false,
                            },
                            {
                                text: "NIB",
                                fillColor: "#6e6e6e",
                                color: "white",
                                border: [false, false, false, false],
                                characterSpacing: 1,
                                fontSize: 6,
                                normal: true,
                                bold: false,
                            },
                            {
                                text: "Swift",
                                fillColor: "#6e6e6e",
                                color: "white",
                                border: [false, false, false, false],
                                characterSpacing: 1,
                                fontSize: 6,
                                normal: true,
                                bold: false,
                            },
                        ],
                        ...dadosBancarios,
                        [
                            {
                                text: "Processado por Computador",
                                characterSpacing: 0.8,
                                fontSize: 5,
                                normal: false,
                                bold: true,
                                border: [false, true, false, false],
                            },
                            {
                                text: "",
                                characterSpacing: 1,
                                fontSize: 6,
                                normal: true,
                                bold: false,
                                border: [false, true, false, false],
                            },
                            {
                                text: "Licenciado a: ",
                                characterSpacing: 1,
                                fontSize: 6,
                                normal: true,
                                bold: false,
                                border: [false, true, false, false],
                                alignment: "right",
                            },
                            {
                                text: pertencenteA.nome,
                                characterSpacing: 0.8,
                                fontSize: 6,
                                normal: false,
                                bold: true,
                                border: [false, true, false, false],
                            },
                        ],
                    ],
                },
            },
        };

        const pdfDoc = printer.createPdfKitDocument(documentData);
        let chunks = [];
        pdfDoc.on("data", (chunk) => {
            chunks.push(chunk);
        });
        pdfDoc.on("end", () => {
            const result = Buffer.concat(chunks);
            res.setHeader("Content-Type", "Application/pdf");
            res.setHeader(
                "content-disposition",
                "attachment; filename=export.pdf"
            );
            res.send(result);
        });
        pdfDoc.end();
    } catch (error) {
        return handleResponse(req, res, 500, error);
    }
};

export const getFornecedoresPendentes = async (req, res) => {
    const { empresa } = req.user;
    const response = [];
    const { userId } = req.user;

    if (
        !(await userCanAccess(
            "Pendentes dos Fornecedores",
            "Imprimir pendentes",
            userId
        ))
    ) {
        const message = "Sem permissão para imprimir os pendentes.";
        return handleResponse(req, res, 403, [], message);
    }

    const pendenteFornecedores = await knex("pendente_fornecedor").where({
        empresa,
    });
    let lastFornecedor = 0;
    let fornecedor = {};
    let total = 0;
    const dadosBancarios = [];
    let extenso = "";

    for (let i = 0; i < pendenteFornecedores.length; i++) {
        const index = response.findIndex(
            (item) => item.id == pendenteFornecedores[i].fornecedor
        );
        if (pendenteFornecedores[i].move_a_credito) {
            pendenteFornecedores[i].saldo = -pendenteFornecedores[i].saldo;
        }

        if (index >= 0) {
            response[index].group.push({
                ...pendenteFornecedores[i],
                valor_pago: pendenteFornecedores[i].valor_pago.toFixed(2),
            });
        } else {
            if (lastFornecedor != pendenteFornecedores[i].fornecedor) {
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

    try {
        const printer = new pdfPrinter(fonts);
        const pertencenteA = await knex("empresa")
            .where({ id: empresa })
            .first();
        const logotipo = await knex("anexo")
            .where({ id: pertencenteA.logotipo })
            .first();
        const moedaPadrao = await knex("moeda")
            .where({ id: pertencenteA.moeda_padrao })
            .first();
        const contaBancaria = await knex("conta_bancaria")
            .where({
                removido: false,
                empresa,
            })
            .limit(3);

        for (let i = 0; i < contaBancaria.length; i++) {
            dadosBancarios.push([
                {
                    text: contaBancaria[i].nome_banco,
                    characterSpacing: 1,
                    fontSize: 6,
                    normal: true,
                    bold: false,
                },
                {
                    text: contaBancaria[i].numero_conta,
                    characterSpacing: 1,
                    fontSize: 6,
                    normal: true,
                    bold: false,
                },
                {
                    text: contaBancaria[i].nib,
                    characterSpacing: 1,
                    fontSize: 6,
                    normal: true,
                    bold: false,
                },
                {
                    text: contaBancaria[i].swift,
                    characterSpacing: 1,
                    fontSize: 6,
                    normal: true,
                    bold: false,
                },
            ]);
        }

        if (dadosBancarios.length == 0) {
            dadosBancarios.push([
                {
                    text: "-",
                    characterSpacing: 1,
                    fontSize: 6,
                    normal: true,
                    bold: false,
                },
                {
                    text: "-",
                    characterSpacing: 1,
                    fontSize: 6,
                    normal: true,
                    bold: false,
                },
                {
                    text: "-",
                    characterSpacing: 1,
                    fontSize: 6,
                    normal: true,
                    bold: false,
                },
                {
                    text: "-",
                    characterSpacing: 1,
                    fontSize: 6,
                    normal: true,
                    bold: false,
                },
            ]);
        }

        try {
            extenso = numeroPorExtenso.porExtenso(
                total,
                numeroPorExtenso.estilo.monetario
            );
            if (extenso.startsWith("um")) {
                extenso = extenso
                    .substr(2)
                    .replaceAll("reais", "meticais")
                    .trim();
            } else {
                extenso = extenso.replaceAll("reais", "meticais");
            }
        } catch (error) {
            console.log(error);
        }

        const data = [];

        for (let i = 0; i < response.length; i++) {
            data.push([
                {
                    text: response[i].nome,
                    border: [true, true, true, true],
                    characterSpacing: 1,
                    fontSize: 7,
                    fillColor: "#28c76f",
                    color: "black",
                },
                {
                    text: "",
                    border: [true, true, true, true],
                    characterSpacing: 1,
                    fontSize: 7,
                    fillColor: "#28c76f",
                    color: "black",
                },
                {
                    text: "",
                    border: [true, true, true, true],
                    characterSpacing: 1,
                    fontSize: 7,
                    fillColor: "#28c76f",
                    color: "black",
                },
                {
                    text: "",
                    border: [true, true, true, true],
                    characterSpacing: 1,
                    fontSize: 7,
                    fillColor: "#28c76f",
                    color: "black",
                },
                {
                    text: "",
                    border: [true, true, true, true],
                    characterSpacing: 1,
                    fontSize: 7,
                    fillColor: "#28c76f",
                    color: "black",
                },
                {
                    text: "",
                    border: [true, true, true, true],
                    characterSpacing: 1,
                    fontSize: 7,
                    fillColor: "#28c76f",
                    color: "black",
                },
            ]);

            response[i].group.map((group) => {
                data.push([
                    {
                        text: group.data_emissao,
                        border: [true, true, true, true],
                        characterSpacing: 1,
                        fontSize: 7,
                    },
                    {
                        text: group.referencia,
                        border: [true, true, true, true],
                        characterSpacing: 1,
                        fontSize: 7,
                    },
                    {
                        text: "-",
                        border: [true, true, true, true],
                        characterSpacing: 1,
                        fontSize: 7,
                    },
                    {
                        text: formatCurrency(group.total_com_taxa),
                        border: [true, true, true, true],
                        characterSpacing: 1,
                        fontSize: 7,
                    },
                    {
                        text: formatCurrency(group.valor_pago),
                        border: [true, true, true, true],
                        characterSpacing: 1,
                        fontSize: 7,
                    },
                    {
                        text: formatCurrency(group.saldo),
                        border: [true, true, true, true],
                        characterSpacing: 1,
                        fontSize: 7,
                    },
                ]);
            });

            data.push([
                {
                    text: "",
                    border: [true, true, true, true],
                    characterSpacing: 1,
                    fontSize: 7,
                },
                {
                    text: "",
                    border: [true, true, true, true],
                    characterSpacing: 1,
                    fontSize: 7,
                },
                {
                    text: "",
                    border: [true, true, true, true],
                    characterSpacing: 1,
                    fontSize: 7,
                },
                {
                    text: "",
                    border: [true, true, true, true],
                    characterSpacing: 1,
                    fontSize: 7,
                },
                {
                    text: "Subtotal:",
                    border: [true, true, true, true],
                    characterSpacing: 1,
                    fontSize: 7,
                    bold: true,
                },
                {
                    text:
                        formatCurrency(response[i].subTotal) +
                        " " +
                        moedaPadrao.codigo,
                    border: [true, true, true, true],
                    characterSpacing: 1,
                    fontSize: 7,
                    bold: true,
                },
            ]);
        }

        const documentData = {
            pageSize: "A4",
            defaultStyle: {
                font: "Courier",
            },
            pageMargins: [40, 35, 40, 80],
            content: [
                {
                    style: "header",
                    alignment: "justify",
                    columns: [
                        {
                            image: path.resolve(
                                `./uploads/anexos/${logotipo.nome_ficheiro}`
                            ),
                            fit: [70, 70],
                        },
                        [
                            {
                                text: "Pendentes dos Fornecedores",
                                normal: true,
                                bold: false,
                                fontSize: 12,
                                characterSpacing: 1,
                            },
                            {
                                text:
                                    "Data: " +
                                    moment(new Date()).format("DD-MM-yyyy"),
                                normal: true,
                                bold: false,
                                fontSize: 8,
                                characterSpacing: 1,
                            },
                        ],
                    ],
                },
                {
                    columns: [
                        [
                            {
                                text: `\n${pertencenteA.nome}`,
                                normal: false,
                                bold: true,
                                fontSize: 12,
                                characterSpacing: 1,
                            },
                            {
                                text: `\n${
                                    pertencenteA.endereco1
                                        ? pertencenteA.endereco1
                                        : "Endereço: -"
                                }`,
                                normal: true,
                                bold: false,
                                fontSize: 10,
                                characterSpacing: 1,
                            },
                            {
                                text: `Contacto(s): ${
                                    pertencenteA.contacto1
                                        ? pertencenteA.contacto1
                                        : "-"
                                }`,
                                normal: true,
                                bold: false,
                                fontSize: 10,
                                characterSpacing: 1,
                            },
                            {
                                text: `E-mail: ${pertencenteA.email}`,
                                normal: true,
                                bold: false,
                                fontSize: 10,
                                characterSpacing: 1,
                            },
                            {
                                text: `Nuit: ${
                                    pertencenteA.nuit ? pertencenteA.nuit : "-"
                                }`,
                                normal: true,
                                bold: false,
                                fontSize: 10,
                                characterSpacing: 1,
                            },
                        ],
                    ],
                },
                { columns: [{ text: "\n" }] },
                {
                    layout: {
                        defaultBorder: false,
                        hLineWidth: function (i, node) {
                            return 1;
                        },
                        vLineWidth: function (i, node) {
                            return 1;
                        },
                        hLineColor: function (i, node) {
                            return "lightgrey";
                        },
                        vLineColor: function (i, node) {
                            return "white";
                        },
                        hLineWidth: function (i, node) {
                            return 0.1;
                        },
                        hLineStyle: function (i, node) {
                            // if (i === 0 || i === node.table.body.length) {
                            return null;
                            //}
                        },
                        // vLineStyle: function (i, node) { return {dash: { length: 10, space: 4 }}; },
                        paddingLeft: function (i, node) {
                            return 5;
                        },
                        paddingRight: function (i, node) {
                            return 5;
                        },
                        paddingTop: function (i, node) {
                            return 3;
                        },
                        paddingBottom: function (i, node) {
                            return 2;
                        },
                        fillColor: function (rowIndex, node, columnIndex) {
                            return "white";
                        },
                        hLineWidth: function (i, node) {
                            return 0.1;
                        },
                    },
                    table: {
                        headerRows: 1,
                        widths: ["*", "*", "*", "*", "*", "*"],
                        body: [
                            [
                                {
                                    text: "Data de emissão",
                                    fillColor: "#6e6e6e",
                                    color: "white",
                                    border: [true, true, true, true],
                                    characterSpacing: 1,
                                    fontSize: 6.5,
                                },
                                {
                                    text: "N. do documento",
                                    fillColor: "#6e6e6e",
                                    color: "white",
                                    border: [true, true, true, true],
                                    characterSpacing: 1,
                                    fontSize: 6.5,
                                },
                                {
                                    text: "D. Expiração",
                                    fillColor: "#6e6e6e",
                                    color: "white",
                                    border: [true, true, true, true],
                                    characterSpacing: 1,
                                    fontSize: 6.5,
                                },
                                {
                                    text: "Preço total",
                                    fillColor: "#6e6e6e",
                                    color: "white",
                                    border: [true, true, true, true],
                                    characterSpacing: 1,
                                    fontSize: 6.5,
                                },
                                {
                                    text: `Valor pago`,
                                    fillColor: "#6e6e6e",
                                    color: "white",
                                    border: [true, true, true, true],
                                    characterSpacing: 1,
                                    fontSize: 6.5,
                                },
                                {
                                    text: `Saldo`,
                                    fillColor: "#6e6e6e",
                                    color: "white",
                                    border: [true, true, true, true],
                                    characterSpacing: 1,
                                    fontSize: 6.5,
                                },
                            ],
                            ...data,
                        ],
                    },
                },
                {
                    layout: {
                        defaultBorder: false,
                        hLineWidth: function (i, node) {
                            return 1;
                        },
                        vLineWidth: function (i, node) {
                            return 1;
                        },
                        hLineColor: function (i, node) {
                            return "white";
                        },
                        vLineColor: function (i, node) {
                            return "white";
                        },
                        hLineStyle: function (i, node) {
                            // if (i === 0 || i === node.table.body.length) {
                            return null;
                            //}
                        },
                        // vLineStyle: function (i, node) { return {dash: { length: 10, space: 4 }}; },
                        paddingLeft: function (i, node) {
                            return 10;
                        },
                        paddingRight: function (i, node) {
                            return 10;
                        },
                        paddingTop: function (i, node) {
                            return 3;
                        },
                        paddingBottom: function (i, node) {
                            return 3;
                        },
                        fillColor: function (rowIndex, node, columnIndex) {
                            return "white";
                        },
                    },
                    table: {
                        headerRows: 1,
                        widths: ["*", 80],
                        body: [
                            [
                                {
                                    text: `Total`,
                                    border: [false, true, false, true],
                                    alignment: "right",
                                    characterSpacing: 1,
                                    fontSize: 8,
                                },
                                {
                                    text:
                                        formatCurrency(total) +
                                        " " +
                                        moedaPadrao.codigo,
                                    border: [true, true, true, true],
                                    alignment: "center",
                                    color: "white",
                                    characterSpacing: 1,
                                    fontSize: 8,
                                    fillColor: "#6e6e6e",
                                },
                            ],
                        ],
                    },
                },
                [
                    {
                        canvas: [
                            {
                                lineColor: "#6e6e6e",
                                type: "line",
                                x1: 0,
                                y1: 0.1,
                                x2: 515,
                                y2: 0.3,
                                lineWidth: 1,
                                lineHeight: 0.1,
                            },
                        ],
                    },
                ],
                [
                    {
                        text: "\nValor por extenso: " + extenso,
                        border: [true, true, true, true],
                        alignment: "left",
                        characterSpacing: 1,
                        fontSize: 8,
                    },
                ],
            ],
            footer: {
                margin: [20, 20, 20, 20],
                layout: {
                    defaultBorder: false,
                    hLineWidth: function (i, node) {
                        return 1;
                    },
                    vLineWidth: function (i, node) {
                        return 1;
                    },
                    hLineColor: function (i, node) {
                        return "white";
                    },
                    vLineColor: function (i, node) {
                        return "white";
                    },
                    hLineStyle: function (i, node) {
                        // if (i === 0 || i === node.table.body.length) {
                        return null;
                        //}
                    },
                    // vLineStyle: function (i, node) { return {dash: { length: 10, space: 4 }}; },
                    paddingLeft: function (i, node) {
                        return 10;
                    },
                    paddingRight: function (i, node) {
                        return 10;
                    },
                    paddingTop: function (i, node) {
                        return 3;
                    },
                    paddingBottom: function (i, node) {
                        return 3;
                    },
                    fillColor: function (rowIndex, node, columnIndex) {
                        return "white";
                    },
                },
                table: {
                    headerRows: 1,
                    widths: ["*", "*", "*", "*"],
                    body: [
                        [
                            {
                                text: "Instituição Bancária",
                                fillColor: "#6e6e6e",
                                color: "white",
                                border: [false, false, false, false],
                                characterSpacing: 1,
                                fontSize: 6,
                                normal: true,
                                bold: false,
                            },
                            {
                                text: "Numero da Conta",
                                fillColor: "#6e6e6e",
                                color: "white",
                                border: [false, false, false, false],
                                characterSpacing: 1,
                                fontSize: 6,
                                normal: true,
                                bold: false,
                            },
                            {
                                text: "NIB",
                                fillColor: "#6e6e6e",
                                color: "white",
                                border: [false, false, false, false],
                                characterSpacing: 1,
                                fontSize: 6,
                                normal: true,
                                bold: false,
                            },
                            {
                                text: "Swift",
                                fillColor: "#6e6e6e",
                                color: "white",
                                border: [false, false, false, false],
                                characterSpacing: 1,
                                fontSize: 6,
                                normal: true,
                                bold: false,
                            },
                        ],
                        ...dadosBancarios,

                        [
                            {
                                text: "Processado por Computador",
                                characterSpacing: 0.8,
                                fontSize: 5,
                                normal: false,
                                bold: true,
                                border: [false, true, false, false],
                            },
                            {
                                text: "",
                                characterSpacing: 1,
                                fontSize: 6,
                                normal: true,
                                bold: false,
                                border: [false, true, false, false],
                            },
                            {
                                text: "Licenciado a: ",
                                characterSpacing: 1,
                                fontSize: 6,
                                normal: true,
                                bold: false,
                                border: [false, true, false, false],
                                alignment: "right",
                            },
                            {
                                text: pertencenteA.nome,
                                characterSpacing: 0.8,
                                fontSize: 6,
                                normal: false,
                                bold: true,
                                border: [false, true, false, false],
                            },
                        ],
                    ],
                },
            },
        };

        const pdfDoc = printer.createPdfKitDocument(documentData);
        let chunks = [];
        pdfDoc.on("data", (chunk) => {
            chunks.push(chunk);
        });
        pdfDoc.on("end", () => {
            const result = Buffer.concat(chunks);
            res.setHeader("Content-Type", "Application/pdf");
            res.setHeader(
                "content-disposition",
                "attachment; filename=export.pdf"
            );
            res.send(result);
        });
        pdfDoc.end();
    } catch (error) {
        return handleResponse(req, res, 500, error);
    }
};

export const getPendentesFornecedorById = async (req, res) => {
    const { empresa } = req.user;
    const { id } = req.params;
    const response = [];
    const { userId } = req.user;

    if (
        !(await userCanAccess(
            "Pendentes dos Fornecedores",
            "Imprimir pendentes",
            userId
        ))
    ) {
        const message = "Sem permissão para imprimir os pendentes.";
        return handleResponse(req, res, 403, [], message);
    }
    const fornecedor = await knex("fornecedor").where({ id, empresa }).first();
    if (!fornecedor) {
        const message = "Fornecedor não encontrado.";
        return handleResponse(req, res, 404, [], message);
    }

    const pendenteFornecedores = await knex("pendente_fornecedor").where({
        empresa,
        fornecedor: id,
    });
    let total = 0;
    let subTotal = 0;
    const dadosBancarios = [];
    let extenso = "";

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
    total = subTotal;

    try {
        const printer = new pdfPrinter(fonts);
        const pertencenteA = await knex("empresa")
            .where({ id: empresa })
            .first();
        const logotipo = await knex("anexo")
            .where({ id: pertencenteA.logotipo })
            .first();
        const moedaPadrao = await knex("moeda")
            .where({ id: pertencenteA.moeda_padrao })
            .first();
        const contaBancaria = await knex("conta_bancaria")
            .where({
                removido: false,
                empresa,
            })
            .limit(3);

        for (let i = 0; i < contaBancaria.length; i++) {
            dadosBancarios.push([
                {
                    text: contaBancaria[i].nome_banco,
                    characterSpacing: 1,
                    fontSize: 6,
                    normal: true,
                    bold: false,
                },
                {
                    text: contaBancaria[i].numero_conta,
                    characterSpacing: 1,
                    fontSize: 6,
                    normal: true,
                    bold: false,
                },
                {
                    text: contaBancaria[i].nib,
                    characterSpacing: 1,
                    fontSize: 6,
                    normal: true,
                    bold: false,
                },
                {
                    text: contaBancaria[i].swift,
                    characterSpacing: 1,
                    fontSize: 6,
                    normal: true,
                    bold: false,
                },
            ]);
        }

        if (dadosBancarios.length == 0) {
            dadosBancarios.push([
                {
                    text: "-",
                    characterSpacing: 1,
                    fontSize: 6,
                    normal: true,
                    bold: false,
                },
                {
                    text: "-",
                    characterSpacing: 1,
                    fontSize: 6,
                    normal: true,
                    bold: false,
                },
                {
                    text: "-",
                    characterSpacing: 1,
                    fontSize: 6,
                    normal: true,
                    bold: false,
                },
                {
                    text: "-",
                    characterSpacing: 1,
                    fontSize: 6,
                    normal: true,
                    bold: false,
                },
            ]);
        }

        try {
            extenso = numeroPorExtenso.porExtenso(
                total,
                numeroPorExtenso.estilo.monetario
            );
            if (extenso.startsWith("um")) {
                extenso = extenso
                    .substr(2)
                    .replaceAll("reais", "meticais")
                    .trim();
            } else {
                extenso = extenso.replaceAll("reais", "meticais");
            }
        } catch (error) {
            console.log(error);
        }

        const data = [];

        for (let i = 0; i < response.length; i++) {
            data.push([
                {
                    text: response[i].data_emissao,
                    border: [true, true, true, true],
                    characterSpacing: 1,
                    fontSize: 7,
                },
                {
                    text: response[i].referencia,
                    border: [true, true, true, true],
                    characterSpacing: 1,
                    fontSize: 7,
                },
                {
                    text: response[i].data_vencimento,
                    border: [true, true, true, true],
                    characterSpacing: 1,
                    fontSize: 7,
                },
                {
                    text: formatCurrency(response[i].total_com_taxa),
                    border: [true, true, true, true],
                    characterSpacing: 1,
                    fontSize: 7,
                },
                {
                    text: formatCurrency(response[i].valor_pago),
                    border: [true, true, true, true],
                    characterSpacing: 1,
                    fontSize: 7,
                },
                {
                    text: formatCurrency(response[i].saldo),
                    border: [true, true, true, true],
                    characterSpacing: 1,
                    fontSize: 7,
                },
            ]);
        }

        const documentData = {
            pageSize: "A4",
            defaultStyle: {
                font: "Courier",
            },
            pageMargins: [40, 35, 40, 80],
            content: [
                {
                    style: "header",
                    alignment: "justify",
                    columns: [
                        {
                            image: path.resolve(
                                `./uploads/anexos/${logotipo.nome_ficheiro}`
                            ),
                            fit: [70, 70],
                        },
                        [
                            {
                                text: "Pendente do Fornecedor",
                                normal: true,
                                bold: false,
                                fontSize: 12,
                                characterSpacing: 1,
                            },
                            {
                                text:
                                    "Data: " +
                                    moment(new Date()).format("DD-MM-yyyy"),
                                normal: true,
                                bold: false,
                                fontSize: 8,
                                characterSpacing: 1,
                            },
                        ],
                    ],
                },
                {
                    columns: [
                        [
                            {
                                text: `\n${pertencenteA.nome}`,
                                normal: false,
                                bold: true,
                                fontSize: 12,
                                characterSpacing: 1,
                            },
                            {
                                text: `\n${
                                    pertencenteA.endereco1
                                        ? pertencenteA.endereco1
                                        : "Endereço: -"
                                }`,
                                normal: true,
                                bold: false,
                                fontSize: 10,
                                characterSpacing: 1,
                            },
                            {
                                text: `Contacto(s): ${
                                    pertencenteA.contacto1
                                        ? pertencenteA.contacto1
                                        : "-"
                                }`,
                                normal: true,
                                bold: false,
                                fontSize: 10,
                                characterSpacing: 1,
                            },
                            {
                                text: `E-mail: ${pertencenteA.email}`,
                                normal: true,
                                bold: false,
                                fontSize: 10,
                                characterSpacing: 1,
                            },
                            {
                                text: `Nuit: ${
                                    pertencenteA.nuit ? pertencenteA.nuit : "-"
                                }`,
                                normal: true,
                                bold: false,
                                fontSize: 10,
                                characterSpacing: 1,
                            },
                        ],
                        [
                            {
                                text: `\n${fornecedor.nome}`,
                                color: "",
                                normal: false,
                                bold: true,
                                fontSize: 12,
                                characterSpacing: 1,
                            },
                            {
                                text: `\n${
                                    fornecedor.endereco
                                        ? fornecedor.endereco
                                        : "Endereço: -"
                                }`,
                                normal: true,
                                bold: false,
                                fontSize: 10,
                                characterSpacing: 1,
                            },
                            {
                                text: `Contacto: ${
                                    fornecedor.contacto1
                                        ? fornecedor.contacto1
                                        : "-"
                                }`,
                                normal: true,
                                bold: false,
                                fontSize: 10,
                                characterSpacing: 1,
                            },
                            {
                                text: `E-mail: ${
                                    fornecedor.email ? fornecedor.email : "-"
                                }`,
                                normal: true,
                                bold: false,
                                fontSize: 10,
                                characterSpacing: 1,
                            },
                            {
                                text: `Nuit: ${
                                    fornecedor.nuit ? fornecedor.nuit : "-"
                                }`,
                                normal: true,
                                bold: false,
                                fontSize: 10,
                                characterSpacing: 1,
                            },
                        ],
                    ],
                },
                { columns: [{ text: "\n" }] },
                {
                    layout: {
                        defaultBorder: false,
                        hLineWidth: function (i, node) {
                            return 1;
                        },
                        vLineWidth: function (i, node) {
                            return 1;
                        },
                        hLineColor: function (i, node) {
                            return "lightgrey";
                        },
                        vLineColor: function (i, node) {
                            return "white";
                        },
                        hLineWidth: function (i, node) {
                            return 0.1;
                        },
                        hLineStyle: function (i, node) {
                            // if (i === 0 || i === node.table.body.length) {
                            return null;
                            //}
                        },
                        // vLineStyle: function (i, node) { return {dash: { length: 10, space: 4 }}; },
                        paddingLeft: function (i, node) {
                            return 5;
                        },
                        paddingRight: function (i, node) {
                            return 5;
                        },
                        paddingTop: function (i, node) {
                            return 3;
                        },
                        paddingBottom: function (i, node) {
                            return 2;
                        },
                        fillColor: function (rowIndex, node, columnIndex) {
                            return "white";
                        },
                        hLineWidth: function (i, node) {
                            return 0.1;
                        },
                    },
                    table: {
                        headerRows: 1,
                        widths: ["*", "*", "*", "*", "*", "*"],
                        body: [
                            [
                                {
                                    text: "Data de emissão",
                                    fillColor: "#6e6e6e",
                                    color: "white",
                                    border: [true, true, true, true],
                                    characterSpacing: 1,
                                    fontSize: 6.5,
                                },
                                {
                                    text: "N. do documento",
                                    fillColor: "#6e6e6e",
                                    color: "white",
                                    border: [true, true, true, true],
                                    characterSpacing: 1,
                                    fontSize: 6.5,
                                },
                                {
                                    text: "D. Expiração",
                                    fillColor: "#6e6e6e",
                                    color: "white",
                                    border: [true, true, true, true],
                                    characterSpacing: 1,
                                    fontSize: 6.5,
                                },
                                {
                                    text: "Preço total",
                                    fillColor: "#6e6e6e",
                                    color: "white",
                                    border: [true, true, true, true],
                                    characterSpacing: 1,
                                    fontSize: 6.5,
                                },
                                {
                                    text: `Valor pago`,
                                    fillColor: "#6e6e6e",
                                    color: "white",
                                    border: [true, true, true, true],
                                    characterSpacing: 1,
                                    fontSize: 6.5,
                                },
                                {
                                    text: `Saldo`,
                                    fillColor: "#6e6e6e",
                                    color: "white",
                                    border: [true, true, true, true],
                                    characterSpacing: 1,
                                    fontSize: 6.5,
                                },
                            ],
                            ...data,
                        ],
                    },
                },
                {
                    layout: {
                        defaultBorder: false,
                        hLineWidth: function (i, node) {
                            return 1;
                        },
                        vLineWidth: function (i, node) {
                            return 1;
                        },
                        hLineColor: function (i, node) {
                            return "white";
                        },
                        vLineColor: function (i, node) {
                            return "white";
                        },
                        hLineStyle: function (i, node) {
                            // if (i === 0 || i === node.table.body.length) {
                            return null;
                            //}
                        },
                        // vLineStyle: function (i, node) { return {dash: { length: 10, space: 4 }}; },
                        paddingLeft: function (i, node) {
                            return 10;
                        },
                        paddingRight: function (i, node) {
                            return 10;
                        },
                        paddingTop: function (i, node) {
                            return 3;
                        },
                        paddingBottom: function (i, node) {
                            return 3;
                        },
                        fillColor: function (rowIndex, node, columnIndex) {
                            return "white";
                        },
                    },
                    table: {
                        headerRows: 1,
                        widths: ["*", 80],
                        body: [
                            [
                                {
                                    text: `Total`,
                                    border: [false, true, false, true],
                                    alignment: "right",
                                    characterSpacing: 1,
                                    fontSize: 8,
                                },
                                {
                                    text:
                                        formatCurrency(total) +
                                        " " +
                                        moedaPadrao.codigo,
                                    border: [true, true, true, true],
                                    alignment: "center",
                                    color: "white",
                                    characterSpacing: 1,
                                    fontSize: 8,
                                    fillColor: "#6e6e6e",
                                },
                            ],
                        ],
                    },
                },
                [
                    {
                        canvas: [
                            {
                                lineColor: "#6e6e6e",
                                type: "line",
                                x1: 0,
                                y1: 0.1,
                                x2: 515,
                                y2: 0.3,
                                lineWidth: 1,
                                lineHeight: 0.1,
                            },
                        ],
                    },
                ],
                [
                    {
                        text: "\nValor por extenso: " + extenso,
                        border: [true, true, true, true],
                        alignment: "left",
                        characterSpacing: 1,
                        fontSize: 8,
                    },
                ],
            ],
            footer: {
                margin: [20, 20, 20, 20],
                layout: {
                    defaultBorder: false,
                    hLineWidth: function (i, node) {
                        return 1;
                    },
                    vLineWidth: function (i, node) {
                        return 1;
                    },
                    hLineColor: function (i, node) {
                        return "white";
                    },
                    vLineColor: function (i, node) {
                        return "white";
                    },
                    hLineStyle: function (i, node) {
                        // if (i === 0 || i === node.table.body.length) {
                        return null;
                        //}
                    },
                    // vLineStyle: function (i, node) { return {dash: { length: 10, space: 4 }}; },
                    paddingLeft: function (i, node) {
                        return 10;
                    },
                    paddingRight: function (i, node) {
                        return 10;
                    },
                    paddingTop: function (i, node) {
                        return 3;
                    },
                    paddingBottom: function (i, node) {
                        return 3;
                    },
                    fillColor: function (rowIndex, node, columnIndex) {
                        return "white";
                    },
                },
                table: {
                    headerRows: 1,
                    widths: ["*", "*", "*", "*"],
                    body: [
                        [
                            {
                                text: "Instituição Bancária",
                                fillColor: "#6e6e6e",
                                color: "white",
                                border: [false, false, false, false],
                                characterSpacing: 1,
                                fontSize: 6,
                                normal: true,
                                bold: false,
                            },
                            {
                                text: "Numero da Conta",
                                fillColor: "#6e6e6e",
                                color: "white",
                                border: [false, false, false, false],
                                characterSpacing: 1,
                                fontSize: 6,
                                normal: true,
                                bold: false,
                            },
                            {
                                text: "NIB",
                                fillColor: "#6e6e6e",
                                color: "white",
                                border: [false, false, false, false],
                                characterSpacing: 1,
                                fontSize: 6,
                                normal: true,
                                bold: false,
                            },
                            {
                                text: "Swift",
                                fillColor: "#6e6e6e",
                                color: "white",
                                border: [false, false, false, false],
                                characterSpacing: 1,
                                fontSize: 6,
                                normal: true,
                                bold: false,
                            },
                        ],
                        ...dadosBancarios,

                        [
                            {
                                text: "Processado por Computador",
                                characterSpacing: 0.8,
                                fontSize: 5,
                                normal: false,
                                bold: true,
                                border: [false, true, false, false],
                            },
                            {
                                text: "",
                                characterSpacing: 1,
                                fontSize: 6,
                                normal: true,
                                bold: false,
                                border: [false, true, false, false],
                            },
                            {
                                text: "Licenciado a: ",
                                characterSpacing: 1,
                                fontSize: 6,
                                normal: true,
                                bold: false,
                                border: [false, true, false, false],
                                alignment: "right",
                            },
                            {
                                text: pertencenteA.nome,
                                characterSpacing: 0.8,
                                fontSize: 6,
                                normal: false,
                                bold: true,
                                border: [false, true, false, false],
                            },
                        ],
                    ],
                },
            },
        };

        const pdfDoc = printer.createPdfKitDocument(documentData);
        let chunks = [];
        pdfDoc.on("data", (chunk) => {
            chunks.push(chunk);
        });
        pdfDoc.on("end", () => {
            const result = Buffer.concat(chunks);
            res.setHeader("Content-Type", "Application/pdf");
            res.setHeader(
                "content-disposition",
                "attachment; filename=export.pdf"
            );
            res.send(result);
        });
        pdfDoc.end();
    } catch (error) {
        return handleResponse(req, res, 500, error);
    }
};

export const getExtratoFornecedorById = async (req, res) => {
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
    let extenso = "";
    const dadosBancarios = [];

    const fornecedor = await knex("fornecedor").where({ id, empresa }).first();

    if (!fornecedor) {
        const message = "Fornecedor não encontrado.";
        return handleResponse(req, res, 404, [], message);
    }

    const fornecedorExtratos = await knex("extrato_fornecedor").where({
        fornecedor: id,
    });

    for (let i = 0; i < fornecedorExtratos.length; i++) {
        fornecedorExtratos[i].valor_pago = formatCurrency(
            fornecedorExtratos[i].valor_pago
        );

        response.push([
            {
                text: fornecedorExtratos[i].data_emissao,
                border: [true, true, true, true],
                characterSpacing: 1,
                fontSize: 7,
            },
            {
                text: fornecedorExtratos[i].referencia,
                border: [true, true, true, true],
                characterSpacing: 1,
                fontSize: 7,
            },
            {
                text: formatCurrency(fornecedorExtratos[i].debito),
                border: [true, true, true, true],
                characterSpacing: 1,
                fontSize: 7,
                alignment: "right",
            },
            {
                text: formatCurrency(fornecedorExtratos[i].credito),
                border: [true, true, true, true],
                characterSpacing: 1,
                fontSize: 7,
                alignment: "right",
            },
            {
                text: formatCurrency(
                    debito -
                        credito +
                        fornecedorExtratos[i].debito -
                        fornecedorExtratos[i].credito
                ),
                border: [true, true, true, true],
                characterSpacing: 1,
                fontSize: 7,
                alignment: "right",
            },
        ]);

        credito += Number(fornecedorExtratos[i].credito);
        debito += Number(fornecedorExtratos[i].debito);
    }

    total = debito - credito;

    try {
        const printer = new pdfPrinter(fonts);
        const pertencenteA = await knex("empresa")
            .where({ id: empresa })
            .first();
        const logotipo = await knex("anexo")
            .where({ id: pertencenteA.logotipo })
            .first();
        const moedaPadrao = await knex("moeda")
            .where({ id: pertencenteA.moeda_padrao })
            .first();
        const contaBancaria = await knex("conta_bancaria")
            .where({
                removido: false,
                empresa,
            })
            .limit(3);

        for (let i = 0; i < contaBancaria.length; i++) {
            dadosBancarios.push([
                {
                    text: contaBancaria[i].nome_banco,
                    characterSpacing: 1,
                    fontSize: 6,
                    normal: true,
                    bold: false,
                },
                {
                    text: contaBancaria[i].numero_conta,
                    characterSpacing: 1,
                    fontSize: 6,
                    normal: true,
                    bold: false,
                },
                {
                    text: contaBancaria[i].nib,
                    characterSpacing: 1,
                    fontSize: 6,
                    normal: true,
                    bold: false,
                },
                {
                    text: contaBancaria[i].swift,
                    characterSpacing: 1,
                    fontSize: 6,
                    normal: true,
                    bold: false,
                },
            ]);
        }

        if (dadosBancarios.length == 0) {
            dadosBancarios.push([
                {
                    text: "-",
                    characterSpacing: 1,
                    fontSize: 6,
                    normal: true,
                    bold: false,
                },
                {
                    text: "-",
                    characterSpacing: 1,
                    fontSize: 6,
                    normal: true,
                    bold: false,
                },
                {
                    text: "-",
                    characterSpacing: 1,
                    fontSize: 6,
                    normal: true,
                    bold: false,
                },
                {
                    text: "-",
                    characterSpacing: 1,
                    fontSize: 6,
                    normal: true,
                    bold: false,
                },
            ]);
        }

        try {
            extenso = numeroPorExtenso.porExtenso(
                total,
                numeroPorExtenso.estilo.monetario
            );
            if (extenso.startsWith("um")) {
                extenso = extenso
                    .substr(2)
                    .replaceAll("reais", "meticais")
                    .trim();
            } else {
                extenso = extenso.replaceAll("reais", "meticais");
            }
        } catch (error) {
            console.log(error);
        }

        const documentData = {
            pageSize: "A4",
            defaultStyle: {
                font: "Courier",
            },
            pageMargins: [40, 35, 40, 80],
            content: [
                {
                    style: "header",
                    alignment: "justify",
                    columns: [
                        {
                            image: path.resolve(
                                `./uploads/anexos/${logotipo.nome_ficheiro}`
                            ),
                            fit: [70, 70],
                        },
                        [
                            {
                                text: "Extrato do Fornecedor",
                                normal: true,
                                bold: false,
                                fontSize: 12,
                                characterSpacing: 1,
                            },
                            {
                                text:
                                    "Data: " +
                                    moment(new Date()).format("DD-MM-yyyy"),
                                normal: true,
                                bold: false,
                                fontSize: 8,
                                characterSpacing: 1,
                            },
                        ],
                    ],
                },
                {
                    columns: [
                        [
                            {
                                text: `\n${pertencenteA.nome}`,
                                normal: false,
                                bold: true,
                                fontSize: 12,
                                characterSpacing: 1,
                            },
                            {
                                text: `\n${
                                    pertencenteA.endereco1
                                        ? pertencenteA.endereco1
                                        : "Endereço: -"
                                }`,
                                normal: true,
                                bold: false,
                                fontSize: 10,
                                characterSpacing: 1,
                            },
                            {
                                text: `Contacto(s): ${
                                    pertencenteA.contacto1
                                        ? pertencenteA.contacto1
                                        : "-"
                                }`,
                                normal: true,
                                bold: false,
                                fontSize: 10,
                                characterSpacing: 1,
                            },
                            {
                                text: `E-mail: ${pertencenteA.email}`,
                                normal: true,
                                bold: false,
                                fontSize: 10,
                                characterSpacing: 1,
                            },
                            {
                                text: `Nuit: ${
                                    pertencenteA.nuit ? pertencenteA.nuit : "-"
                                }`,
                                normal: true,
                                bold: false,
                                fontSize: 10,
                                characterSpacing: 1,
                            },
                        ],
                        [
                            {
                                text: `\n${fornecedor.nome}`,
                                color: "",
                                normal: false,
                                bold: true,
                                fontSize: 12,
                                characterSpacing: 1,
                            },
                            {
                                text: `\n${
                                    fornecedor.endereco
                                        ? fornecedor.endereco
                                        : "Endereço: -"
                                }`,
                                normal: true,
                                bold: false,
                                fontSize: 10,
                                characterSpacing: 1,
                            },
                            {
                                text: `Contacto: ${
                                    fornecedor.contacto1
                                        ? fornecedor.contacto1
                                        : "-"
                                }`,
                                normal: true,
                                bold: false,
                                fontSize: 10,
                                characterSpacing: 1,
                            },
                            {
                                text: `E-mail: ${
                                    fornecedor.email ? fornecedor.email : "-"
                                }`,
                                normal: true,
                                bold: false,
                                fontSize: 10,
                                characterSpacing: 1,
                            },
                            {
                                text: `Nuit: ${
                                    fornecedor.nuit ? fornecedor.nuit : "-"
                                }`,
                                normal: true,
                                bold: false,
                                fontSize: 10,
                                characterSpacing: 1,
                            },
                        ],
                    ],
                },
                { columns: [{ text: "\n" }] },
                {
                    layout: {
                        defaultBorder: false,
                        hLineWidth: function (i, node) {
                            return 1;
                        },
                        vLineWidth: function (i, node) {
                            return 1;
                        },
                        hLineColor: function (i, node) {
                            return "lightgrey";
                        },
                        vLineColor: function (i, node) {
                            return "white";
                        },
                        hLineWidth: function (i, node) {
                            return 0.1;
                        },
                        hLineStyle: function (i, node) {
                            // if (i === 0 || i === node.table.body.length) {
                            return null;
                            //}
                        },
                        // vLineStyle: function (i, node) { return {dash: { length: 10, space: 4 }}; },
                        paddingLeft: function (i, node) {
                            return 5;
                        },
                        paddingRight: function (i, node) {
                            return 5;
                        },
                        paddingTop: function (i, node) {
                            return 3;
                        },
                        paddingBottom: function (i, node) {
                            return 2;
                        },
                        fillColor: function (rowIndex, node, columnIndex) {
                            return "white";
                        },
                        hLineWidth: function (i, node) {
                            return 0.1;
                        },
                    },
                    table: {
                        headerRows: 1,
                        widths: ["*", "*", "*", "*", "*"],
                        body: [
                            [
                                {
                                    text: "Data de emissão",
                                    fillColor: "#6e6e6e",
                                    color: "white",
                                    border: [true, true, true, true],
                                    characterSpacing: 1,
                                    fontSize: 6.5,
                                },
                                {
                                    text: "N. do documento",
                                    fillColor: "#6e6e6e",
                                    color: "white",
                                    border: [true, true, true, true],
                                    characterSpacing: 1,
                                    fontSize: 6.5,
                                },
                                {
                                    text: "Débito",
                                    fillColor: "#6e6e6e",
                                    color: "white",
                                    border: [true, true, true, true],
                                    characterSpacing: 1,
                                    fontSize: 6.5,
                                },
                                {
                                    text: "Crédito",
                                    fillColor: "#6e6e6e",
                                    color: "white",
                                    border: [true, true, true, true],
                                    characterSpacing: 1,
                                    fontSize: 6.5,
                                },
                                {
                                    text: `Saldo`,
                                    fillColor: "#6e6e6e",
                                    color: "white",
                                    border: [true, true, true, true],
                                    characterSpacing: 1,
                                    fontSize: 6.5,
                                },
                            ],
                            ...response,
                            [
                                {
                                    text: "",
                                    border: [true, true, true, true],
                                    characterSpacing: 1,
                                    fontSize: 6.5,
                                },
                                {
                                    text: "Total:",
                                    border: [true, true, true, true],
                                    characterSpacing: 1,
                                    fontSize: 7,
                                    bold: true,
                                    fillColor: "#28c76f",
                                    color: "black",
                                },
                                {
                                    text:
                                        formatCurrency(debito) +
                                        " " +
                                        moedaPadrao.codigo,
                                    border: [true, true, true, true],
                                    characterSpacing: 1,
                                    fontSize: 7,
                                    fillColor: "#28c76f",
                                    color: "black",
                                    alignment: "right",
                                },
                                {
                                    text:
                                        formatCurrency(credito) +
                                        " " +
                                        moedaPadrao.codigo,
                                    border: [true, true, true, true],
                                    characterSpacing: 1,
                                    fontSize: 7,
                                    fillColor: "#28c76f",
                                    color: "black",
                                    alignment: "right",
                                },
                                {
                                    text:
                                        formatCurrency(total) +
                                        " " +
                                        moedaPadrao.codigo,
                                    border: [true, true, true, true],
                                    characterSpacing: 1,
                                    fontSize: 7,
                                    fillColor: "#28c76f",
                                    color: "black",
                                    alignment: "right",
                                },
                            ],
                        ],
                    },
                },
                [
                    {
                        canvas: [
                            {
                                lineColor: "#6e6e6e",
                                type: "line",
                                x1: 0,
                                y1: 0.1,
                                x2: 515,
                                y2: 0.3,
                                lineWidth: 1,
                                lineHeight: 0.1,
                            },
                        ],
                    },
                ],
                [
                    {
                        text: "\nValor por extenso: " + extenso,
                        border: [true, true, true, true],
                        alignment: "left",
                        characterSpacing: 1,
                        fontSize: 8,
                    },
                ],
            ],
            footer: {
                margin: [20, 20, 20, 20],
                layout: {
                    defaultBorder: false,
                    hLineWidth: function (i, node) {
                        return 1;
                    },
                    vLineWidth: function (i, node) {
                        return 1;
                    },
                    hLineColor: function (i, node) {
                        return "white";
                    },
                    vLineColor: function (i, node) {
                        return "white";
                    },
                    hLineStyle: function (i, node) {
                        // if (i === 0 || i === node.table.body.length) {
                        return null;
                        //}
                    },
                    // vLineStyle: function (i, node) { return {dash: { length: 10, space: 4 }}; },
                    paddingLeft: function (i, node) {
                        return 10;
                    },
                    paddingRight: function (i, node) {
                        return 10;
                    },
                    paddingTop: function (i, node) {
                        return 3;
                    },
                    paddingBottom: function (i, node) {
                        return 3;
                    },
                    fillColor: function (rowIndex, node, columnIndex) {
                        return "white";
                    },
                },
                table: {
                    headerRows: 1,
                    widths: ["*", "*", "*", "*"],
                    body: [
                        [
                            {
                                text: "Instituição Bancária",
                                fillColor: "#6e6e6e",
                                color: "white",
                                border: [false, false, false, false],
                                characterSpacing: 1,
                                fontSize: 6,
                                normal: true,
                                bold: false,
                            },
                            {
                                text: "Numero da Conta",
                                fillColor: "#6e6e6e",
                                color: "white",
                                border: [false, false, false, false],
                                characterSpacing: 1,
                                fontSize: 6,
                                normal: true,
                                bold: false,
                            },
                            {
                                text: "NIB",
                                fillColor: "#6e6e6e",
                                color: "white",
                                border: [false, false, false, false],
                                characterSpacing: 1,
                                fontSize: 6,
                                normal: true,
                                bold: false,
                            },
                            {
                                text: "Swift",
                                fillColor: "#6e6e6e",
                                color: "white",
                                border: [false, false, false, false],
                                characterSpacing: 1,
                                fontSize: 6,
                                normal: true,
                                bold: false,
                            },
                        ],
                        ...dadosBancarios,
                        [
                            {
                                text: "Processado por Computador",
                                characterSpacing: 0.8,
                                fontSize: 5,
                                normal: false,
                                bold: true,
                                border: [false, true, false, false],
                            },
                            {
                                text: "",
                                characterSpacing: 1,
                                fontSize: 6,
                                normal: true,
                                bold: false,
                                border: [false, true, false, false],
                            },
                            {
                                text: "Licenciado a: ",
                                characterSpacing: 1,
                                fontSize: 6,
                                normal: true,
                                bold: false,
                                border: [false, true, false, false],
                                alignment: "right",
                            },
                            {
                                text: pertencenteA.nome,
                                characterSpacing: 0.8,
                                fontSize: 6,
                                normal: false,
                                bold: true,
                                border: [false, true, false, false],
                            },
                        ],
                    ],
                },
            },
        };

        const pdfDoc = printer.createPdfKitDocument(documentData);
        let chunks = [];
        pdfDoc.on("data", (chunk) => {
            chunks.push(chunk);
        });
        pdfDoc.on("end", () => {
            const result = Buffer.concat(chunks);
            res.setHeader("Content-Type", "Application/pdf");
            res.setHeader(
                "content-disposition",
                "attachment; filename=export.pdf"
            );
            res.send(result);
        });
        pdfDoc.end();
    } catch (error) {
        return handleResponse(req, res, 500, error);
    }
};

export const getRelatorioDespesas = async (req, res) => {
    const { userId } = req.user;

    if (
        !(await userCanAccess(
            "Relatório de despesas",
            "Imprimir relatório",
            userId
        ))
    ) {
        const message = "Sem permissão para imprimir o relatório de despesas.";
        return handleResponse(req, res, 403, [], message);
    }
    const { empresa } = req.user;
    const { ano = new Date().getFullYear() } = req.params;
    const response = [];
    const dadosBancarios = [];

    let total = 0;
    let extenso = "";

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

    const despensas = await knex("relatorio_despesa")
        .where({ empresa })
        .whereRaw("YEAR(data) = ?", [ano]);

    for (let i = 0; i < despensas.length; i++) {
        const index = response.findIndex((item) => item.id == despensas[i].id);

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

    try {
        const printer = new pdfPrinter(fonts);
        const pertencenteA = await knex("empresa")
            .where({ id: empresa })
            .first();
        const logotipo = await knex("anexo")
            .where({ id: pertencenteA.logotipo })
            .first();
        const moedaPadrao = await knex("moeda")
            .where({ id: pertencenteA.moeda_padrao })
            .first();
        const contaBancaria = await knex("conta_bancaria")
            .where({
                removido: false,
                empresa,
            })
            .limit(3);

        for (let i = 0; i < contaBancaria.length; i++) {
            dadosBancarios.push([
                {
                    text: contaBancaria[i].nome_banco,
                    characterSpacing: 1,
                    fontSize: 6,
                    normal: true,
                    bold: false,
                },
                {
                    text: contaBancaria[i].numero_conta,
                    characterSpacing: 1,
                    fontSize: 6,
                    normal: true,
                    bold: false,
                },
                {
                    text: contaBancaria[i].nib,
                    characterSpacing: 1,
                    fontSize: 6,
                    normal: true,
                    bold: false,
                },
                {
                    text: contaBancaria[i].swift,
                    characterSpacing: 1,
                    fontSize: 6,
                    normal: true,
                    bold: false,
                },
            ]);
        }

        if (dadosBancarios.length == 0) {
            dadosBancarios.push([
                {
                    text: "-",
                    characterSpacing: 1,
                    fontSize: 6,
                    normal: true,
                    bold: false,
                },
                {
                    text: "-",
                    characterSpacing: 1,
                    fontSize: 6,
                    normal: true,
                    bold: false,
                },
                {
                    text: "-",
                    characterSpacing: 1,
                    fontSize: 6,
                    normal: true,
                    bold: false,
                },
                {
                    text: "-",
                    characterSpacing: 1,
                    fontSize: 6,
                    normal: true,
                    bold: false,
                },
            ]);
        }

        try {
            extenso = numeroPorExtenso.porExtenso(
                total,
                numeroPorExtenso.estilo.monetario
            );
            if (extenso.startsWith("um")) {
                extenso = extenso
                    .substr(2)
                    .replaceAll("reais", "meticais")
                    .trim();
            } else {
                extenso = extenso.replaceAll("reais", "meticais");
            }
        } catch (error) {
            console.log(error);
        }

        const data = [];

        for (let i = 0; i < response.length; i++) {
            data.push([
                {
                    text: response[i].nome,
                    border: [true, true, true, true],
                    characterSpacing: 1,
                    fontSize: 6.5,
                },
                {
                    text: response[i].jan,
                    border: [true, true, true, true],
                    characterSpacing: 1,
                    fontSize: 6.5,
                },
                {
                    text: response[i].fev,
                    border: [true, true, true, true],
                    characterSpacing: 1,
                    fontSize: 6.5,
                },
                {
                    text: response[i].marc,
                    border: [true, true, true, true],
                    characterSpacing: 1,
                    fontSize: 6.5,
                },
                {
                    text: response[i].abr,
                    border: [true, true, true, true],
                    characterSpacing: 1,
                    fontSize: 6.5,
                },
                {
                    text: response[i].mai,
                    border: [true, true, true, true],
                    characterSpacing: 1,
                    fontSize: 6.5,
                },
                {
                    text: response[i].jun,
                    border: [true, true, true, true],
                    characterSpacing: 1,
                    fontSize: 6.5,
                },
                {
                    text: response[i].jul,
                    border: [true, true, true, true],
                    characterSpacing: 1,
                    fontSize: 6.5,
                },
                {
                    text: response[i].ago,
                    border: [true, true, true, true],
                    characterSpacing: 1,
                    fontSize: 6.5,
                },
                {
                    text: response[i].sep,
                    border: [true, true, true, true],
                    characterSpacing: 1,
                    fontSize: 6.5,
                },
                {
                    text: response[i].oct,
                    border: [true, true, true, true],
                    characterSpacing: 1,
                    fontSize: 6.5,
                },
                {
                    text: response[i].nov,
                    border: [true, true, true, true],
                    characterSpacing: 1,
                    fontSize: 6.5,
                },
                {
                    text: response[i].dez,
                    border: [true, true, true, true],
                    characterSpacing: 1,
                    fontSize: 6.5,
                },
            ]);
        }

        const documentData = {
            pageSize: "A3",
            defaultStyle: {
                font: "Courier",
            },
            pageMargins: [40, 35, 40, 80],
            content: [
                {
                    style: "header",
                    alignment: "justify",
                    columns: [
                        {
                            image: path.resolve(
                                `./uploads/anexos/${logotipo.nome_ficheiro}`
                            ),
                            fit: [70, 70],
                        },
                        [
                            {
                                text: "Relatório de Despesas #" + ano,
                                normal: true,
                                bold: false,
                                fontSize: 12,
                                characterSpacing: 1,
                            },
                            {
                                text:
                                    "Data: " +
                                    moment(new Date()).format("DD-MM-yyyy"),
                                normal: true,
                                bold: false,
                                fontSize: 8,
                                characterSpacing: 1,
                            },
                        ],
                    ],
                },
                {
                    columns: [
                        [
                            {
                                text: `\n${pertencenteA.nome}`,
                                normal: false,
                                bold: true,
                                fontSize: 12,
                                characterSpacing: 1,
                            },
                            {
                                text: `\n${
                                    pertencenteA.endereco1
                                        ? pertencenteA.endereco1
                                        : "Endereço: -"
                                }`,
                                normal: true,
                                bold: false,
                                fontSize: 10,
                                characterSpacing: 1,
                            },
                            {
                                text: `Contacto(s): ${
                                    pertencenteA.contacto1
                                        ? pertencenteA.contacto1
                                        : "-"
                                }`,
                                normal: true,
                                bold: false,
                                fontSize: 10,
                                characterSpacing: 1,
                            },
                            {
                                text: `E-mail: ${pertencenteA.email}`,
                                normal: true,
                                bold: false,
                                fontSize: 10,
                                characterSpacing: 1,
                            },
                            {
                                text: `Nuit: ${
                                    pertencenteA.nuit ? pertencenteA.nuit : "-"
                                }`,
                                normal: true,
                                bold: false,
                                fontSize: 10,
                                characterSpacing: 1,
                            },
                        ],
                    ],
                },
                { columns: [{ text: "\n" }] },
                {
                    layout: {
                        defaultBorder: false,
                        hLineWidth: function (i, node) {
                            return 1;
                        },
                        vLineWidth: function (i, node) {
                            return 1;
                        },
                        hLineColor: function (i, node) {
                            return "lightgrey";
                        },
                        vLineColor: function (i, node) {
                            return "white";
                        },
                        hLineWidth: function (i, node) {
                            return 0.1;
                        },
                        hLineStyle: function (i, node) {
                            // if (i === 0 || i === node.table.body.length) {
                            return null;
                            //}
                        },
                        // vLineStyle: function (i, node) { return {dash: { length: 10, space: 4 }}; },
                        paddingLeft: function (i, node) {
                            return 5;
                        },
                        paddingRight: function (i, node) {
                            return 5;
                        },
                        paddingTop: function (i, node) {
                            return 3;
                        },
                        paddingBottom: function (i, node) {
                            return 2;
                        },
                        fillColor: function (rowIndex, node, columnIndex) {
                            return "white";
                        },
                        hLineWidth: function (i, node) {
                            return 0.1;
                        },
                    },
                    table: {
                        headerRows: 1,
                        widths: [
                            "*",
                            40,
                            40,
                            40,
                            40,
                            40,
                            40,
                            40,
                            40,
                            40,
                            40,
                            40,
                            40,
                        ],
                        body: [
                            [
                                {
                                    text: "Categoria",
                                    fillColor: "#6e6e6e",
                                    color: "white",
                                    border: [true, true, true, true],
                                    characterSpacing: 1,
                                    fontSize: 6.5,
                                },
                                {
                                    text: "Jan.",
                                    fillColor: "#6e6e6e",
                                    color: "white",
                                    border: [true, true, true, true],
                                    characterSpacing: 1,
                                    fontSize: 6.5,
                                },
                                {
                                    text: "Fev.",
                                    fillColor: "#6e6e6e",
                                    color: "white",
                                    border: [true, true, true, true],
                                    characterSpacing: 1,
                                    fontSize: 6.5,
                                },
                                {
                                    text: "Marc.",
                                    fillColor: "#6e6e6e",
                                    color: "white",
                                    border: [true, true, true, true],
                                    characterSpacing: 1,
                                    fontSize: 6.5,
                                },
                                {
                                    text: `Abr.`,
                                    fillColor: "#6e6e6e",
                                    color: "white",
                                    border: [true, true, true, true],
                                    characterSpacing: 1,
                                    fontSize: 6.5,
                                },
                                {
                                    text: `Mai.`,
                                    fillColor: "#6e6e6e",
                                    color: "white",
                                    border: [true, true, true, true],
                                    characterSpacing: 1,
                                    fontSize: 6.5,
                                },
                                {
                                    text: `Jun.`,
                                    fillColor: "#6e6e6e",
                                    color: "white",
                                    border: [true, true, true, true],
                                    characterSpacing: 1,
                                    fontSize: 6.5,
                                },
                                {
                                    text: `Jul.`,
                                    fillColor: "#6e6e6e",
                                    color: "white",
                                    border: [true, true, true, true],
                                    characterSpacing: 1,
                                    fontSize: 6.5,
                                },
                                {
                                    text: `Ago.`,
                                    fillColor: "#6e6e6e",
                                    color: "white",
                                    border: [true, true, true, true],
                                    characterSpacing: 1,
                                    fontSize: 6.5,
                                },
                                {
                                    text: `Set.`,
                                    fillColor: "#6e6e6e",
                                    color: "white",
                                    border: [true, true, true, true],
                                    characterSpacing: 1,
                                    fontSize: 6.5,
                                },
                                {
                                    text: `Oct.`,
                                    fillColor: "#6e6e6e",
                                    color: "white",
                                    border: [true, true, true, true],
                                    characterSpacing: 1,
                                    fontSize: 6.5,
                                },
                                {
                                    text: `Nov.`,
                                    fillColor: "#6e6e6e",
                                    color: "white",
                                    border: [true, true, true, true],
                                    characterSpacing: 1,
                                    fontSize: 6.5,
                                },
                                {
                                    text: `Dez.`,
                                    fillColor: "#6e6e6e",
                                    color: "white",
                                    border: [true, true, true, true],
                                    characterSpacing: 1,
                                    fontSize: 6.5,
                                },
                            ],
                            ...data,
                            [
                                {
                                    text: "Sub Total:",
                                    fillColor: "#28c76f",
                                    color: "black",
                                    border: [true, true, true, true],
                                    characterSpacing: 1,
                                    fontSize: 6.5,
                                    bold: true,
                                },
                                {
                                    text: jan,
                                    fillColor: "#28c76f",
                                    color: "black",
                                    border: [true, true, true, true],
                                    characterSpacing: 1,
                                    fontSize: 6.5,
                                },
                                {
                                    text: fev,
                                    fillColor: "#28c76f",
                                    color: "black",
                                    border: [true, true, true, true],
                                    characterSpacing: 1,
                                    fontSize: 6.5,
                                },
                                {
                                    text: marc,
                                    fillColor: "#28c76f",
                                    color: "black",
                                    border: [true, true, true, true],
                                    characterSpacing: 1,
                                    fontSize: 6.5,
                                },
                                {
                                    text: abr,
                                    fillColor: "#28c76f",
                                    color: "black",
                                    border: [true, true, true, true],
                                    characterSpacing: 1,
                                    fontSize: 6.5,
                                },
                                {
                                    text: mai,
                                    fillColor: "#28c76f",
                                    color: "black",
                                    border: [true, true, true, true],
                                    characterSpacing: 1,
                                    fontSize: 6.5,
                                },
                                {
                                    text: jun,
                                    fillColor: "#28c76f",
                                    color: "black",
                                    border: [true, true, true, true],
                                    characterSpacing: 1,
                                    fontSize: 6.5,
                                },
                                {
                                    text: jul,
                                    fillColor: "#28c76f",
                                    color: "black",
                                    border: [true, true, true, true],
                                    characterSpacing: 1,
                                    fontSize: 6.5,
                                },
                                {
                                    text: ago,
                                    fillColor: "#28c76f",
                                    color: "black",
                                    border: [true, true, true, true],
                                    characterSpacing: 1,
                                    fontSize: 6.5,
                                },
                                {
                                    text: sep,
                                    fillColor: "#28c76f",
                                    color: "black",
                                    border: [true, true, true, true],
                                    characterSpacing: 1,
                                    fontSize: 6.5,
                                },
                                {
                                    text: oct,
                                    fillColor: "#28c76f",
                                    color: "black",
                                    border: [true, true, true, true],
                                    characterSpacing: 1,
                                    fontSize: 6.5,
                                },
                                {
                                    text: nov,
                                    fillColor: "#28c76f",
                                    color: "black",
                                    border: [true, true, true, true],
                                    characterSpacing: 1,
                                    fontSize: 6.5,
                                },
                                {
                                    text: dez,
                                    fillColor: "#28c76f",
                                    color: "black",
                                    border: [true, true, true, true],
                                    characterSpacing: 1,
                                    fontSize: 6.5,
                                },
                            ],
                        ],
                    },
                },
                {
                    layout: {
                        defaultBorder: false,
                        hLineWidth: function (i, node) {
                            return 1;
                        },
                        vLineWidth: function (i, node) {
                            return 1;
                        },
                        hLineColor: function (i, node) {
                            return "white";
                        },
                        vLineColor: function (i, node) {
                            return "white";
                        },
                        hLineStyle: function (i, node) {
                            // if (i === 0 || i === node.table.body.length) {
                            return null;
                            //}
                        },
                        // vLineStyle: function (i, node) { return {dash: { length: 10, space: 4 }}; },
                        paddingLeft: function (i, node) {
                            return 10;
                        },
                        paddingRight: function (i, node) {
                            return 10;
                        },
                        paddingTop: function (i, node) {
                            return 3;
                        },
                        paddingBottom: function (i, node) {
                            return 3;
                        },
                        fillColor: function (rowIndex, node, columnIndex) {
                            return "white";
                        },
                    },
                    table: {
                        headerRows: 1,
                        widths: ["*", 80],
                        body: [
                            [
                                {
                                    text: `Total`,
                                    border: [false, true, false, true],
                                    alignment: "right",
                                    characterSpacing: 1,
                                    fontSize: 8,
                                },
                                {
                                    text: total.toFixed(2),
                                    border: [true, true, true, true],
                                    alignment: "center",
                                    color: "white",
                                    characterSpacing: 1,
                                    fontSize: 8,
                                    fillColor: "#6e6e6e",
                                },
                            ],
                        ],
                    },
                },
                [
                    {
                        canvas: [
                            {
                                lineColor: "#6e6e6e",
                                type: "line",
                                x1: 0,
                                y1: 0.1,
                                x2: 515,
                                y2: 0.3,
                                lineWidth: 1,
                                lineHeight: 0.1,
                            },
                        ],
                    },
                ],
                [
                    {
                        text: "\nValor por extenso: " + extenso,
                        border: [true, true, true, true],
                        alignment: "left",
                        characterSpacing: 1,
                        fontSize: 8,
                    },
                ],
            ],
            footer: {
                margin: [20, 20, 20, 20],
                layout: {
                    defaultBorder: false,
                    hLineWidth: function (i, node) {
                        return 1;
                    },
                    vLineWidth: function (i, node) {
                        return 1;
                    },
                    hLineColor: function (i, node) {
                        return "white";
                    },
                    vLineColor: function (i, node) {
                        return "white";
                    },
                    hLineStyle: function (i, node) {
                        // if (i === 0 || i === node.table.body.length) {
                        return null;
                        //}
                    },
                    // vLineStyle: function (i, node) { return {dash: { length: 10, space: 4 }}; },
                    paddingLeft: function (i, node) {
                        return 10;
                    },
                    paddingRight: function (i, node) {
                        return 10;
                    },
                    paddingTop: function (i, node) {
                        return 3;
                    },
                    paddingBottom: function (i, node) {
                        return 3;
                    },
                    fillColor: function (rowIndex, node, columnIndex) {
                        return "white";
                    },
                },
                table: {
                    headerRows: 1,
                    widths: ["*", "*", "*", "*"],
                    body: [
                        [
                            {
                                text: "Instituição Bancária",
                                fillColor: "#6e6e6e",
                                color: "white",
                                border: [false, false, false, false],
                                characterSpacing: 1,
                                fontSize: 6,
                                normal: true,
                                bold: false,
                            },
                            {
                                text: "Numero da Conta",
                                fillColor: "#6e6e6e",
                                color: "white",
                                border: [false, false, false, false],
                                characterSpacing: 1,
                                fontSize: 6,
                                normal: true,
                                bold: false,
                            },
                            {
                                text: "NIB",
                                fillColor: "#6e6e6e",
                                color: "white",
                                border: [false, false, false, false],
                                characterSpacing: 1,
                                fontSize: 6,
                                normal: true,
                                bold: false,
                            },
                            {
                                text: "Swift",
                                fillColor: "#6e6e6e",
                                color: "white",
                                border: [false, false, false, false],
                                characterSpacing: 1,
                                fontSize: 6,
                                normal: true,
                                bold: false,
                            },
                        ],
                        ...dadosBancarios,

                        [
                            {
                                text: "Processado por Computador",
                                characterSpacing: 0.8,
                                fontSize: 5,
                                normal: false,
                                bold: true,
                                border: [false, true, false, false],
                            },
                            {
                                text: "",
                                characterSpacing: 1,
                                fontSize: 6,
                                normal: true,
                                bold: false,
                                border: [false, true, false, false],
                            },
                            {
                                text: "Licenciado a: ",
                                characterSpacing: 1,
                                fontSize: 6,
                                normal: true,
                                bold: false,
                                border: [false, true, false, false],
                                alignment: "right",
                            },
                            {
                                text: pertencenteA.nome,
                                characterSpacing: 0.8,
                                fontSize: 6,
                                normal: false,
                                bold: true,
                                border: [false, true, false, false],
                            },
                        ],
                    ],
                },
            },
        };

        const pdfDoc = printer.createPdfKitDocument(documentData);
        let chunks = [];
        pdfDoc.on("data", (chunk) => {
            chunks.push(chunk);
        });
        pdfDoc.on("end", () => {
            const result = Buffer.concat(chunks);
            res.setHeader("Content-Type", "Application/pdf");
            res.setHeader(
                "content-disposition",
                "attachment; filename=export.pdf"
            );
            res.send(result);
        });
        pdfDoc.end();
    } catch (error) {
        return handleResponse(req, res, 500, error);
    }
};

export const getMovimentoStock = async (req, res) => {
    const { empresa } = req.user;
    const { movimentos = [], entradas = 0, saidas = 0, saldo = 0 } = req.body;
    const { id } = req.params;

    try {
        const printer = new pdfPrinter(fonts);
        const pertencenteA = await knex("empresa")
            .where({ id: empresa })
            .first();
        const logotipo = await knex("anexo")
            .where({ id: pertencenteA.logotipo })
            .first();
        const stock = await knex("stock").where({ id }).first();
        const stockConfig = await knex("stock_configuracao")
            .where({ empresa })
            .first();
        let prefixo = "";
        const data = [];

        if (stockConfig) {
            prefixo = stockConfig.prefixo ? stockConfig.prefixo : "";
        }
        if (!stock) {
            const message = "Stock não encontrado.";
            return handleResponse(req, res, 404, [], message);
        }

        for (let i = 0; i < movimentos.length; i++) {
            data.push([
                {
                    text: movimentos[i].data_emissao,
                    border: [true, true, true, true],
                    characterSpacing: 1,
                    fontSize: 6.5,
                },
                {
                    text: movimentos[i].documento_nome,
                    border: [true, true, true, true],
                    characterSpacing: 1,
                    fontSize: 6.5,
                },
                {
                    text: movimentos[i].referencia,
                    border: [true, true, true, true],
                    characterSpacing: 1,
                    fontSize: 6.5,
                },
                {
                    text:
                        movimentos[i].entrada == 0
                            ? "-"
                            : movimentos[i].entrada,
                    border: [true, true, true, true],
                    characterSpacing: 1,
                    fontSize: 6.5,
                    alignment: "right",
                },
                {
                    text: movimentos[i].saida == 0 ? "-" : movimentos[i].saida,
                    border: [true, true, true, true],
                    characterSpacing: 1,
                    fontSize: 6.5,
                    alignment: "right",
                },
                {
                    text: movimentos[i].saldo,
                    border: [true, true, true, true],
                    characterSpacing: 1,
                    fontSize: 6.5,
                    alignment: "right",
                },
                {
                    text: movimentos[i].stock_designacao,
                    border: [true, true, true, true],
                    characterSpacing: 1,
                    fontSize: 6.5,
                },
                {
                    text: movimentos[i].armazem_entrada_nome
                        ? movimentos[i].armazem_entrada_nome
                        : movimentos[i].armazem_saida_nome,
                    border: [true, true, true, true],
                    characterSpacing: 1,
                    fontSize: 6.5,
                },
            ]);
        }

        if (movimentos.length == 0) {
            data.push([
                {
                    text: `-`,
                },
                {
                    text: `-`,
                },
                {
                    text: `-`,
                },
                {
                    text: `-`,
                },
                {
                    text: `-`,
                },
                {
                    text: `-`,
                },
                {
                    text: `-`,
                },
                {
                    text: `-`,
                },
            ]);
        }

        const documentData = {
            pageSize: "A4",
            defaultStyle: {
                font: "Courier",
            },
            pageMargins: [40, 35, 40, 80],
            content: [
                {
                    style: "header",
                    alignment: "justify",
                    columns: [
                        {
                            image: path.resolve(
                                `./uploads/anexos/${logotipo.nome_ficheiro}`
                            ),
                            fit: [70, 70],
                        },
                        [
                            {
                                text: "Movimentos de Stock",
                                normal: true,
                                bold: false,
                                fontSize: 12,
                                characterSpacing: 1,
                            },
                            {
                                text:
                                    "Data: " +
                                    moment(new Date()).format("DD-MM-yyyy"),
                                normal: true,
                                bold: false,
                                fontSize: 8,
                                characterSpacing: 1,
                            },
                        ],
                    ],
                },
                {
                    columns: [
                        [
                            {
                                text: `\n${pertencenteA.nome}`,
                                normal: false,
                                bold: true,
                                fontSize: 12,
                                characterSpacing: 1,
                            },
                            {
                                text: `\n${
                                    pertencenteA.endereco1
                                        ? pertencenteA.endereco1
                                        : "Endereço: -"
                                }`,
                                normal: true,
                                bold: false,
                                fontSize: 10,
                                characterSpacing: 1,
                            },
                            {
                                text: `Contacto(s): ${
                                    pertencenteA.contacto1
                                        ? pertencenteA.contacto1
                                        : "-"
                                }`,
                                normal: true,
                                bold: false,
                                fontSize: 10,
                                characterSpacing: 1,
                            },
                            {
                                text: `E-mail: ${pertencenteA.email}`,
                                normal: true,
                                bold: false,
                                fontSize: 10,
                                characterSpacing: 1,
                            },
                            {
                                text: `Nuit: ${
                                    pertencenteA.nuit ? pertencenteA.nuit : "-"
                                }`,
                                normal: true,
                                bold: false,
                                fontSize: 10,
                                characterSpacing: 1,
                            },
                        ],
                        [
                            { text: "\n" },
                            {
                                text: stock.designacao ? stock.designacao : "",
                                normal: false,
                                bold: true,
                                fontSize: 10,
                                characterSpacing: 1,
                            },
                            {
                                text:
                                    `Referencia: ` + prefixo + stock.referencia,
                                normal: true,
                                bold: false,
                                fontSize: 10,
                                characterSpacing: 1,
                            },
                            {
                                text: `Stock Atual: ` + saldo,
                                normal: true,
                                bold: false,
                                fontSize: 10,
                                characterSpacing: 1,
                            },
                        ],
                    ],
                },
                { columns: [{ text: "\n" }] },
                {
                    layout: {
                        defaultBorder: false,
                        hLineWidth: function (i, node) {
                            return 1;
                        },
                        vLineWidth: function (i, node) {
                            return 1;
                        },
                        hLineColor: function (i, node) {
                            return "lightgrey";
                        },
                        vLineColor: function (i, node) {
                            return "white";
                        },
                        hLineWidth: function (i, node) {
                            return 0.1;
                        },
                        hLineStyle: function (i, node) {
                            // if (i === 0 || i === node.table.body.length) {
                            return null;
                            //}
                        },
                        // vLineStyle: function (i, node) { return {dash: { length: 10, space: 4 }}; },
                        paddingLeft: function (i, node) {
                            return 5;
                        },
                        paddingRight: function (i, node) {
                            return 5;
                        },
                        paddingTop: function (i, node) {
                            return 3;
                        },
                        paddingBottom: function (i, node) {
                            return 2;
                        },
                        fillColor: function (rowIndex, node, columnIndex) {
                            return "white";
                        },
                        hLineWidth: function (i, node) {
                            return 0.1;
                        },
                    },
                    table: {
                        headerRows: 1,
                        widths: ["*", "*", "*", "*", "*", "*", "*", "*"],
                        body: [
                            [
                                {
                                    text: "Data",
                                    fillColor: "#6e6e6e",
                                    color: "white",
                                    border: [true, true, true, true],
                                    characterSpacing: 1,
                                    fontSize: 6.5,
                                },
                                {
                                    text: "Documento",
                                    fillColor: "#6e6e6e",
                                    color: "white",
                                    border: [true, true, true, true],
                                    characterSpacing: 1,
                                    fontSize: 6.5,
                                },
                                {
                                    text: "Referência",
                                    fillColor: "#6e6e6e",
                                    color: "white",
                                    border: [true, true, true, true],
                                    characterSpacing: 1,
                                    fontSize: 6.5,
                                },
                                {
                                    text: "Entradas",
                                    fillColor: "#6e6e6e",
                                    color: "white",
                                    border: [true, true, true, true],
                                    characterSpacing: 1,
                                    fontSize: 6.5,
                                },
                                {
                                    text: `Saídas`,
                                    fillColor: "#6e6e6e",
                                    color: "white",
                                    border: [true, true, true, true],
                                    characterSpacing: 1,
                                    fontSize: 6.5,
                                },
                                {
                                    text: `Saldo`,
                                    fillColor: "#6e6e6e",
                                    color: "white",
                                    border: [true, true, true, true],
                                    characterSpacing: 1,
                                    fontSize: 6.5,
                                },
                                {
                                    text: `Nome`,
                                    fillColor: "#6e6e6e",
                                    color: "white",
                                    border: [true, true, true, true],
                                    characterSpacing: 1,
                                    fontSize: 6.5,
                                },
                                {
                                    text: `Armazém`,
                                    fillColor: "#6e6e6e",
                                    color: "white",
                                    border: [true, true, true, true],
                                    characterSpacing: 1,
                                    fontSize: 6.5,
                                },
                            ],
                            ...data,
                            [
                                {
                                    text: "",
                                    fillColor: "#28c76f",
                                    color: "white",
                                    border: [true, true, true, true],
                                    characterSpacing: 1,
                                    fontSize: 6.5,
                                },
                                {
                                    text: "",
                                    fillColor: "#28c76f",
                                    color: "white",
                                    border: [true, true, true, true],
                                    characterSpacing: 1,
                                    fontSize: 6.5,
                                },
                                {
                                    text: "Total",
                                    fillColor: "#28c76f",
                                    color: "white",
                                    border: [true, true, true, true],
                                    characterSpacing: 1,
                                    fontSize: 7,
                                    alignment: "right",
                                },
                                {
                                    text: entradas,
                                    fillColor: "#28c76f",
                                    color: "white",
                                    border: [true, true, true, true],
                                    characterSpacing: 1,
                                    fontSize: 7,
                                    alignment: "right",
                                },
                                {
                                    text: saidas,
                                    fillColor: "#28c76f",
                                    color: "white",
                                    border: [true, true, true, true],
                                    characterSpacing: 1,
                                    fontSize: 7,
                                    alignment: "right",
                                },
                                {
                                    text: saldo,
                                    fillColor: "#28c76f",
                                    color: "white",
                                    border: [true, true, true, true],
                                    characterSpacing: 1,
                                    fontSize: 7,
                                    alignment: "right",
                                },
                                {
                                    text: ``,
                                    fillColor: "#28c76f",
                                    color: "white",
                                    border: [true, true, true, true],
                                    characterSpacing: 1,
                                    fontSize: 6.5,
                                },
                                {
                                    text: ``,
                                    fillColor: "#28c76f",
                                    color: "white",
                                    border: [true, true, true, true],
                                    characterSpacing: 1,
                                    fontSize: 6.5,
                                },
                            ],
                        ],
                    },
                },
            ],
        };

        const pdfDoc = printer.createPdfKitDocument(documentData);
        let chunks = [];
        pdfDoc.on("data", (chunk) => {
            chunks.push(chunk);
        });
        pdfDoc.on("end", () => {
            const result = Buffer.concat(chunks);
            res.setHeader("Content-Type", "Application/pdf");
            res.setHeader(
                "content-disposition",
                "attachment; filename=export.pdf"
            );
            res.send(result);
        });
        pdfDoc.end();
    } catch (error) {
        return handleResponse(req, res, 500, error);
    }
};

export const getExtratoClienteByDate = async (req, res) => {
    const { userId } = req.user;

    if (
        !(await userCanAccess(
            "Extratos dos Clientes",
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
    let extenso = "";
    const dadosBancarios = [];

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
        {
            text: "Saldo Anterior",
            border: [true, true, true, true],
            characterSpacing: 1,
            fillColor: "#28c76f",
            fontSize: 7,
        },
        {
            text: "",
            border: [true, true, true, true],
            characterSpacing: 1,
            fillColor: "#28c76f",
            fontSize: 7,
        },
        {
            text: "",
            border: [true, true, true, true],
            characterSpacing: 1,
            fontSize: 7,
            fillColor: "#28c76f",
            alignment: "right",
        },
        {
            text: "",
            border: [true, true, true, true],
            characterSpacing: 1,
            fontSize: 7,
            fillColor: "#28c76f",
            alignment: "right",
        },
        {
            text: credLast - lastAnterior != 0 ? formatCurrency(debLast - credLast) : 0,                
            border: [true, true, true, true],
            characterSpacing: 1,
            fontSize: 7,
            fillColor: "#28c76f",
            alignment: "right",
        },
    ];

    const clienteExtratos = await knex("extrato_cliente")
        .where({
            cliente: id,
        })
        .whereBetween("data_emissao", [firstdate, seconddate]);

    for (let i = 0; i < clienteExtratos.length; i++) {
        clienteExtratos[i].valor_pago = formatCurrency(
            clienteExtratos[i].valor_pago
        );

        response.push([
            {
                text: clienteExtratos[i].data_emissao,
                border: [true, true, true, true],
                characterSpacing: 1,
                fontSize: 7,
            },
            {
                text: clienteExtratos[i].referencia,
                border: [true, true, true, true],
                characterSpacing: 1,
                fontSize: 7,
            },
            {
                text: formatCurrency(clienteExtratos[i].debito),
                border: [true, true, true, true],
                characterSpacing: 1,
                fontSize: 7,
                alignment: "right",
            },
            {
                text: formatCurrency(clienteExtratos[i].credito),
                border: [true, true, true, true],
                characterSpacing: 1,
                fontSize: 7,
                alignment: "right",
            },
            {
                text: formatCurrency(
                    debito -
                        credito +
                        clienteExtratos[i].debito -
                        clienteExtratos[i].credito
                ),
                border: [true, true, true, true],
                characterSpacing: 1,
                fontSize: 7,
                alignment: "right",
            },
        ]);

        credito += Number(clienteExtratos[i].credito);
        debito += Number(clienteExtratos[i].debito);
    }

    total = debito - credito;

    try {
        const printer = new pdfPrinter(fonts);
        const pertencenteA = await knex("empresa")
            .where({ id: empresa })
            .first();
        const logotipo = await knex("anexo")
            .where({ id: pertencenteA.logotipo })
            .first();
        const moedaPadrao = await knex("moeda")
            .where({ id: pertencenteA.moeda_padrao })
            .first();
        const contaBancaria = await knex("conta_bancaria")
            .where({
                removido: false,
                empresa,
            })
            .limit(3);

        for (let i = 0; i < contaBancaria.length; i++) {
            dadosBancarios.push([
                {
                    text: contaBancaria[i].nome_banco,
                    characterSpacing: 1,
                    fontSize: 6,
                    normal: true,
                    bold: false,
                },
                {
                    text: contaBancaria[i].numero_conta,
                    characterSpacing: 1,
                    fontSize: 6,
                    normal: true,
                    bold: false,
                },
                {
                    text: contaBancaria[i].nib,
                    characterSpacing: 1,
                    fontSize: 6,
                    normal: true,
                    bold: false,
                },
                {
                    text: contaBancaria[i].swift,
                    characterSpacing: 1,
                    fontSize: 6,
                    normal: true,
                    bold: false,
                },
            ]);
        }

        if (dadosBancarios.length == 0) {
            dadosBancarios.push([
                {
                    text: "-",
                    characterSpacing: 1,
                    fontSize: 6,
                    normal: true,
                    bold: false,
                },
                {
                    text: "-",
                    characterSpacing: 1,
                    fontSize: 6,
                    normal: true,
                    bold: false,
                },
                {
                    text: "-",
                    characterSpacing: 1,
                    fontSize: 6,
                    normal: true,
                    bold: false,
                },
                {
                    text: "-",
                    characterSpacing: 1,
                    fontSize: 6,
                    normal: true,
                    bold: false,
                },
            ]);
        }

        try {
            extenso = numeroPorExtenso.porExtenso(
                total,
                numeroPorExtenso.estilo.monetario
            );
            if (extenso.startsWith("um")) {
                extenso = extenso
                    .substr(2)
                    .replaceAll("reais", "meticais")
                    .trim();
            } else {
                extenso = extenso.replaceAll("reais", "meticais");
            }
        } catch (error) {
            console.log(error);
        }

        const documentData = {
            pageSize: "A4",
            defaultStyle: {
                font: "Courier",
            },
            pageMargins: [40, 35, 40, 80],
            content: [
                {
                    style: "header",
                    alignment: "justify",
                    columns: [
                        {
                            image: path.resolve(
                                `./uploads/anexos/${logotipo.nome_ficheiro}`
                            ),
                            fit: [70, 70],
                        },
                        [
                            {
                                text: "Extrato do Cliente",
                                normal: true,
                                bold: false,
                                fontSize: 12,
                                characterSpacing: 1,
                            },
                            {
                                text:
                                    "Data: " +
                                    moment(new Date()).format("DD-MM-yyyy"),
                                normal: true,
                                bold: false,
                                fontSize: 8,
                                characterSpacing: 1,
                            },
                        ],
                    ],
                },
                {
                    columns: [
                        [
                            {
                                text: `\n${pertencenteA.nome}`,
                                normal: false,
                                bold: true,
                                fontSize: 12,
                                characterSpacing: 1,
                            },
                            {
                                text: `\n${
                                    pertencenteA.endereco1
                                        ? pertencenteA.endereco1
                                        : "Endereço: -"
                                }`,
                                normal: true,
                                bold: false,
                                fontSize: 10,
                                characterSpacing: 1,
                            },
                            {
                                text: `Contacto(s): ${
                                    pertencenteA.contacto1
                                        ? pertencenteA.contacto1
                                        : "-"
                                }`,
                                normal: true,
                                bold: false,
                                fontSize: 10,
                                characterSpacing: 1,
                            },
                            {
                                text: `E-mail: ${pertencenteA.email}`,
                                normal: true,
                                bold: false,
                                fontSize: 10,
                                characterSpacing: 1,
                            },
                            {
                                text: `Nuit: ${
                                    pertencenteA.nuit ? pertencenteA.nuit : "-"
                                }`,
                                normal: true,
                                bold: false,
                                fontSize: 10,
                                characterSpacing: 1,
                            },
                        ],
                        [
                            {
                                text: `\n${cliente.nome}`,
                                color: "",
                                normal: false,
                                bold: true,
                                fontSize: 12,
                                characterSpacing: 1,
                            },
                            {
                                text: `\n${
                                    cliente.endereco
                                        ? cliente.endereco
                                        : "Endereço: -"
                                }`,
                                normal: true,
                                bold: false,
                                fontSize: 10,
                                characterSpacing: 1,
                            },
                            {
                                text: `Contacto: ${
                                    cliente.contacto1 ? cliente.contacto1 : "-"
                                }`,
                                normal: true,
                                bold: false,
                                fontSize: 10,
                                characterSpacing: 1,
                            },
                            {
                                text: `E-mail: ${
                                    cliente.email ? cliente.email : "-"
                                }`,
                                normal: true,
                                bold: false,
                                fontSize: 10,
                                characterSpacing: 1,
                            },
                            {
                                text: `Nuit: ${
                                    cliente.nuit ? cliente.nuit : "-"
                                }`,
                                normal: true,
                                bold: false,
                                fontSize: 10,
                                characterSpacing: 1,
                            },
                        ],
                    ],
                },
                { columns: [{ text: "\n" }] },
                {
                    layout: {
                        defaultBorder: false,
                        hLineWidth: function (i, node) {
                            return 1;
                        },
                        vLineWidth: function (i, node) {
                            return 1;
                        },
                        hLineColor: function (i, node) {
                            return "lightgrey";
                        },
                        vLineColor: function (i, node) {
                            return "white";
                        },
                        hLineWidth: function (i, node) {
                            return 0.1;
                        },
                        hLineStyle: function (i, node) {
                            // if (i === 0 || i === node.table.body.length) {
                            return null;
                            //}
                        },
                        // vLineStyle: function (i, node) { return {dash: { length: 10, space: 4 }}; },
                        paddingLeft: function (i, node) {
                            return 5;
                        },
                        paddingRight: function (i, node) {
                            return 5;
                        },
                        paddingTop: function (i, node) {
                            return 3;
                        },
                        paddingBottom: function (i, node) {
                            return 2;
                        },
                        fillColor: function (rowIndex, node, columnIndex) {
                            return "white";
                        },
                        hLineWidth: function (i, node) {
                            return 0.1;
                        },
                    },
                    table: {
                        headerRows: 1,
                        widths: ["*", "*", "*", "*", "*"],
                        body: [
                            [
                                {
                                    text: "Data de emissão",
                                    fillColor: "#6e6e6e",
                                    color: "white",
                                    border: [true, true, true, true],
                                    characterSpacing: 1,
                                    fontSize: 6.5,
                                },
                                {
                                    text: "N. do documento",
                                    fillColor: "#6e6e6e",
                                    color: "white",
                                    border: [true, true, true, true],
                                    characterSpacing: 1,
                                    fontSize: 6.5,
                                },
                                {
                                    text: "Débito",
                                    fillColor: "#6e6e6e",
                                    color: "white",
                                    border: [true, true, true, true],
                                    characterSpacing: 1,
                                    fontSize: 6.5,
                                },
                                {
                                    text: "Crédito",
                                    fillColor: "#6e6e6e",
                                    color: "white",
                                    border: [true, true, true, true],
                                    characterSpacing: 1,
                                    fontSize: 6.5,
                                },
                                {
                                    text: `Saldo`,
                                    fillColor: "#6e6e6e",
                                    color: "white",
                                    border: [true, true, true, true],
                                    characterSpacing: 1,
                                    fontSize: 6.5,
                                },
                            ],
                            lastAnterior,
                            ...response,
                            [
                                {
                                    text: "",
                                    border: [true, true, true, true],
                                    characterSpacing: 1,
                                    fontSize: 6.5,
                                },
                                {
                                    text: "Total:",
                                    border: [true, true, true, true],
                                    characterSpacing: 1,
                                    fontSize: 7,
                                    bold: true,
                                    fillColor: "#28c76f",
                                    color: "black",
                                },
                                {
                                    text:
                                        formatCurrency(debito) +
                                        " " +
                                        moedaPadrao.codigo,
                                    border: [true, true, true, true],
                                    characterSpacing: 1,
                                    fontSize: 7,
                                    fillColor: "#28c76f",
                                    color: "black",
                                    alignment: "right",
                                },
                                {
                                    text:
                                        formatCurrency(credito) +
                                        " " +
                                        moedaPadrao.codigo,
                                    border: [true, true, true, true],
                                    characterSpacing: 1,
                                    fontSize: 7,
                                    fillColor: "#28c76f",
                                    color: "black",
                                    alignment: "right",
                                },
                                {
                                    text:
                                        formatCurrency(total) +
                                        " " +
                                        moedaPadrao.codigo,
                                    border: [true, true, true, true],
                                    characterSpacing: 1,
                                    fontSize: 7,
                                    fillColor: "#28c76f",
                                    color: "black",
                                    alignment: "right",
                                },
                            ],
                        ],
                    },
                },
                [
                    {
                        canvas: [
                            {
                                lineColor: "#6e6e6e",
                                type: "line",
                                x1: 0,
                                y1: 0.1,
                                x2: 515,
                                y2: 0.3,
                                lineWidth: 1,
                                lineHeight: 0.1,
                            },
                        ],
                    },
                ],
                [
                    {
                        text: "\nValor por extenso: " + extenso,
                        border: [true, true, true, true],
                        alignment: "left",
                        characterSpacing: 1,
                        fontSize: 8,
                    },
                ],
            ],
            footer: {
                margin: [20, 20, 20, 20],
                layout: {
                    defaultBorder: false,
                    hLineWidth: function (i, node) {
                        return 1;
                    },
                    vLineWidth: function (i, node) {
                        return 1;
                    },
                    hLineColor: function (i, node) {
                        return "white";
                    },
                    vLineColor: function (i, node) {
                        return "white";
                    },
                    hLineStyle: function (i, node) {
                        // if (i === 0 || i === node.table.body.length) {
                        return null;
                        //}
                    },
                    // vLineStyle: function (i, node) { return {dash: { length: 10, space: 4 }}; },
                    paddingLeft: function (i, node) {
                        return 10;
                    },
                    paddingRight: function (i, node) {
                        return 10;
                    },
                    paddingTop: function (i, node) {
                        return 3;
                    },
                    paddingBottom: function (i, node) {
                        return 3;
                    },
                    fillColor: function (rowIndex, node, columnIndex) {
                        return "white";
                    },
                },
                table: {
                    headerRows: 1,
                    widths: ["*", "*", "*", "*"],
                    body: [
                        [
                            {
                                text: "Instituição Bancária",
                                fillColor: "#6e6e6e",
                                color: "white",
                                border: [false, false, false, false],
                                characterSpacing: 1,
                                fontSize: 6,
                                normal: true,
                                bold: false,
                            },
                            {
                                text: "Numero da Conta",
                                fillColor: "#6e6e6e",
                                color: "white",
                                border: [false, false, false, false],
                                characterSpacing: 1,
                                fontSize: 6,
                                normal: true,
                                bold: false,
                            },
                            {
                                text: "NIB",
                                fillColor: "#6e6e6e",
                                color: "white",
                                border: [false, false, false, false],
                                characterSpacing: 1,
                                fontSize: 6,
                                normal: true,
                                bold: false,
                            },
                            {
                                text: "Swift",
                                fillColor: "#6e6e6e",
                                color: "white",
                                border: [false, false, false, false],
                                characterSpacing: 1,
                                fontSize: 6,
                                normal: true,
                                bold: false,
                            },
                        ],
                        ...dadosBancarios,
                        [
                            {
                                text: "Processado por Computador",
                                characterSpacing: 0.8,
                                fontSize: 5,
                                normal: false,
                                bold: true,
                                border: [false, true, false, false],
                            },
                            {
                                text: "",
                                characterSpacing: 1,
                                fontSize: 6,
                                normal: true,
                                bold: false,
                                border: [false, true, false, false],
                            },
                            {
                                text: "Licenciado a: ",
                                characterSpacing: 1,
                                fontSize: 6,
                                normal: true,
                                bold: false,
                                border: [false, true, false, false],
                                alignment: "right",
                            },
                            {
                                text: pertencenteA.nome,
                                characterSpacing: 0.8,
                                fontSize: 6,
                                normal: false,
                                bold: true,
                                border: [false, true, false, false],
                            },
                        ],
                    ],
                },
            },
        };

        const pdfDoc = printer.createPdfKitDocument(documentData);
        let chunks = [];
        pdfDoc.on("data", (chunk) => {
            chunks.push(chunk);
        });
        pdfDoc.on("end", () => {
            const result = Buffer.concat(chunks);
            res.setHeader("Content-Type", "Application/pdf");
            res.setHeader(
                "content-disposition",
                "attachment; filename=export.pdf"
            );
            res.send(result);
        });
        pdfDoc.end();
    } catch (error) {
        return handleResponse(req, res, 500, error);
    }
};

export const getExtratoFornecedorByDate = async (req, res) => {
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
    let extenso = "";
    const dadosBancarios = [];

    const fornecedor = await knex("fornecedor").where({ id, empresa }).first();

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
        {
            text: "Saldo Anterior",
            border: [true, true, true, true],
            characterSpacing: 1,
            fillColor: "#28c76f",
            fontSize: 7,
        },
        {
            text: "",
            border: [true, true, true, true],
            characterSpacing: 1,
            fillColor: "#28c76f",
            fontSize: 7,
        },
        {
            text: "",
            border: [true, true, true, true],
            characterSpacing: 1,
            fontSize: 7,
            fillColor: "#28c76f",
            alignment: "right",
        },
        {
            text: "",
            border: [true, true, true, true],
            characterSpacing: 1,
            fontSize: 7,
            fillColor: "#28c76f",
            alignment: "right",
        },
        {
            text: credLast - lastAnterior != 0 ? formatCurrency(debLast - credLast) : 0,                
            border: [true, true, true, true],
            characterSpacing: 1,
            fontSize: 7,
            fillColor: "#28c76f",
            alignment: "right",
        },
    ];

    const fornecedorExtratos = await knex("extrato_fornecedor")
        .where({
            fornecedor: id,
        })
        .whereBetween("data_emissao", [firstdate, seconddate]);

    for (let i = 0; i < fornecedorExtratos.length; i++) {
        fornecedorExtratos[i].valor_pago = formatCurrency(
            fornecedorExtratos[i].valor_pago
        );
        credito += Number(fornecedorExtratos[i].credito);
        debito += Number(fornecedorExtratos[i].debito);
        response.push([
            {
                text: fornecedorExtratos[i].data_emissao,
                border: [true, true, true, true],
                characterSpacing: 1,
                fontSize: 7,
            },
            {
                text: fornecedorExtratos[i].referencia,
                border: [true, true, true, true],
                characterSpacing: 1,
                fontSize: 7,
            },
            {
                text: formatCurrency(fornecedorExtratos[i].debito),
                border: [true, true, true, true],
                characterSpacing: 1,
                fontSize: 7,
                alignment: "right",
            },
            {
                text: formatCurrency(fornecedorExtratos[i].credito),
                border: [true, true, true, true],
                characterSpacing: 1,
                fontSize: 7,
                alignment: "right",
            },
            {
                text: formatCurrency(
                    fornecedorExtratos[i].debito - fornecedorExtratos[i].credito
                ),
                border: [true, true, true, true],
                characterSpacing: 1,
                fontSize: 7,
                alignment: "right",
            },
        ]);
    }

    total = debito - credito;

    try {
        const printer = new pdfPrinter(fonts);
        const pertencenteA = await knex("empresa")
            .where({ id: empresa })
            .first();
        const logotipo = await knex("anexo")
            .where({ id: pertencenteA.logotipo })
            .first();
        const moedaPadrao = await knex("moeda")
            .where({ id: pertencenteA.moeda_padrao })
            .first();
        const contaBancaria = await knex("conta_bancaria")
            .where({
                removido: false,
                empresa,
            })
            .limit(3);

        for (let i = 0; i < contaBancaria.length; i++) {
            dadosBancarios.push([
                {
                    text: contaBancaria[i].nome_banco,
                    characterSpacing: 1,
                    fontSize: 6,
                    normal: true,
                    bold: false,
                },
                {
                    text: contaBancaria[i].numero_conta,
                    characterSpacing: 1,
                    fontSize: 6,
                    normal: true,
                    bold: false,
                },
                {
                    text: contaBancaria[i].nib,
                    characterSpacing: 1,
                    fontSize: 6,
                    normal: true,
                    bold: false,
                },
                {
                    text: contaBancaria[i].swift,
                    characterSpacing: 1,
                    fontSize: 6,
                    normal: true,
                    bold: false,
                },
            ]);
        }

        if (dadosBancarios.length == 0) {
            dadosBancarios.push([
                {
                    text: "-",
                    characterSpacing: 1,
                    fontSize: 6,
                    normal: true,
                    bold: false,
                },
                {
                    text: "-",
                    characterSpacing: 1,
                    fontSize: 6,
                    normal: true,
                    bold: false,
                },
                {
                    text: "-",
                    characterSpacing: 1,
                    fontSize: 6,
                    normal: true,
                    bold: false,
                },
                {
                    text: "-",
                    characterSpacing: 1,
                    fontSize: 6,
                    normal: true,
                    bold: false,
                },
            ]);
        }

        try {
            extenso = numeroPorExtenso.porExtenso(
                total,
                numeroPorExtenso.estilo.monetario
            );
            if (extenso.startsWith("um")) {
                extenso = extenso
                    .substr(2)
                    .replaceAll("reais", "meticais")
                    .trim();
            } else {
                extenso = extenso.replaceAll("reais", "meticais");
            }
        } catch (error) {
            console.log(error);
        }

        const documentData = {
            pageSize: "A4",
            defaultStyle: {
                font: "Courier",
            },
            pageMargins: [40, 35, 40, 80],
            content: [
                {
                    style: "header",
                    alignment: "justify",
                    columns: [
                        {
                            image: path.resolve(
                                `./uploads/anexos/${logotipo.nome_ficheiro}`
                            ),
                            fit: [70, 70],
                        },
                        [
                            {
                                text: "Extrato do Fornecedor",
                                normal: true,
                                bold: false,
                                fontSize: 12,
                                characterSpacing: 1,
                            },
                            {
                                text:
                                    "Data: " +
                                    moment(new Date()).format("DD-MM-yyyy"),
                                normal: true,
                                bold: false,
                                fontSize: 8,
                                characterSpacing: 1,
                            },
                        ],
                    ],
                },
                {
                    columns: [
                        [
                            {
                                text: `\n${pertencenteA.nome}`,
                                normal: false,
                                bold: true,
                                fontSize: 12,
                                characterSpacing: 1,
                            },
                            {
                                text: `\n${
                                    pertencenteA.endereco1
                                        ? pertencenteA.endereco1
                                        : "Endereço: -"
                                }`,
                                normal: true,
                                bold: false,
                                fontSize: 10,
                                characterSpacing: 1,
                            },
                            {
                                text: `Contacto(s): ${
                                    pertencenteA.contacto1
                                        ? pertencenteA.contacto1
                                        : "-"
                                }`,
                                normal: true,
                                bold: false,
                                fontSize: 10,
                                characterSpacing: 1,
                            },
                            {
                                text: `E-mail: ${pertencenteA.email}`,
                                normal: true,
                                bold: false,
                                fontSize: 10,
                                characterSpacing: 1,
                            },
                            {
                                text: `Nuit: ${
                                    pertencenteA.nuit ? pertencenteA.nuit : "-"
                                }`,
                                normal: true,
                                bold: false,
                                fontSize: 10,
                                characterSpacing: 1,
                            },
                        ],
                        [
                            {
                                text: `\n${fornecedor.nome}`,
                                color: "",
                                normal: false,
                                bold: true,
                                fontSize: 12,
                                characterSpacing: 1,
                            },
                            {
                                text: `\n${
                                    fornecedor.endereco
                                        ? fornecedor.endereco
                                        : "Endereço: -"
                                }`,
                                normal: true,
                                bold: false,
                                fontSize: 10,
                                characterSpacing: 1,
                            },
                            {
                                text: `Contacto: ${
                                    fornecedor.contacto1
                                        ? fornecedor.contacto1
                                        : "-"
                                }`,
                                normal: true,
                                bold: false,
                                fontSize: 10,
                                characterSpacing: 1,
                            },
                            {
                                text: `E-mail: ${
                                    fornecedor.email ? fornecedor.email : "-"
                                }`,
                                normal: true,
                                bold: false,
                                fontSize: 10,
                                characterSpacing: 1,
                            },
                            {
                                text: `Nuit: ${
                                    fornecedor.nuit ? fornecedor.nuit : "-"
                                }`,
                                normal: true,
                                bold: false,
                                fontSize: 10,
                                characterSpacing: 1,
                            },
                        ],
                    ],
                },
                { columns: [{ text: "\n" }] },
                {
                    layout: {
                        defaultBorder: false,
                        hLineWidth: function (i, node) {
                            return 1;
                        },
                        vLineWidth: function (i, node) {
                            return 1;
                        },
                        hLineColor: function (i, node) {
                            return "lightgrey";
                        },
                        vLineColor: function (i, node) {
                            return "white";
                        },
                        hLineWidth: function (i, node) {
                            return 0.1;
                        },
                        hLineStyle: function (i, node) {
                            // if (i === 0 || i === node.table.body.length) {
                            return null;
                            //}
                        },
                        // vLineStyle: function (i, node) { return {dash: { length: 10, space: 4 }}; },
                        paddingLeft: function (i, node) {
                            return 5;
                        },
                        paddingRight: function (i, node) {
                            return 5;
                        },
                        paddingTop: function (i, node) {
                            return 3;
                        },
                        paddingBottom: function (i, node) {
                            return 2;
                        },
                        fillColor: function (rowIndex, node, columnIndex) {
                            return "white";
                        },
                        hLineWidth: function (i, node) {
                            return 0.1;
                        },
                    },
                    table: {
                        headerRows: 1,
                        widths: ["*", "*", "*", "*", "*"],
                        body: [
                            [
                                {
                                    text: "Data de emissão",
                                    fillColor: "#6e6e6e",
                                    color: "white",
                                    border: [true, true, true, true],
                                    characterSpacing: 1,
                                    fontSize: 6.5,
                                },
                                {
                                    text: "N. do documento",
                                    fillColor: "#6e6e6e",
                                    color: "white",
                                    border: [true, true, true, true],
                                    characterSpacing: 1,
                                    fontSize: 6.5,
                                },
                                {
                                    text: "Débito",
                                    fillColor: "#6e6e6e",
                                    color: "white",
                                    border: [true, true, true, true],
                                    characterSpacing: 1,
                                    fontSize: 6.5,
                                },
                                {
                                    text: "Crédito",
                                    fillColor: "#6e6e6e",
                                    color: "white",
                                    border: [true, true, true, true],
                                    characterSpacing: 1,
                                    fontSize: 6.5,
                                },
                                {
                                    text: `Saldo`,
                                    fillColor: "#6e6e6e",
                                    color: "white",
                                    border: [true, true, true, true],
                                    characterSpacing: 1,
                                    fontSize: 6.5,
                                },
                            ],
                            lastAnterior,
                            ...response,
                            [
                                {
                                    text: "",
                                    border: [true, true, true, true],
                                    characterSpacing: 1,
                                    fontSize: 6.5,
                                },
                                {
                                    text: "Total:",
                                    border: [true, true, true, true],
                                    characterSpacing: 1,
                                    fontSize: 7,
                                    bold: true,
                                    fillColor: "#28c76f",
                                    color: "black",
                                },
                                {
                                    text:
                                        formatCurrency(debito) +
                                        " " +
                                        moedaPadrao.codigo,
                                    border: [true, true, true, true],
                                    characterSpacing: 1,
                                    fontSize: 7,
                                    fillColor: "#28c76f",
                                    color: "black",
                                    alignment: "right",
                                },
                                {
                                    text:
                                        formatCurrency(credito) +
                                        " " +
                                        moedaPadrao.codigo,
                                    border: [true, true, true, true],
                                    characterSpacing: 1,
                                    fontSize: 7,
                                    fillColor: "#28c76f",
                                    color: "black",
                                    alignment: "right",
                                },
                                {
                                    text:
                                        formatCurrency(total) +
                                        " " +
                                        moedaPadrao.codigo,
                                    border: [true, true, true, true],
                                    characterSpacing: 1,
                                    fontSize: 7,
                                    fillColor: "#28c76f",
                                    color: "black",
                                    alignment: "right",
                                },
                            ],
                        ],
                    },
                },
                [
                    {
                        canvas: [
                            {
                                lineColor: "#6e6e6e",
                                type: "line",
                                x1: 0,
                                y1: 0.1,
                                x2: 515,
                                y2: 0.3,
                                lineWidth: 1,
                                lineHeight: 0.1,
                            },
                        ],
                    },
                ],
                [
                    {
                        text: "\nValor por extenso: " + extenso,
                        border: [true, true, true, true],
                        alignment: "left",
                        characterSpacing: 1,
                        fontSize: 8,
                    },
                ],
            ],
            footer: {
                margin: [20, 20, 20, 20],
                layout: {
                    defaultBorder: false,
                    hLineWidth: function (i, node) {
                        return 1;
                    },
                    vLineWidth: function (i, node) {
                        return 1;
                    },
                    hLineColor: function (i, node) {
                        return "white";
                    },
                    vLineColor: function (i, node) {
                        return "white";
                    },
                    hLineStyle: function (i, node) {
                        // if (i === 0 || i === node.table.body.length) {
                        return null;
                        //}
                    },
                    // vLineStyle: function (i, node) { return {dash: { length: 10, space: 4 }}; },
                    paddingLeft: function (i, node) {
                        return 10;
                    },
                    paddingRight: function (i, node) {
                        return 10;
                    },
                    paddingTop: function (i, node) {
                        return 3;
                    },
                    paddingBottom: function (i, node) {
                        return 3;
                    },
                    fillColor: function (rowIndex, node, columnIndex) {
                        return "white";
                    },
                },
                table: {
                    headerRows: 1,
                    widths: ["*", "*", "*", "*"],
                    body: [
                        [
                            {
                                text: "Instituição Bancária",
                                fillColor: "#6e6e6e",
                                color: "white",
                                border: [false, false, false, false],
                                characterSpacing: 1,
                                fontSize: 6,
                                normal: true,
                                bold: false,
                            },
                            {
                                text: "Numero da Conta",
                                fillColor: "#6e6e6e",
                                color: "white",
                                border: [false, false, false, false],
                                characterSpacing: 1,
                                fontSize: 6,
                                normal: true,
                                bold: false,
                            },
                            {
                                text: "NIB",
                                fillColor: "#6e6e6e",
                                color: "white",
                                border: [false, false, false, false],
                                characterSpacing: 1,
                                fontSize: 6,
                                normal: true,
                                bold: false,
                            },
                            {
                                text: "Swift",
                                fillColor: "#6e6e6e",
                                color: "white",
                                border: [false, false, false, false],
                                characterSpacing: 1,
                                fontSize: 6,
                                normal: true,
                                bold: false,
                            },
                        ],
                        ...dadosBancarios,
                        [
                            {
                                text: "Processado por Computador",
                                characterSpacing: 0.8,
                                fontSize: 5,
                                normal: false,
                                bold: true,
                                border: [false, true, false, false],
                            },
                            {
                                text: "",
                                characterSpacing: 1,
                                fontSize: 6,
                                normal: true,
                                bold: false,
                                border: [false, true, false, false],
                            },
                            {
                                text: "Licenciado a: ",
                                characterSpacing: 1,
                                fontSize: 6,
                                normal: true,
                                bold: false,
                                border: [false, true, false, false],
                                alignment: "right",
                            },
                            {
                                text: pertencenteA.nome,
                                characterSpacing: 0.8,
                                fontSize: 6,
                                normal: false,
                                bold: true,
                                border: [false, true, false, false],
                            },
                        ],
                    ],
                },
            },
        };

        const pdfDoc = printer.createPdfKitDocument(documentData);
        let chunks = [];
        pdfDoc.on("data", (chunk) => {
            chunks.push(chunk);
        });
        pdfDoc.on("end", () => {
            const result = Buffer.concat(chunks);
            res.setHeader("Content-Type", "Application/pdf");
            res.setHeader(
                "content-disposition",
                "attachment; filename=export.pdf"
            );
            res.send(result);
        });
        pdfDoc.end();
    } catch (error) {
        return handleResponse(req, res, 500, error);
    }
};

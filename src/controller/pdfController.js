import knex from "../database";
import pdfPrinter from "pdfmake/src/printer";
import path, { format } from "path";
import { handleResponse } from "../utils/handleResponse";
import { numeroDocFormat } from "./DocumentoController";
import { numeroDocFormat as ReciboNumeroDocFormat } from "./reciboController";
import { numeroDocFormat as ReciboAdNumeroDocFormat } from "./reciboAdController";
import { numeroDocFormat as PagamentoFornecedorNumeroDocFormar } from "./PagamentofornecedorController";
import { numeroDocFormat as ReciboAdFornecedorNumeroDocFormat } from "./reciboAdFornecedorController";
import moment from "moment";
import numeroPorExtenso from "numero-por-extenso";
import { formatCurrency } from "../helper/FormatCurrency";

const fonts = {
    Courier: {
        normal: path.resolve("src/fonts/Courier/CourierPrime-Regular.ttf"),
        bold: path.resolve("src/fonts/Courier/CourierPrime-Bold.ttf"),
        italics: path.resolve("src/fonts/Courier/CourierPrime-Italic.ttf"),
        bolditalics: path.resolve(
            "src/fonts/Courier/CourierPrime-BoldItalic.ttf"
        ),
    },
    Roboto: {
        normal: path.resolve("src/fonts/Roboto-Regular.ttf"),
        bold: path.resolve("src/fonts/Roboto-Medium.ttf"),
        italics: path.resolve("src/fonts/Roboto-Italic.ttf"),
        bolditalics: path.resolve("src/fonts/Roboto-MediumItalic.ttf"),
    },
};

export const getDocumento = async (req, res) => {
    const { empresa } = req.user;
    const { id } = req.params;
    const { printOptions = [["original", "true"]] } = req.body;
    let direcionadoA = {
        nome: "-",
        endereco: "",
        contacto1: "",
        email: "",
        nuit: "",
    };

    const documento = await knex("documento").where({ id, empresa }).first();

    if (!documento) {
        const message = "Documento não encontrado";
        return handleResponse(req, res, 404, [], message);
    }

    try {
        const printer = new pdfPrinter(fonts);
        const documentItems = await knex("documento_item").where({
            documento: documento.id,
        });
        const pertencenteA = await knex("empresa")
            .where({ id: empresa })
            .first();
        const logotipo = await knex("anexo")
            .where({ id: pertencenteA.logotipo })
            .first();
        const tipoDoc = await knex("tipo_doc")
            .where({ id: documento.tipo_doc })
            .first();
        direcionadoA = await documentoDirecionadoA(
            tipoDoc.categoria,
            documento
        );

        const cambio = await knex("cambio")
            .where({ id: documento.cambio })
            .first();
        const moedaConversao = await knex("moeda")
            .where({ id: documento.moeda_conversao })
            .first();
        const moedaPadrao = await knex("moeda")
            .where({ id: documento.moeda_padrao })
            .first();

        const contaBancaria = await knex("conta_bancaria")
            .where({
                removido: false,
                activo: true,
                empresa,
            })
            .limit(3);

        let subTotal = 0;
        let totalDescontoDocumento = Number(documento.desconto);
        let impostoTotal = 0;
        let taxaCambio = cambio.preco_compra;
        const taxas = await knex("taxa").where({ empresa });

        for (let i = 0; i < documentItems.length; i++) {
            const taxa = taxas.find((t) => t.id == documentItems[i].taxa);
            subTotal += taxa.taxa_inclusa
                ? documentItems[i].preco * documentItems[i].quantidade -
                  taxa.valor
                : documentItems[i].preco * documentItems[i].quantidade;
            totalDescontoDocumento +=
                (documentItems[i].preco * documentItems[i].desconto) / 100;
            impostoTotal +=
                (documentItems[i].preco *
                    documentItems[i].quantidade *
                    taxa.valor) /
                100;
        }

        let footerProcessadoPor = [
            {
                text: "Processado por Computador",
                characterSpacing: 0.8,
                fontSize: 5,
                normal: false,
                bold: true,
                border: [false, true, false, false],
            },
            {
                text: `Licenciado a: ${pertencenteA.nome}`,
                characterSpacing: 0.8,
                fontSize: 6,
                normal: false,
                bold: true,
                border: [false, true, false, false],
            },
        ];
        const contaBancaria_Banco = [];
        const contaBancaria_Conta = [];
        const contaBancaria_NIB = [];
        const contaBancaria_Swift = [];
        const contaBancaria_width = [];
        const contaBancariaHeader = [
            {
                text: "Dados Bancários",
                fillColor: "#d8d6de",
                color: "black",
                border: [false, false, false, false],
                characterSpacing: 1,
                fontSize: 8,
                normal: false,
                bold: true,
            },
            {
                text: "",
                fillColor: "#d8d6de",
            },
        ];

        for (let i = 0; i < contaBancaria.length; i++) {
            contaBancaria_width.push("*");
            contaBancaria_Banco.push({
                text: contaBancaria[i].nome_banco,
                border: [false, false, false, false],
                characterSpacing: 1,
                fontSize: 6.5,
                normal: false,
                bold: true,
            });
            contaBancaria_Conta.push({
                text: `CONTA: ${contaBancaria[i].numero_conta}`,
                characterSpacing: 1,
                fontSize: 6,
                normal: true,
                bold: false,
            });
            contaBancaria_NIB.push({
                text: `NIB: ${contaBancaria[i].nib}`,
                characterSpacing: 1,
                fontSize: 6,
                normal: true,
                bold: false,
            });
            contaBancaria_Swift.push({
                text: `Swift: ${contaBancaria[i].swift}`,
                characterSpacing: 1,
                fontSize: 6,
                normal: true,
                bold: false,
            });
        }

        if (contaBancaria.length == 3) {
            contaBancariaHeader.push({
                text: "",
                fillColor: "#d8d6de",
            });
            footerProcessadoPor.push({ text: "" });

            footerProcessadoPor = [
                {
                    text: "Processado por Computador",
                    characterSpacing: 0.8,
                    fontSize: 5,
                    normal: false,
                    bold: true,
                    border: [false, true, false, false],
                },
                { text: "", border: [false, true, false, false] },
                {
                    text: `Licenciado a: ${pertencenteA.nome}`,
                    characterSpacing: 0.8,
                    fontSize: 6,
                    normal: false,
                    bold: true,
                    border: [false, true, false, false],
                },
            ];
        }
        if (contaBancaria.length <= 1) {
            contaBancaria_width.push("*");
            contaBancaria_Banco.push({ text: "" });
            contaBancaria_Conta.push({ text: "" });
            contaBancaria_NIB.push({ text: "" });
            contaBancaria_Swift.push({ text: "" });
        }

        if (contaBancaria.length == 0) {
            contaBancaria_width.push("*");
            contaBancaria_Banco.push({ text: "" });
            contaBancaria_Conta.push({ text: "" });
            contaBancaria_NIB.push({ text: "" });
            contaBancaria_Swift.push({ text: "" });
        }

        let totalDocumento = subTotal + impostoTotal - totalDescontoDocumento;
        let extenso = "";
        let valorConversao = totalDocumento / cambio.preco_compra;

        try {
            extenso = numeroPorExtenso.porExtenso(
                totalDocumento,
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

        printer.tableLayouts = {
            myCustomLayout: {
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
        };

        const content = [];
        let count = 0;

        for (let i = 0; i < printOptions.length; i++) {
            const [chave, valor] = printOptions[i];

            if (valor) {
                const modeloImpessao = String(chave).toLocaleUpperCase();

                content.push([
                    {
                        pageBreak: count == 0 ? "" : "before",
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
                                    text: modeloImpessao,
                                    normal: true,
                                    bold: false,
                                    fontSize: 10,
                                    characterSpacing: 1,
                                },
                                { text: "\n" },
                                {
                                    text: `${
                                        documento.nome
                                    } # ${numeroDocFormat(documento)}`,
                                    color: "",
                                    normal: false,
                                    bold: true,
                                    fontSize: 10,
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
                                        pertencenteA.nuit
                                            ? pertencenteA.nuit
                                            : "-"
                                    }`,
                                    normal: true,
                                    bold: false,
                                    fontSize: 10,
                                    characterSpacing: 1,
                                },
                            ],
                            [
                                {
                                    text: `\n${documento.nome} para:`,
                                    color: "",
                                    normal: true,
                                    bold: false,
                                    fontSize: 10,
                                    characterSpacing: 1,
                                },
                                direcionadoA && {
                                    text: `\n${
                                        direcionadoA.nome
                                            ? direcionadoA.nome
                                            : "-"
                                    }`,
                                    color: "",
                                    normal: false,
                                    bold: true,
                                    fontSize: 12,
                                    characterSpacing: 1,
                                },
                                direcionadoA && {
                                    text: `\n${
                                        direcionadoA.endereco
                                            ? direcionadoA.endereco
                                            : "Endereço: -"
                                    }`,
                                    normal: true,
                                    bold: false,
                                    fontSize: 10,
                                    characterSpacing: 1,
                                },
                                direcionadoA && {
                                    text: `Contacto: ${
                                        direcionadoA.contacto1
                                            ? direcionadoA.contacto1
                                            : "-"
                                    }`,
                                    normal: true,
                                    bold: false,
                                    fontSize: 10,
                                    characterSpacing: 1,
                                },
                                direcionadoA && {
                                    text: `E-mail: ${
                                        direcionadoA.email
                                            ? direcionadoA.email
                                            : "-"
                                    }`,
                                    normal: true,
                                    bold: false,
                                    fontSize: 10,
                                    characterSpacing: 1,
                                },
                                direcionadoA && {
                                    text: `Nuit: ${
                                        direcionadoA.nuit
                                            ? direcionadoA.nuit
                                            : "-"
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
                        columns: [
                            {
                                text: `Emitido a: ${moment(
                                    documento.data_emissao
                                ).format("DD-MM-yyyy")}`,
                                normal: false,
                                bold: false,
                                fontSize: 7,
                                characterSpacing: 1,
                                alignment: "left",
                            },
                            {
                                text: `Data de Vencimento: ${moment(
                                    documento.data_vencimento
                                ).format("DD-MM-yyyy")}`,
                                normal: false,
                                bold: false,
                                fontSize: 7,
                                characterSpacing: 1,
                                alignment: "right",
                            },
                        ],
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
                            widths: [60, "*", 30, 60, 40, 50, "auto"],
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
                                        text: "Descrição",
                                        fillColor: "#6e6e6e",
                                        color: "white",
                                        border: [true, true, true, true],
                                        characterSpacing: 1,
                                        fontSize: 6.5,
                                    },
                                    {
                                        text: "Quant",
                                        fillColor: "#6e6e6e",
                                        color: "white",
                                        border: [true, true, true, true],
                                        characterSpacing: 1,
                                        fontSize: 6.5,
                                    },
                                    {
                                        text: "Preço Unit.",
                                        fillColor: "#6e6e6e",
                                        color: "white",
                                        border: [true, true, true, true],
                                        characterSpacing: 1,
                                        fontSize: 6.5,
                                    },
                                    {
                                        text: "IVA (%)",
                                        fillColor: "#6e6e6e",
                                        color: "white",
                                        border: [true, true, true, true],
                                        characterSpacing: 1,
                                        fontSize: 6.5,
                                    },
                                    {
                                        text: "Desc. (%)",
                                        fillColor: "#6e6e6e",
                                        color: "white",
                                        border: [true, true, true, true],
                                        characterSpacing: 1,
                                        fontSize: 6.5,
                                    },
                                    {
                                        text: `Total (${moedaPadrao.codigo})`,
                                        fillColor: "#6e6e6e",
                                        color: "white",
                                        border: [true, true, true, true],
                                        characterSpacing: 1,
                                        fontSize: 6.5,
                                    },
                                ],
                                ...documentItems.map((i) => {
                                    const taxa = taxas.find(
                                        (t) => t.id == i.taxa
                                    );

                                    const descontoLinha =
                                        (i.desconto / 100) *
                                        i.preco *
                                        i.quantidade;
                                    const precoTotal =
                                        i.preco * i.quantidade - descontoLinha;

                                    const ref = i.referencia
                                        ? i.referencia
                                        : "";
                                    const descricao = i.descricao
                                        ? i.descricao
                                        : "";
                                    const quantidade = i.quantidade;
                                    const preco = i.preco;
                                    const imposto = `${taxa.nome} (${taxa.valor})`;
                                    const desconto = i.desconto;

                                    return [
                                        {
                                            text: ref,
                                            border: [false, false, false, true],
                                            fontSize: 6.5,
                                            characterSpacing: 1,
                                        },
                                        {
                                            text: descricao,
                                            border: [false, false, false, true],
                                            fontSize: 6.5,
                                            characterSpacing: 1,
                                        },
                                        {
                                            text: quantidade,
                                            border: [false, false, false, true],
                                            fontSize: 6.5,
                                            characterSpacing: 1,
                                        },
                                        {
                                            text: formatCurrency(preco),
                                            border: [false, false, false, true],
                                            fontSize: 6.5,
                                            characterSpacing: 1,
                                        },
                                        {
                                            text: imposto,
                                            border: [false, false, false, true],
                                            fontSize: 6.5,
                                            characterSpacing: 1,
                                        },
                                        {
                                            text: desconto,
                                            border: [false, false, false, true],
                                            fontSize: 6.5,
                                            characterSpacing: 1,
                                        },
                                        {
                                            text: formatCurrency(precoTotal),
                                            border: [false, false, false, true],
                                            fontSize: 6.5,
                                            characterSpacing: 1,
                                        },
                                    ];
                                }),
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
                            widths: ["*", 50],
                            body: [
                                [
                                    {
                                        text: `Subtotal (${moedaPadrao.codigo})`,
                                        border: [false, true, false, true],
                                        alignment: "right",
                                        characterSpacing: 1,
                                        fontSize: 8,
                                    },
                                    {
                                        text: formatCurrency(subTotal),
                                        border: [true, true, true, true],
                                        alignment: "right",
                                        color: "white",
                                        characterSpacing: 1,
                                        fontSize: 8,
                                        fillColor: "#6e6e6e",
                                    },
                                ],
                                [
                                    {
                                        text: `Desconto (${moedaPadrao.codigo})`,
                                        border: [false, false, false, true],
                                        alignment: "right",
                                        characterSpacing: 1,
                                        fontSize: 8,
                                    },
                                    {
                                        text: formatCurrency(
                                            totalDescontoDocumento
                                        ),
                                        border: [true, true, true, true],
                                        alignment: "right",
                                        color: "white",
                                        characterSpacing: 1,
                                        fontSize: 8,
                                        fillColor: "#6e6e6e",
                                    },
                                ],
                                [
                                    {
                                        text: `Imposto (${moedaPadrao.codigo})`,
                                        border: [false, false, false, true],
                                        characterSpacing: 1,
                                        fontSize: 8,
                                        alignment: "right",
                                    },
                                    {
                                        text: formatCurrency(impostoTotal),
                                        border: [true, true, true, true],
                                        alignment: "right",
                                        color: "white",
                                        characterSpacing: 1,
                                        fontSize: 8,
                                        fillColor: "#6e6e6e",
                                    },
                                ],
                                moedaConversao.codigo != moedaPadrao.codigo
                                    ? [
                                          {
                                              text: `Taxa de Cambio (${moedaConversao.codigo})`,
                                              border: [
                                                  false,
                                                  false,
                                                  false,
                                                  true,
                                              ],
                                              characterSpacing: 1,
                                              fontSize: 8,
                                              alignment: "right",
                                          },
                                          {
                                              text: formatCurrency(taxaCambio),
                                              border: [true, true, true, true],
                                              alignment: "right",
                                              color: "white",
                                              characterSpacing: 1,
                                              fontSize: 8,
                                              fillColor: "#6e6e6e",
                                          },
                                      ]
                                    : [{ text: "" }, { text: "" }],
                                [
                                    {
                                        text: `Total do Documento em (${moedaPadrao.codigo})`,
                                        border: [false, false, false, true],
                                        characterSpacing: 1,
                                        fontSize: 8,
                                        alignment: "right",
                                    },
                                    {
                                        text: formatCurrency(totalDocumento),
                                        border: [true, true, true, true],
                                        alignment: "right",
                                        color: "white",
                                        characterSpacing: 1,
                                        fontSize: 8,
                                        fillColor: "#6e6e6e",
                                    },
                                ],
                                moedaConversao.codigo != moedaPadrao.codigo
                                    ? [
                                          {
                                              text: `Total do Documento em (${moedaConversao.codigo})`,
                                              border: [
                                                  false,
                                                  false,
                                                  false,
                                                  true,
                                              ],
                                              characterSpacing: 1,
                                              fontSize: 8,
                                              alignment: "right",
                                          },
                                          {
                                              text: formatCurrency(
                                                  valorConversao
                                              ),
                                              border: [true, true, true, true],
                                              alignment: "right",
                                              color: "white",
                                              characterSpacing: 1,
                                              fontSize: 8,
                                              fillColor: "#6e6e6e",
                                          },
                                      ]
                                    : [{ text: "" }, { text: "" }],
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
                            text: "Valor por extenso: " + extenso,
                            border: [true, true, true, true],
                            alignment: "left",
                            characterSpacing: 1,
                            fontSize: 8,
                        },
                    ],
                    "\n",
                    {
                        table: {
                            headerRows: 1,
                            widths: [505],
                            heights: [50],
                            fontsize: [5],
                            body: [
                                [
                                    {
                                        text: `Nota: ${documento.nota}`,
                                        fontSize: 8,
                                        bold: false,
                                        characterSpacing: 1,
                                    },
                                ],
                            ],
                        },
                        layout: {
                            hLineStyle: function (i, node) {
                                return { dash: { length: 1.2, space: 1 } };
                            },
                            vLineStyle: function (i, node) {
                                return { dash: { length: 1.2 } };
                            },
                        },
                    },
                ]);

                count++;
            }
        }

        try {
            await knex("documento").update({ original: true }).where({ id });
        } catch (error) {
            console.log(error);
        }

        const documentData = {
            watermark: {
                text: documento.cancelado ? "CANCELADO" : "",
                angle: -45,
                opacity: 0.2,
            },
            pageSize: "A4",
            defaultStyle: {
                font: "Courier",
            },
            pageMargins: [40, 35, 40, 100],
            content,
            footer: {
                style: "header",
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
                    widths: contaBancaria_width,
                    body: [
                        contaBancariaHeader,
                        contaBancaria_Banco,
                        contaBancaria_Conta,
                        contaBancaria_NIB,
                        contaBancaria_Swift,
                        footerProcessadoPor,
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

export const getRecibo = async (req, res) => {
    const { empresa } = req.user;
    const { id } = req.params;
    const { printOptions = [["original", "true"]] } = req.body;

    const recibo = await knex("recibo").where({ id, empresa }).first();

    if (!recibo) {
        const message = "Recibo não encontrado";
        return handleResponse(req, res, 404, [], message);
    }

    try {
        let total = 0;
        let count = 0;
        const content = [];
        const printer = new pdfPrinter(fonts);
        const reciboItems = await knex("recibo_item").where({
            recibo: recibo.id,
        });
        const pertencenteA = await knex("empresa")
            .where({ id: empresa })
            .first();
        const logotipo = await knex("anexo")
            .where({ id: pertencenteA.logotipo })
            .first();
        const direcionadoA = await knex("cliente")
            .where({ id: recibo.cliente })
            .first();
        const documentos = [];
        const recibosAdiantamento = [];
        const metodosPagamento = await knex("metodo_pagamento_recibo").where({
            recibo: recibo.id,
            removido: false,
        });

        const taxas = await knex("taxa").where({ empresa });
        const moedaPadrao = await knex("moeda")
            .where({ id: pertencenteA.moeda_padrao })
            .first();
        let metodosPagamentos = [];

        for (let i = 0; i < reciboItems.length; i++) {
            if (reciboItems[i].documento) {
                let subTotal = 0;
                let imposto = 0;
                let desconto = 0;
                const docItems = await knex("documento_item").where({
                    documento: reciboItems[i].documento,
                });

                for (let i = 0; i < docItems.length; i++) {
                    const taxa = taxas.find((t) => t.id == docItems[i].taxa);
                    subTotal += taxa.taxa_inclusa
                        ? docItems[i].preco * docItems[i].quantidade -
                          taxa.valor
                        : docItems[i].preco * docItems[i].quantidade;
                    desconto +=
                        (docItems[i].preco * docItems[i].desconto) / 100;
                    imposto +=
                        (docItems[i].preco *
                            docItems[i].quantidade *
                            taxa.valor) /
                        100;
                }

                const total = subTotal + imposto - desconto;
                documentos.push({
                    ...(await knex("documento")
                        .where({ id: reciboItems[i].documento })
                        .first()),
                    total,
                });
            } else {
                recibosAdiantamento.push(
                    await knex("recibo_adiantamento")
                        .where({ id: reciboItems[i].recibo_adiantamento })
                        .first()
                );
            }

            if (reciboItems[i].recibo_adiantamento) {
                total -= reciboItems[i].valor;
            } else {
                total += reciboItems[i].valor;
            }
        }

        for (let i = 0; i < metodosPagamento.length; i++) {
            const metodoPagamento = await knex("metodo_pagamento")
                .where({ id: metodosPagamento[i].metodo_pagamento })
                .first();
            const contaBancaria = await knex("conta_bancaria")
                .where({ id: metodosPagamento[i].conta_bancaria })
                .first();

            metodosPagamentos.push([
                {
                    text: moment(metodosPagamento[i].data_pagamento).format(
                        "DD-M-Y"
                    ),
                    border: [true, true, true, true],
                    characterSpacing: 1,
                    fontSize: 7,
                },
                {
                    text: metodoPagamento.metodo,
                    border: [true, true, true, true],
                    characterSpacing: 1,
                    fontSize: 7,
                },
                {
                    text: metodosPagamento[i].codigo_movimento,
                    border: [true, true, true, true],
                    characterSpacing: 1,
                    fontSize: 7,
                },
                {
                    text: metodosPagamento[i].nome_banco,
                    border: [true, true, true, true],
                    characterSpacing: 1,
                    fontSize: 7,
                },
                {
                    text: contaBancaria.nome_banco,
                    border: [true, true, true, true],
                    characterSpacing: 1,
                    fontSize: 7,
                },
                {
                    text: parseFloat(metodosPagamento[i].valor)
                        .toLocaleString("en-US", {
                            style: "currency",
                            currency: "USD",
                        })
                        .replaceAll("$", ""),
                    border: [true, true, true, true],
                    characterSpacing: 1,
                    fontSize: 7,
                },
            ]);
        }

        let extenso = "";

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
        } catch (error) {}

        for (let i = 0; i < printOptions.length; i++) {
            const [chave, valor] = printOptions[i];

            if (valor) {
                const modeloImpessao = String(chave).toLocaleUpperCase();
                content.push([
                    {
                        pageBreak: count == 0 ? "" : "before",
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
                                    text: modeloImpessao,
                                    normal: true,
                                    bold: false,
                                    fontSize: 10,
                                    characterSpacing: 1,
                                },
                                { text: "\n" },
                                {
                                    text:
                                        "RECIBO # " +
                                        ReciboNumeroDocFormat(recibo),
                                    color: "",
                                    normal: false,
                                    bold: true,
                                    fontSize: 10,
                                    characterSpacing: 1,
                                },
                                {
                                    text:
                                        "Data: " +
                                        moment(recibo.data_emissao).format(
                                            "DD-MM-yyyy"
                                        ),
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
                                        pertencenteA.nuit
                                            ? pertencenteA.nuit
                                            : "-"
                                    }`,
                                    normal: true,
                                    bold: false,
                                    fontSize: 10,
                                    characterSpacing: 1,
                                },
                            ],
                            [
                                {
                                    text: `\n${direcionadoA.nome}`,
                                    color: "",
                                    normal: false,
                                    bold: true,
                                    fontSize: 12,
                                    characterSpacing: 1,
                                },
                                {
                                    text: `\n${
                                        direcionadoA.endereco
                                            ? direcionadoA.endereco
                                            : "Endereço: -"
                                    }`,
                                    normal: true,
                                    bold: false,
                                    fontSize: 10,
                                    characterSpacing: 1,
                                },
                                {
                                    text: `Contacto: ${
                                        direcionadoA.contacto1
                                            ? direcionadoA.contacto1
                                            : "-"
                                    }`,
                                    normal: true,
                                    bold: false,
                                    fontSize: 10,
                                    characterSpacing: 1,
                                },
                                {
                                    text: `E-mail: ${
                                        direcionadoA.email
                                            ? direcionadoA.email
                                            : "-"
                                    }`,
                                    normal: true,
                                    bold: false,
                                    fontSize: 10,
                                    characterSpacing: 1,
                                },
                                {
                                    text: `Nuit: ${
                                        direcionadoA.nuit
                                            ? direcionadoA.nuit
                                            : "-"
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
                            widths: ["*", "*", "*", 108],
                            body: [
                                [
                                    {
                                        text: "Referência",
                                        fillColor: "#f0f0f0",
                                        color: "#000",
                                        border: [true, true, true, true],
                                        characterSpacing: 1,
                                        fontSize: 6.5,
                                        bold: true,
                                    },
                                    {
                                        text: "Data da Factura",
                                        fillColor: "#f0f0f0",
                                        color: "#000",
                                        border: [true, true, true, true],
                                        characterSpacing: 1,
                                        fontSize: 6.5,
                                        bold: true,
                                    },
                                    {
                                        text: `Valor da Factura (${moedaPadrao.codigo})`,
                                        fillColor: "#f0f0f0",
                                        color: "#000",
                                        border: [true, true, true, true],
                                        characterSpacing: 1,
                                        bold: true,
                                        fontSize: 6.5,
                                    },
                                    {
                                        text: `Valor pago (${moedaPadrao.codigo})`,
                                        fillColor: "#f0f0f0",
                                        color: "#000",
                                        border: [true, true, true, true],
                                        characterSpacing: 1,
                                        bold: true,
                                        fontSize: 6.5,
                                    },
                                ],
                                ...reciboItems.map((item) => {
                                    if (item.documento) {
                                        const documento = documentos.find(
                                            (doc) => doc.id == item.documento
                                        );
                                        // valorDocumento += documento.total;

                                        return [
                                            {
                                                text: numeroDocFormat(
                                                    documento
                                                ),
                                                border: [
                                                    true,
                                                    true,
                                                    true,
                                                    true,
                                                ],
                                                characterSpacing: 1,
                                                fontSize: 7,
                                            },
                                            {
                                                text: moment(
                                                    documento.data_emissao
                                                ).format("DD-MM-yyyy"),
                                                border: [
                                                    true,
                                                    true,
                                                    true,
                                                    true,
                                                ],
                                                characterSpacing: 1,
                                                fontSize: 7,
                                            },
                                            {
                                                text: formatCurrency(
                                                    documento.total
                                                ),
                                                border: [
                                                    true,
                                                    true,
                                                    true,
                                                    true,
                                                ],
                                                characterSpacing: 1,
                                                fontSize: 7,
                                            },
                                            {
                                                text: formatCurrency(
                                                    item.valor
                                                ),
                                                border: [
                                                    true,
                                                    true,
                                                    true,
                                                    true,
                                                ],
                                                characterSpacing: 1,
                                                fontSize: 7,
                                            },
                                        ];
                                    }

                                    const reciboAdiantamento =
                                        recibosAdiantamento.find(
                                            (rec) =>
                                                rec.id ==
                                                item.recibo_adiantamento
                                        );
                                    // valorDocumento += reciboAdiantamento.valor;

                                    return [
                                        {
                                            text: ReciboAdNumeroDocFormat(
                                                reciboAdiantamento
                                            ),
                                            border: [true, true, true, true],
                                            characterSpacing: 1,
                                            fontSize: 7,
                                        },
                                        {
                                            text: moment(
                                                reciboAdiantamento.data_emissao
                                            ).format("DD-MM-yyyy"),
                                            border: [true, true, true, true],
                                            characterSpacing: 1,
                                            fontSize: 7,
                                        },
                                        {
                                            text: formatCurrency(
                                                reciboAdiantamento.valor
                                            ),
                                            border: [true, true, true, true],
                                            characterSpacing: 1,
                                            fontSize: 7,
                                        },
                                        {
                                            text: formatCurrency(item.valor),
                                            border: [true, true, true, true],
                                            characterSpacing: 1,
                                            fontSize: 7,
                                        },
                                    ];
                                }),
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
                            widths: ["*", 98],
                            body: [
                                [
                                    {
                                        text: `Total (${moedaPadrao.codigo})`,
                                        border: [false, true, false, true],
                                        alignment: "right",
                                        characterSpacing: 1,
                                        fontSize: 8,
                                    },
                                    {
                                        text: parseFloat(total)
                                            .toLocaleString("en-US", {
                                                style: "currency",
                                                currency: "USD",
                                            })
                                            .replaceAll("$", ""),
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
                    {
                        columns: [
                            { text: "Métodos de Pagamentos:", fontSize: 8 },
                        ],
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
                            widths: [60, 80, 80, 80, "*", 60],
                            body: [
                                [
                                    {
                                        text: "Data",
                                        fillColor: "#f0f0f0",
                                        color: "#000",
                                        border: [true, true, true, true],
                                        characterSpacing: 1,
                                        fontSize: 6.5,
                                        bold: true,
                                    },
                                    {
                                        text: "Tipo",
                                        fillColor: "#f0f0f0",
                                        color: "#000",
                                        border: [true, true, true, true],
                                        characterSpacing: 1,
                                        fontSize: 6.5,
                                        bold: true,
                                    },
                                    {
                                        text: "Operação",
                                        fillColor: "#f0f0f0",
                                        color: "#000",
                                        border: [true, true, true, true],
                                        characterSpacing: 1,
                                        fontSize: 6.5,
                                        bold: true,
                                    },
                                    {
                                        text: "Banco",
                                        fillColor: "#f0f0f0",
                                        color: "#000",
                                        border: [true, true, true, true],
                                        characterSpacing: 1,
                                        fontSize: 6.5,
                                        bold: true,
                                    },
                                    {
                                        text: `C. de Tesouraria`,
                                        fillColor: "#f0f0f0",
                                        color: "#000",
                                        border: [true, true, true, true],
                                        characterSpacing: 1,
                                        bold: true,
                                        fontSize: 6.5,
                                    },
                                    {
                                        text: `Valor `,
                                        fillColor: "#f0f0f0",
                                        color: "#000",
                                        border: [true, true, true, true],
                                        characterSpacing: 1,
                                        bold: true,
                                        fontSize: 6.5,
                                    },
                                ],
                                //METODOS DE PAGAMENTO
                                ...metodosPagamentos,
                            ],
                        },
                    },
                    [
                        {
                            text: "Valor por extenso: " + extenso,
                            border: [true, true, true, true],
                            alignment: "left",
                            characterSpacing: 1,
                            fontSize: 8,
                        },
                    ],
                ]);
                count++;
            }
        }

        const documentData = {
            pageSize: "A4",
            defaultStyle: {
                font: "Courier",
            },
            pageMargins: [40, 35, 40, 80],
            content,
            footer: {
                margin: [20, 50, 20, 0],
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
                        return 1;
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
        console.log(error);
        return handleResponse(req, res, 500, error);
    }
};

export const getReciboAdiantamento = async (req, res) => {
    const { empresa } = req.user;
    const { id } = req.params;
    const { printOptions = [["original", "true"]] } = req.body;

    const reciboAdiantamento = await knex("recibo_adiantamento")
        .where({ id, empresa })
        .first();

    if (!reciboAdiantamento) {
        const message = "Recibo de adiantamento não encontrado.";
        return handleResponse(req, res, 404, [], message);
    }

    try {
        let count = 0;
        const content = [];
        const printer = new pdfPrinter(fonts);
        const pertencenteA = await knex("empresa")
            .where({ id: empresa })
            .first();
        const logotipo = await knex("anexo")
            .where({ id: pertencenteA.logotipo })
            .first();
        const direcionadoA = await knex("cliente")
            .where({ id: reciboAdiantamento.cliente })
            .first();
        const metodoPagamento = await knex("metodo_pagamento")
            .where({ id: reciboAdiantamento.metodo_pagamento })
            .first();
        let extenso = "";
        const moedaPadrao = await knex("moeda")
            .where({ id: pertencenteA.moeda_padrao })
            .first();

        try {
            extenso = numeroPorExtenso.porExtenso(
                reciboAdiantamento.valor,
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
        } catch (error) {}

        for (let i = 0; i < printOptions.length; i++) {
            const [chave, valor] = printOptions[i];

            if (valor) {
                const modeloImpessao = String(chave).toLocaleUpperCase();
                content.push([
                    {
                        pageBreak: count == 0 ? "" : "before",
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
                                    text: modeloImpessao,
                                    normal: true,
                                    bold: false,
                                    fontSize: 10,
                                    characterSpacing: 1,
                                },
                                { text: "\n" },
                                {
                                    text:
                                        "Recibo de Adiantamento # " +
                                        ReciboAdNumeroDocFormat(
                                            reciboAdiantamento
                                        ),
                                    color: "",
                                    normal: false,
                                    bold: true,
                                    fontSize: 10,
                                    characterSpacing: 1,
                                },
                                {
                                    text:
                                        "Data: " +
                                        moment(
                                            reciboAdiantamento.data_added
                                        ).format("DD-MM-yyyy"),
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
                                        pertencenteA.nuit
                                            ? pertencenteA.nuit
                                            : "-"
                                    }`,
                                    normal: true,
                                    bold: false,
                                    fontSize: 10,
                                    characterSpacing: 1,
                                },
                            ],
                            [
                                {
                                    text: `\n${direcionadoA.nome}`,
                                    color: "",
                                    normal: false,
                                    bold: true,
                                    fontSize: 12,
                                    characterSpacing: 1,
                                },
                                {
                                    text: `\n${
                                        direcionadoA.endereco
                                            ? direcionadoA.endereco
                                            : "Endereço: -"
                                    }`,
                                    normal: true,
                                    bold: false,
                                    fontSize: 10,
                                    characterSpacing: 1,
                                },
                                {
                                    text: `Contacto: ${
                                        direcionadoA.contacto1
                                            ? direcionadoA.contacto1
                                            : "-"
                                    }`,
                                    normal: true,
                                    bold: false,
                                    fontSize: 10,
                                    characterSpacing: 1,
                                },
                                {
                                    text: `E-mail: ${
                                        direcionadoA.email
                                            ? direcionadoA.email
                                            : "-"
                                    }`,
                                    normal: true,
                                    bold: false,
                                    fontSize: 10,
                                    characterSpacing: 1,
                                },
                                {
                                    text: `Nuit: ${
                                        direcionadoA.nuit
                                            ? direcionadoA.nuit
                                            : "-"
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
                            widths: ["*", "*", "*"],
                            body: [
                                [
                                    {
                                        text: "Data do documento ",
                                        fillColor: "#f0f0f0",
                                        color: "#000",
                                        border: [true, true, true, true],
                                        characterSpacing: 1,
                                        fontSize: 6.5,
                                        bold: true,
                                    },
                                    {
                                        text: "Descrição",
                                        fillColor: "#f0f0f0",
                                        color: "#000",
                                        border: [true, true, true, true],
                                        characterSpacing: 1,
                                        fontSize: 6.5,
                                        bold: true,
                                    },
                                    {
                                        text: `Valor adiantado (${moedaPadrao.codigo})`,
                                        fillColor: "#f0f0f0",
                                        color: "#000",
                                        border: [true, true, true, true],
                                        characterSpacing: 1,
                                        bold: true,
                                        fontSize: 6.5,
                                    },
                                ],
                                [
                                    {
                                        text: moment(
                                            reciboAdiantamento.data_emissao
                                        ).format("DD-MM-yyyy"),
                                        border: [true, true, true, true],
                                        characterSpacing: 1,
                                        fontSize: 7,
                                    },
                                    {
                                        text: reciboAdiantamento.descricao,
                                        border: [true, true, true, true],
                                        characterSpacing: 1,
                                        fontSize: 7,
                                    },
                                    {
                                        text: reciboAdiantamento.valor,
                                        border: [true, true, true, true],
                                        characterSpacing: 1,
                                        fontSize: 7,
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
                            widths: ["*", 150],
                            body: [
                                [
                                    {
                                        text: `Total (${moedaPadrao.codigo})`,
                                        border: [false, true, false, true],
                                        alignment: "right",
                                        characterSpacing: 1,
                                        fontSize: 8,
                                    },
                                    {
                                        text: formatCurrency(
                                            reciboAdiantamento
                                        ),
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
                            text: "Valor por extenso: " + extenso,
                            border: [true, true, true, true],
                            alignment: "left",
                            characterSpacing: 1,
                            fontSize: 8,
                        },
                    ],
                    { columns: [{ text: "\n" }] },
                    { columns: [{ text: "\n" }] },
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
                            widths: ["*", "*"],
                            body: [
                                [
                                    {
                                        text: `Método do Pagamento:`,
                                        border: [false, true, false, true],
                                        alignment: "right",
                                        characterSpacing: 1,
                                        fontSize: 8,
                                        bold: true,
                                    },
                                    {
                                        text: metodoPagamento.metodo,
                                        border: [true, true, true, true],
                                        alignment: "left",
                                        color: "#000",
                                        characterSpacing: 1,
                                        fontSize: 8,
                                        fillColor: "#f0f0f0",
                                    },
                                ],
                                [
                                    {
                                        text: `Nome do Banco:`,
                                        border: [false, true, false, true],
                                        alignment: "right",
                                        characterSpacing: 1,
                                        fontSize: 8,
                                        bold: true,
                                    },
                                    {
                                        text: reciboAdiantamento.nome_banco
                                            ? reciboAdiantamento.nome_banco
                                            : "-",
                                        border: [true, true, true, true],
                                        alignment: "left",
                                        color: "#000",
                                        characterSpacing: 1,
                                        fontSize: 8,
                                        fillColor: "#f0f0f0",
                                    },
                                ],
                                [
                                    {
                                        text: `Número do Cheque:`,
                                        border: [false, true, false, true],
                                        alignment: "right",
                                        characterSpacing: 1,
                                        fontSize: 8,
                                        bold: true,
                                    },
                                    {
                                        text: reciboAdiantamento.numero_cheque
                                            ? reciboAdiantamento.numero_cheque
                                            : "-",
                                        border: [true, true, true, true],
                                        alignment: "left",
                                        color: "#000",
                                        characterSpacing: 1,
                                        fontSize: 8,
                                        fillColor: "#f0f0f0",
                                    },
                                ],
                                [
                                    {
                                        text: `Código de Movimento:`,
                                        border: [false, true, false, true],
                                        alignment: "right",
                                        characterSpacing: 1,
                                        fontSize: 8,
                                        bold: true,
                                    },
                                    {
                                        text: reciboAdiantamento.codigo_movimento
                                            ? reciboAdiantamento.codigo_movimento
                                            : "-",
                                        border: [true, true, true, true],
                                        alignment: "left",
                                        color: "#000",
                                        characterSpacing: 1,
                                        fontSize: 8,
                                        fillColor: "#f0f0f0",
                                    },
                                ],
                            ],
                        },
                    },
                ]);
                count++;
            }
        }
        const documentData = {
            pageSize: "A4",
            defaultStyle: {
                font: "Courier",
            },
            pageMargins: [40, 35, 40, 80],
            content,
            footer: {
                margin: [20, 50, 20, 0],
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
                        return 1;
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

export const getPagamentoFornecedor = async (req, res) => {
    const { empresa } = req.user;
    const { id } = req.params;
    const { printOptions = [["original", "true"]] } = req.body;

    const pagamentoFornecedor = await knex("pagamento_fornecedor")
        .where({ id, empresa })
        .first();

    if (!pagamentoFornecedor) {
        const message = "Pagamento ao fornecedor não encontrado.";
        return handleResponse(req, res, 404, [], message);
    }

    try {
        let extenso = "";
        let total = 0;
        let count = 0;
        let valorDocumento = 0;
        const content = [];
        const printer = new pdfPrinter(fonts);
        const pagamentoItems = await knex("pagamento_fornecedor_item").where({
            pagamento_fornecedor: pagamentoFornecedor.id,
        });
        const pertencenteA = await knex("empresa")
            .where({ id: empresa })
            .first();
        const logotipo = await knex("anexo")
            .where({ id: pertencenteA.logotipo })
            .first();
        const direcionadoA = await knex("fornecedor")
            .where({ id: pagamentoFornecedor.fornecedor })
            .first();
        const documentos = [];
        const adiantamentoFornecedores = [];
        const metodosPagamento = await knex(
            "metodo_pagamento_fornecedor"
        ).where({
            pagamento_fornecedor: pagamentoFornecedor.id,
            removido: false,
        });
        const taxas = await knex("taxa").where({ empresa });
        const moedaPadrao = await knex("moeda")
            .where({ id: pertencenteA.moeda_padrao })
            .first();
        let metodosPagamentos = [];

        for (let i = 0; i < pagamentoItems.length; i++) {
            if (pagamentoItems[i].documento) {
                let subTotal = 0;
                let imposto = 0;
                let desconto = 0;
                const docItems = await knex("documento_item").where({
                    documento: pagamentoItems[i].documento,
                });

                for (let i = 0; i < docItems.length; i++) {
                    const taxa = taxas.find((t) => t.id == docItems[i].taxa);
                    subTotal += taxa.taxa_inclusa
                        ? docItems[i].preco * docItems[i].quantidade -
                          taxa.valor
                        : docItems[i].preco * docItems[i].quantidade;
                    desconto +=
                        (docItems[i].preco * docItems[i].desconto) / 100;
                    imposto +=
                        (docItems[i].preco *
                            docItems[i].quantidade *
                            taxa.valor) /
                        100;
                }

                const total = subTotal + imposto - desconto;
                documentos.push({
                    ...(await knex("documento")
                        .where({ id: pagamentoItems[i].documento })
                        .first()),
                    total,
                });
            } else {
                adiantamentoFornecedores.push(
                    await knex("adiantamento_fornecedor")
                        .where({
                            id: pagamentoItems[i].adiantamento_fornecedor,
                        })
                        .first()
                );
            }
            total += pagamentoItems[i].valor;
        }

        for (let i = 0; i < metodosPagamento.length; i++) {
            const metodoPagamento = await knex("metodo_pagamento")
                .where({ id: metodosPagamento[i].metodo_pagamento })
                .first();
            const contaBancaria = await knex("conta_bancaria")
                .where({ id: metodosPagamento[i].conta_bancaria })
                .first();

            metodosPagamentos.push([
                {
                    text: moment(metodosPagamento[i].data_pagamento).format(
                        "DD-M-Y"
                    ),
                    border: [true, true, true, true],
                    characterSpacing: 1,
                    fontSize: 7,
                },
                {
                    text: metodoPagamento.metodo,
                    border: [true, true, true, true],
                    characterSpacing: 1,
                    fontSize: 7,
                },
                {
                    text: metodosPagamento[i].codigo_movimento,
                    border: [true, true, true, true],
                    characterSpacing: 1,
                    fontSize: 7,
                },
                {
                    text: metodosPagamento[i].nome_banco,
                    border: [true, true, true, true],
                    characterSpacing: 1,
                    fontSize: 7,
                },
                {
                    text: contaBancaria.nome_banco,
                    border: [true, true, true, true],
                    characterSpacing: 1,
                    fontSize: 7,
                },
                {
                    text: parseFloat(metodosPagamento[i].valor)
                        .toLocaleString("en-US", {
                            style: "currency",
                            currency: "USD",
                        })
                        .replaceAll("$", ""),
                    border: [true, true, true, true],
                    characterSpacing: 1,
                    fontSize: 7,
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
        } catch (error) {}

        for (let i = 0; i < printOptions.length; i++) {
            const [chave, valor] = printOptions[i];

            if (valor) {
                const modeloImpessao = String(chave).toLocaleUpperCase();
                content.push([
                    {
                        pageBreak: count == 0 ? "" : "before",
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
                                    text: modeloImpessao,
                                    normal: true,
                                    bold: false,
                                    fontSize: 10,
                                    characterSpacing: 1,
                                },
                                { text: "\n" },
                                {
                                    text:
                                        "Pagamento ao Fornecedor # " +
                                        PagamentoFornecedorNumeroDocFormar(
                                            pagamentoFornecedor
                                        ),
                                    color: "",
                                    normal: false,
                                    bold: true,
                                    fontSize: 10,
                                    characterSpacing: 1,
                                },
                                {
                                    text:
                                        "Data: " +
                                        moment(
                                            pagamentoFornecedor.data_emissao
                                        ).format("DD-MM-yyyy"),
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
                                        pertencenteA.nuit
                                            ? pertencenteA.nuit
                                            : "-"
                                    }`,
                                    normal: true,
                                    bold: false,
                                    fontSize: 10,
                                    characterSpacing: 1,
                                },
                            ],
                            [
                                {
                                    text: `\n${direcionadoA.nome}`,
                                    color: "",
                                    normal: false,
                                    bold: true,
                                    fontSize: 12,
                                    characterSpacing: 1,
                                },
                                {
                                    text: `\n${
                                        direcionadoA.endereco
                                            ? direcionadoA.endereco
                                            : "Endereço: -"
                                    }`,
                                    normal: true,
                                    bold: false,
                                    fontSize: 10,
                                    characterSpacing: 1,
                                },
                                {
                                    text: `Contacto: ${
                                        direcionadoA.contacto1
                                            ? direcionadoA.contacto1
                                            : "-"
                                    }`,
                                    normal: true,
                                    bold: false,
                                    fontSize: 10,
                                    characterSpacing: 1,
                                },
                                {
                                    text: `E-mail: ${
                                        direcionadoA.email
                                            ? direcionadoA.email
                                            : "-"
                                    }`,
                                    normal: true,
                                    bold: false,
                                    fontSize: 10,
                                    characterSpacing: 1,
                                },
                                {
                                    text: `Nuit: ${
                                        direcionadoA.nuit
                                            ? direcionadoA.nuit
                                            : "-"
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
                            widths: ["*", "*", "*", 108],
                            body: [
                                [
                                    {
                                        text: "Referência",
                                        fillColor: "#f0f0f0",
                                        color: "#000",
                                        border: [true, true, true, true],
                                        characterSpacing: 1,
                                        fontSize: 6.5,
                                        bold: true,
                                    },
                                    {
                                        text: "Data da Factura",
                                        fillColor: "#f0f0f0",
                                        color: "#000",
                                        border: [true, true, true, true],
                                        characterSpacing: 1,
                                        fontSize: 6.5,
                                        bold: true,
                                    },
                                    {
                                        text: `Valor da Fatura (${moedaPadrao.codigo})`,
                                        fillColor: "#f0f0f0",
                                        color: "#000",
                                        border: [true, true, true, true],
                                        characterSpacing: 1,
                                        bold: true,
                                        fontSize: 6.5,
                                    },
                                    {
                                        text: `Valor pago (${moedaPadrao.codigo})`,
                                        fillColor: "#f0f0f0",
                                        color: "#000",
                                        border: [true, true, true, true],
                                        characterSpacing: 1,
                                        bold: true,
                                        fontSize: 6.5,
                                    },
                                ],
                                ...pagamentoItems.map((item) => {
                                    if (item.documento) {
                                        const documento = documentos.find(
                                            (doc) => doc.id == item.documento
                                        );
                                        valorDocumento += documento.total;

                                        return [
                                            {
                                                text: numeroDocFormat(
                                                    documento
                                                ),
                                                border: [
                                                    true,
                                                    true,
                                                    true,
                                                    true,
                                                ],
                                                characterSpacing: 1,
                                                fontSize: 7,
                                            },
                                            {
                                                text: moment(
                                                    documento.data_emissao
                                                ).format("DD-MM-yyyy"),
                                                border: [
                                                    true,
                                                    true,
                                                    true,
                                                    true,
                                                ],
                                                characterSpacing: 1,
                                                fontSize: 7,
                                            },
                                            {
                                                text: formatCurrency(
                                                    documento.total
                                                ),
                                                border: [
                                                    true,
                                                    true,
                                                    true,
                                                    true,
                                                ],
                                                characterSpacing: 1,
                                                fontSize: 7,
                                            },
                                            {
                                                text: item.valor,
                                                border: [
                                                    true,
                                                    true,
                                                    true,
                                                    true,
                                                ],
                                                characterSpacing: 1,
                                                fontSize: 7,
                                            },
                                        ];
                                    }

                                    const adiantamentoFornecedor =
                                        adiantamentoFornecedores.find(
                                            (rec) =>
                                                rec.id ==
                                                item.adiantamento_fornecedor
                                        );
                                    valorDocumento +=
                                        adiantamentoFornecedor.valor;

                                    return [
                                        {
                                            text: ReciboAdFornecedorNumeroDocFormat(
                                                adiantamentoFornecedor
                                            ),
                                            border: [true, true, true, true],
                                            characterSpacing: 1,
                                            fontSize: 7,
                                        },
                                        {
                                            text: moment(
                                                adiantamentoFornecedor.data_emissao
                                            ).format("DD-MM-yyyy"),
                                            border: [true, true, true, true],
                                            characterSpacing: 1,
                                            fontSize: 7,
                                        },
                                        {
                                            text: adiantamentoFornecedor.valor,
                                            border: [true, true, true, true],
                                            characterSpacing: 1,
                                            fontSize: 7,
                                        },
                                        {
                                            text: item.valor,
                                            border: [true, true, true, true],
                                            characterSpacing: 1,
                                            fontSize: 7,
                                        },
                                    ];
                                }),
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
                            widths: ["*", 98],
                            body: [
                                [
                                    {
                                        text: `Total (${moedaPadrao.codigo})`,
                                        border: [false, true, false, true],
                                        alignment: "right",
                                        characterSpacing: 1,
                                        fontSize: 8,
                                    },
                                    {
                                        text: formatCurrency(total),
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
                    {
                        columns: [
                            { text: "Métodos de Pagamentos:", fontSize: 8 },
                        ],
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
                            widths: [60, 80, 80, 80, "*", 60],
                            body: [
                                [
                                    {
                                        text: "Data",
                                        fillColor: "#f0f0f0",
                                        color: "#000",
                                        border: [true, true, true, true],
                                        characterSpacing: 1,
                                        fontSize: 6.5,
                                        bold: true,
                                    },
                                    {
                                        text: "Tipo",
                                        fillColor: "#f0f0f0",
                                        color: "#000",
                                        border: [true, true, true, true],
                                        characterSpacing: 1,
                                        fontSize: 6.5,
                                        bold: true,
                                    },
                                    {
                                        text: "Operacão",
                                        fillColor: "#f0f0f0",
                                        color: "#000",
                                        border: [true, true, true, true],
                                        characterSpacing: 1,
                                        fontSize: 6.5,
                                        bold: true,
                                    },
                                    {
                                        text: "Banco",
                                        fillColor: "#f0f0f0",
                                        color: "#000",
                                        border: [true, true, true, true],
                                        characterSpacing: 1,
                                        fontSize: 6.5,
                                        bold: true,
                                    },
                                    {
                                        text: `C. de Tesouraria`,
                                        fillColor: "#f0f0f0",
                                        color: "#000",
                                        border: [true, true, true, true],
                                        characterSpacing: 1,
                                        bold: true,
                                        fontSize: 6.5,
                                    },
                                    {
                                        text: `Valor `,
                                        fillColor: "#f0f0f0",
                                        color: "#000",
                                        border: [true, true, true, true],
                                        characterSpacing: 1,
                                        bold: true,
                                        fontSize: 6.5,
                                    },
                                ],
                                //METODOS DE PAGAMENTO
                                ...metodosPagamentos,
                            ],
                        },
                    },
                    [
                        {
                            text: "Valor por extenso: " + extenso,
                            border: [true, true, true, true],
                            alignment: "left",
                            characterSpacing: 1,
                            fontSize: 8,
                        },
                    ],
                ]);
            }
        }

        const documentData = {
            pageSize: "A4",
            defaultStyle: {
                font: "Courier",
            },
            pageMargins: [40, 35, 40, 80],
            content,
            footer: {
                margin: [20, 50, 20, 0],
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
                        return 1;
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

export const getAdiantamentoFornecedor = async (req, res) => {
    const { empresa } = req.user;
    const { id } = req.params;
    const { printOptions = [["original", "true"]] } = req.body;

    const adiantamentoFornecedor = await knex("adiantamento_fornecedor")
        .where({ id, empresa })
        .first();

    if (!adiantamentoFornecedor) {
        const message = "Adiantamento ao Fornecedor não encontrado.";
        return handleResponse(req, res, 404, [], message);
    }

    try {
        let count = 0;
        const content = [];
        const printer = new pdfPrinter(fonts);
        const pertencenteA = await knex("empresa")
            .where({ id: empresa })
            .first();
        const logotipo = await knex("anexo")
            .where({ id: pertencenteA.logotipo })
            .first();
        const direcionadoA = await knex("fornecedor")
            .where({ id: adiantamentoFornecedor.fornecedor })
            .first();
        const metodoPagamento = await knex("metodo_pagamento")
            .where({ id: adiantamentoFornecedor.metodo_pagamento })
            .first();
        let extenso = "";
        const moedaPadrao = await knex("moeda")
            .where({ id: pertencenteA.moeda_padrao })
            .first();
        // (${moedaPadrao.codigo})
        try {
            extenso = numeroPorExtenso.porExtenso(
                adiantamentoFornecedor.valor,
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
        } catch (error) {}

        for (let i = 0; i < printOptions.length; i++) {
            const [chave, valor] = printOptions[i];

            if (valor) {
                const modeloImpessao = String(chave).toLocaleUpperCase();
                content.push([
                    {
                        pageBreak: count == 0 ? "" : "before",
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
                                    text: modeloImpessao,
                                    normal: true,
                                    bold: false,
                                    fontSize: 10,
                                    characterSpacing: 1,
                                },
                                { text: "\n" },
                                {
                                    text: "Recibo de Adiantamento # ",
                                    color: "",
                                    normal: false,
                                    bold: true,
                                    fontSize: 10,
                                    characterSpacing: 1,
                                },
                                {
                                    text:
                                        "Data: " +
                                        moment(
                                            adiantamentoFornecedor.data_added
                                        ).format("DD-MM-yyyy"),
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
                                        pertencenteA.nuit
                                            ? pertencenteA.nuit
                                            : "-"
                                    }`,
                                    normal: true,
                                    bold: false,
                                    fontSize: 10,
                                    characterSpacing: 1,
                                },
                            ],
                            [
                                {
                                    text: `\n${direcionadoA.nome}`,
                                    color: "",
                                    normal: false,
                                    bold: true,
                                    fontSize: 12,
                                    characterSpacing: 1,
                                },
                                {
                                    text: `\n${
                                        direcionadoA.endereco
                                            ? direcionadoA.endereco
                                            : "Endereço: -"
                                    }`,
                                    normal: true,
                                    bold: false,
                                    fontSize: 10,
                                    characterSpacing: 1,
                                },
                                {
                                    text: `Contacto: ${
                                        direcionadoA.contacto1
                                            ? direcionadoA.contacto1
                                            : "-"
                                    }`,
                                    normal: true,
                                    bold: false,
                                    fontSize: 10,
                                    characterSpacing: 1,
                                },
                                {
                                    text: `E-mail: ${
                                        direcionadoA.email
                                            ? direcionadoA.email
                                            : "-"
                                    }`,
                                    normal: true,
                                    bold: false,
                                    fontSize: 10,
                                    characterSpacing: 1,
                                },
                                {
                                    text: `Nuit: ${
                                        direcionadoA.nuit
                                            ? direcionadoA.nuit
                                            : "-"
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
                            widths: ["*", "*", "*"],
                            body: [
                                [
                                    {
                                        text: "Data do documento ",
                                        fillColor: "#f0f0f0",
                                        color: "#000",
                                        border: [true, true, true, true],
                                        characterSpacing: 1,
                                        fontSize: 6.5,
                                        bold: true,
                                    },
                                    {
                                        text: "Descrição",
                                        fillColor: "#f0f0f0",
                                        color: "#000",
                                        border: [true, true, true, true],
                                        characterSpacing: 1,
                                        fontSize: 6.5,
                                        bold: true,
                                    },
                                    {
                                        text: `Valor adiantado (${moedaPadrao.codigo})`,
                                        fillColor: "#f0f0f0",
                                        color: "#000",
                                        border: [true, true, true, true],
                                        characterSpacing: 1,
                                        bold: true,
                                        fontSize: 6.5,
                                    },
                                ],
                                [
                                    {
                                        text: moment(
                                            adiantamentoFornecedor.data_emissao
                                        ).format("DD-MM-yyyy"),
                                        border: [true, true, true, true],
                                        characterSpacing: 1,
                                        fontSize: 7,
                                    },
                                    {
                                        text: adiantamentoFornecedor.descricao,
                                        border: [true, true, true, true],
                                        characterSpacing: 1,
                                        fontSize: 7,
                                    },
                                    {
                                        text: adiantamentoFornecedor.valor,
                                        border: [true, true, true, true],
                                        characterSpacing: 1,
                                        fontSize: 7,
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
                            widths: ["*", 150],
                            body: [
                                [
                                    {
                                        text: `Total (${moedaPadrao.codigo})`,
                                        border: [false, true, false, true],
                                        alignment: "right",
                                        characterSpacing: 1,
                                        fontSize: 8,
                                    },
                                    {
                                        text: formatCurrency(
                                            adiantamentoFornecedor.valor
                                        ),
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
                            text: "Valor por extenso: " + extenso,
                            border: [true, true, true, true],
                            alignment: "left",
                            characterSpacing: 1,
                            fontSize: 8,
                        },
                    ],
                    { columns: [{ text: "\n" }] },
                    { columns: [{ text: "\n" }] },
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
                            widths: ["*", "*"],
                            body: [
                                [
                                    {
                                        text: `Método do Pagamento:`,
                                        border: [false, true, false, true],
                                        alignment: "right",
                                        characterSpacing: 1,
                                        fontSize: 8,
                                        bold: true,
                                    },
                                    {
                                        text: metodoPagamento.metodo,
                                        border: [true, true, true, true],
                                        alignment: "left",
                                        color: "#000",
                                        characterSpacing: 1,
                                        fontSize: 8,
                                        fillColor: "#f0f0f0",
                                    },
                                ],
                                [
                                    {
                                        text: `Nome do Banco:`,
                                        border: [false, true, false, true],
                                        alignment: "right",
                                        characterSpacing: 1,
                                        fontSize: 8,
                                        bold: true,
                                    },
                                    {
                                        text: adiantamentoFornecedor.nome_banco
                                            ? adiantamentoFornecedor.nome_banco
                                            : "-",
                                        border: [true, true, true, true],
                                        alignment: "left",
                                        color: "#000",
                                        characterSpacing: 1,
                                        fontSize: 8,
                                        fillColor: "#f0f0f0",
                                    },
                                ],
                                [
                                    {
                                        text: `Número do Cheque:`,
                                        border: [false, true, false, true],
                                        alignment: "right",
                                        characterSpacing: 1,
                                        fontSize: 8,
                                        bold: true,
                                    },
                                    {
                                        text: adiantamentoFornecedor.numero_cheque
                                            ? adiantamentoFornecedor.numero_cheque
                                            : "-",
                                        border: [true, true, true, true],
                                        alignment: "left",
                                        color: "#000",
                                        characterSpacing: 1,
                                        fontSize: 8,
                                        fillColor: "#f0f0f0",
                                    },
                                ],
                                [
                                    {
                                        text: `Código de Movimento:`,
                                        border: [false, true, false, true],
                                        alignment: "right",
                                        characterSpacing: 1,
                                        fontSize: 8,
                                        bold: true,
                                    },
                                    {
                                        text: adiantamentoFornecedor.codigo_movimento
                                            ? adiantamentoFornecedor.codigo_movimento
                                            : "-",
                                        border: [true, true, true, true],
                                        alignment: "left",
                                        color: "#000",
                                        characterSpacing: 1,
                                        fontSize: 8,
                                        fillColor: "#f0f0f0",
                                    },
                                ],
                            ],
                        },
                    },
                ]);
                count++;
            }
        }
        const documentData = {
            pageSize: "A4",
            defaultStyle: {
                font: "Courier",
            },
            pageMargins: [40, 35, 40, 80],
            content,
            footer: {
                margin: [20, 50, 20, 0],
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
                        return 1;
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

const documentoDirecionadoA = async (categoria, documento) => {
    if (categoria == 0)
        return await knex("cliente").where({ id: documento.cliente }).first();

    if (categoria == 1)
        return await knex("fornecedor")
            .where({ id: documento.fornecedor })
            .first();

    if (categoria == 2)
        return await knex("entidade").where({ id: documento.entidade }).first();
};

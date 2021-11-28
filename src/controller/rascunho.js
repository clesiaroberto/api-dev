import knex from "../database";
import { handleResponse } from "../utils/handleResponse";
import pdfPrinter from "pdfmake/src/printer";
import path from "path";

export const getPdf = async (req, res) => {
    // #swagger.tags = ['Pdf']
    // #swagger.description = 'Impressão de Pdf.'

    const { id } = req.params;
    const tablename = "documento";

    const document = await knex(tablename)
        .where({ id, removido: false })
        .first();

    const doctItem = await knex("documento_item").where({
        documento: id,
        removido: false,
    });

    let descricao = [];

    const cliente = await knex("cliente")
        .where({ id: document.cliente, removido: false })
        .first();

    const empresa = await knex("empresa")
        .where({ id: document.empresa })
        .first();

    for (let v = 0; v < doctItem.length; v++) {
        descricao.push([doctItem[v].descricao]);
    }

    var fonts = {
        Roboto: {
            normal: path.resolve("src/fonts/Roboto-Regular.ttf"),
            bold: path.resolve("src/fonts/Roboto-Medium.ttf"),
            italics: path.resolve("src/fonts/Roboto-Italic.ttf"),
            bolditalics: path.resolve("src/fonts/Roboto-MediumItalic.ttf"),
        },
    };

    var printer = new pdfPrinter(fonts);

    var dd = {
        // pageSize: "LEGAL",
        // pageOrientation: "portrait",

        content: [
            {
                style: "header",
                alignment: "justify",
                columns: [
                    {
                        alignment: "justify",

                        image: path.resolve("src/img/logo.png"),
                        fit: [50, 50],
                    },
                    {
                        alignment: "justify",

                        image: path.resolve("src/img/logo.png"),
                        fit: [50, 50],
                    },
                ],
            },
            {
                columns: [
                    {
                        alignment: "justify",
                        style: "header",
                        text: `${document.empresa}\n`,
                        color: "",
                        normal: true,
                        bold: true,
                        fontSize: 10,
                        characterSpacing: 1.5,
                        alignment: "left",
                        margin: [0, 20, 0, 5],
                        //#aaaaab
                    },
                    {
                        style: "header",
                        text: `Factura a: \n`,
                        color: "",
                        bold: true,
                        normal: true,
                        fontSize: 10,
                        characterSpacing: 1.5,
                        alignment: "left",
                        margin: [0, 20, 0, 5],
                    },
                ],
            },
            {
                columns: [
                    {
                        style: "header",
                        text: `Endereço: ${document.endereco}\n  Email: ${empresa.email}\n  Telef: ${empresa.contacto1}\n Nuit:${empresa.nuit} \n Província, Moçambique`,
                        bold: "",
                        color: "#333333",
                        alignment: "left",
                        characterSpacing: 1.5,
                        // characterSpacing: 0.5,
                        lineHeight: 1,
                        fontSize: 8,
                    },

                    {
                        text: `${document.cliente} \n  Endereço: ${cliente.endereco}\n  MZ \n Nuit: ${cliente.nuit}}\n `,
                        bold: "",
                        color: "#333333",
                        characterSpacing: 1.5,
                        alignment: "left",
                        lineHeight: 1,
                        fontSize: 8,
                    },
                ],
            },
            "\n\n\n",
            {
                alignment: "justify",
                columns: [
                    [
                        {
                            text: "Factura",
                            fontSize: 14,
                            bold: true,
                        },
                        { text: "Factura # Nr", fontSize: 8 },
                    ],

                    [
                        {
                            text: "Data da Factura: ",
                            fontSize: 8,
                            bold: true,
                            characterSpacing: 1.5,
                        },
                        {
                            text: "Data de Vencimento:",
                            fontSize: 8,
                            bold: true,
                            characterSpacing: 1.5,
                        },
                    ],
                ],
            },

            {
                layout: {
                    defaultBorder: false,
                    hLineWidth: function (i, node) {
                        return 1;
                    },
                    vLineWidth: function (i, node) {
                        return 0.3;
                    },
                    hLineColor: function (i, node) {
                        if (i === 1 || i === 0) {
                            return "white";
                        }
                        return "lightgrey";
                    },
                    hLineWidth: function (i, node) {
                        return 0.3;
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
                        return 2;
                    },
                    paddingBottom: function (i, node) {
                        return 2;
                    },
                    fillColor: function (rowIndex, node, columnIndex) {
                        return "white";
                    },
                },
                table: {
                    headerRows: 1,
                    widths: [0.1, 150, 25, 40, 46, 60, 50],
                    heights: [5, 5, 5, 5, 5, 5],
                    body: [
                        [
                            {
                                text: "",
                                fillColor: "#6e6e6e",
                                color: "white",
                                fontSize: 6.5,
                                characterSpacing: 1.5,
                                border: [true, true, true, true],
                                textTransform: "uppercase",
                            },
                            {
                                text: "Descrição",
                                fillColor: "#6e6e6e",
                                color: "white",
                                fontSize: 6.5,
                                characterSpacing: 1.5,
                                border: [true, true, true, true],
                                textTransform: "uppercase",
                            },
                            {
                                text: "Quant",
                                border: [true, true, true, true],
                                alignment: "right",
                                color: "white",
                                fontSize: 6.5,
                                fillColor: "#6e6e6e",
                                characterSpacing: 1.5,
                                textTransform: "uppercase",
                            },
                            {
                                text: "Preço($)",
                                border: [true, true, true, true],
                                alignment: "right",
                                fontSize: 6.5,
                                color: "white",
                                fillColor: "#6e6e6e",
                                characterSpacing: 1.5,
                                textTransform: "uppercase",
                            },
                            {
                                text: "Imposto(%)",
                                border: [true, true, true, true],
                                alignment: "right",
                                fontSize: 6.5,
                                color: "white",
                                fillColor: "#6e6e6e",
                                characterSpacing: 1.5,
                                textTransform: "uppercase",
                            },
                            {
                                text: "Desconto(%)",
                                border: [true, true, true, true],
                                alignment: "right",
                                fontSize: 6.5,
                                color: "white",
                                fillColor: "#6e6e6e",
                                characterSpacing: 1.5,
                                textTransform: "uppercase",
                            },
                            {
                                text: "Valor(%)",
                                border: [true, true, true, true],
                                alignment: "right",
                                characterSpacing: 1.5,
                                fontSize: 6.5,
                                color: "white",
                                fillColor: "#6e6e6e",
                                textTransform: "uppercase",
                            },
                        ],
                        [
                            {
                                text: ``,
                                border: [false, false, false, true],
                                fontSize: 6.5,
                                characterSpacing: 1.5,
                                alignment: "left",
                            },
                            {
                                text: `${descricao}`,
                                border: [false, false, false, true],
                                fontSize: 6.5,
                                characterSpacing: 1.5,
                                alignment: "left",
                                pageBreak: "after",
                            },
                            {
                                border: [false, false, false, true],
                                text: "",
                                fillColor: "",
                                alignment: "right",
                                fontSize: 6.5,
                                characterSpacing: 1.5,
                            },
                            {
                                border: [false, false, false, true],
                                text: "",
                                fillColor: "",
                                alignment: "right",
                                fontSize: 6.5,
                                characterSpacing: 1.5,
                            },
                            {
                                border: [false, false, false, true],
                                text: "",
                                fillColor: "",
                                fontSize: 6.5,
                                alignment: "right",
                                characterSpacing: 1.5,
                            },
                            {
                                border: [false, false, false, true],
                                text: "",
                                fillColor: "",
                                fontSize: 6.5,
                                alignment: "right",
                                characterSpacing: 1.5,
                            },
                            {
                                border: [false, false, false, true],
                                text: "",
                                fillColor: "",
                                fontSize: 6.5,
                                alignment: "right",
                                characterSpacing: 1.5,
                            },
                        ],
                    ],
                },
            },
            "",
            "",
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
                    hLineWidth: function (i, node) {
                        return 1.5;
                    },
                },
                table: {
                    headerRows: 1,
                    widths: ["*", 50],
                    body: [
                        [
                            {
                                text: "Subtotal(MT)",
                                border: [false, true, false, true],
                                alignment: "right",
                                bold: true,
                                fontSize: 6.5,
                                characterSpacing: 1.5,
                            },
                            {
                                text: " ",
                                border: [true, true, true, true],
                                alignment: "right",
                                color: "white",
                                fontSize: 6.5,
                                characterSpacing: 1.5,
                                fillColor: "#6e6e6e",
                            },
                        ],
                        [
                            {
                                text: "Imposto",
                                border: [false, false, false, true],
                                alignment: "right",
                                bold: true,
                                fontSize: 6.5,
                                characterSpacing: 1.5,
                            },
                            {
                                text: "",
                                border: [true, true, true, true],
                                alignment: "right",
                                color: "white",
                                fontSize: 6.5,
                                characterSpacing: 1.5,
                                fillColor: "#6e6e6e",
                            },
                        ],
                        [
                            {
                                text: "Preço Total (MT)",
                                border: [false, false, false, true],
                                bold: true,
                                fontSize: 6.5,
                                characterSpacing: 1.5,
                                alignment: "right",
                            },
                            {
                                text: "",
                                border: [true, true, true, true],
                                alignment: "right",
                                color: "white",
                                characterSpacing: 1.5,
                                fontSize: 6.5,
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
                            lineColor: "black",
                            type: "line",
                            x1: 0,
                            y1: 0.1,
                            x2: 515,
                            y2: 0.3,
                            lineWidth: 1,
                            lineHeight: 0.3,
                        },
                    ],
                },
                {
                    canvas: [
                        {
                            type: "line",
                            lineColor: "black",
                            x1: 0,
                            y1: 0.1,
                            x2: 515,
                            y2: 0.3,
                            lineWidth: 1,
                            lineHeight: 0.3,
                        },
                    ],
                },
            ],

            // [
            //     {
            //         text: "Valor por Extenso:",
            //         border: [true, true, true, true],
            //         alignment: "left",
            //         characterSpacing: 1.5,
            //         color: "#000",
            //         bold: true,
            //         fillColor: "#6e6e6e",
            //         fontSize: 9,
            //         margin: [0, 5, 0, 5],
            //     },
            // ],
            "\n",
            // {
            //     table: {
            //         style: "table1",
            //         headerRows: 1,
            //         widths: [505],
            //         heights: [50],
            //         fontsize: [5],
            //         body: [
            //             [
            //                 {
            //                     text: "Observações:",
            //                     fontSize: 9,
            //                     bold: true,
            //                     characterSpacing: 1.5,
            //                 },
            //             ],
            //         ],
            //     },
            //     layout: {
            //         hLineStyle: function (i, node) {
            //             return { dash: { length: 1.2, space: 1.5 } };
            //         },
            //         vLineStyle: function (i, node) {
            //             return { dash: { length: 1.2 } };
            //         },
            //     },
            // },
            "\n\n\n\n",

            ,
            [
                {
                    alignment: "justify",

                    image: path.resolve("src/img/logo.png"),
                    fit: [30, 30],
                },
            ],
            "\n",
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
                        return 10;
                    },
                    paddingRight: function (i, node) {
                        return 10;
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
                    widths: [240, 240],

                    body: [
                        [
                            {
                                text: "Nome do Banco",
                                fillColor: "#6e6e6e",
                                color: "white",
                                border: [true, true, true, true],
                                alignment: "left",
                                characterSpacing: 1.5,
                                bold: true,
                                fontSize: 6.5,
                            },
                            {
                                text: "Nome do Banco",
                                fillColor: "#6e6e6e",
                                color: "white",
                                border: [true, true, true, true],
                                alignment: "left",
                                characterSpacing: 1.5,
                                bold: true,
                                fontSize: 6.5,
                            },
                        ],

                        [
                            {
                                text: "Nr. da conta",
                                border: [false, false, false, true],
                                bold: true,
                                fontSize: 6.5,
                                alignment: "left",
                                characterSpacing: 1.5,
                            },
                            {
                                text: "Nib",
                                border: [false, false, false, true],
                                bold: true,
                                characterSpacing: 1.5,
                                fontSize: 6.5,
                                alignment: "left",
                            },
                        ],
                        [
                            {
                                text: "Nr. da conta",
                                border: [false, false, false, false],
                                bold: true,
                                characterSpacing: 1.5,
                                fontSize: 6.5,
                                alignment: "left",
                            },
                            {
                                text: "Nib",
                                border: [false, false, false, false],
                                bold: true,
                                characterSpacing: 1.5,
                                fontSize: 6.5,
                                alignment: "left",
                            },
                        ],
                    ],
                },
            },

            {
                canvas: [
                    {
                        lineColor: "",
                        type: "line",
                        lineColor: "black",
                        x1: 0,
                        y1: 0.1,
                        x2: 520,
                        y2: 0.3,
                        lineWidth: 1,
                        lineHeight: 0.3,
                    },
                ],
            },
            {
                canvas: [
                    {
                        type: "line",
                        lineColor: "black",
                        x1: 0,
                        y1: 0.1,
                        x2: 520,
                        y2: 0.3,
                        lineWidth: 1,
                        lineHeight: 0.3,
                    },
                ],
            },

            {
                style: "header",
                alignment: "justify",
                columns: [
                    {
                        text: "Documento processdo por computador",
                        fontSize: 6,
                        characterSpacing: 1.5,
                        color: "#000",
                        bold: true,
                    },
                    {
                        text: "Licenciado a : ",
                        fontSize: 6,
                        characterSpacing: 1.5,
                        color: "#000",
                        bold: true,
                    },
                ],
            },
        ],

        styles: {
            notesTitle: {
                fontSize: 10,
                bold: true,
                margin: [0, 50, 0, 3],
            },
            notesText: {
                fontSize: 10,
            },
        },
        defaultStyle: {
            columnGap: 20,
            //font: 'Quicksand',
        },

        footer: function (currentPage, pageCount) {
            if (currentPage == pageCount) {
                return {
                    text: "",
                    alignment: "center",
                    fontSize: 7,
                    height: 100,
                };
            } else {
                return currentPage.toString() + " of " + pageCount;
            }
        },
    };

    var pdfDoc = printer.createPdfKitDocument(dd);

    let chunks = [];
    pdfDoc.on("data", (chunk) => {
        chunks.push(chunk);
    });
    pdfDoc.on("end", () => {
        const result = Buffer.concat(chunks);
        res.setHeader("Content-Type", "Application/pdf");
        res.setHeader("content-disposition", "attachment; filename=export.pdf");
        res.send(result);
    });
    pdfDoc.end();
};

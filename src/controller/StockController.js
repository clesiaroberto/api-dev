import path from "path";
import knex from "../database";
import { upload } from "../helper/UploadFile";
import { handleResponse } from "../utils/handleResponse";
import XLSX from "xlsx";
import { userCanAccess } from "../middleware/userCanAccess";
import { log } from "../utils/log";

const tableName = "stock";
const permissionGroup = "Stock & Serviços";

const tipo = ["Stock", "Serviços"];

export const all = async (req, res) => {
    // #swagger.tags = ['Stock']
    // #swagger.description = 'Endpoint para listar Stock.'
    const { empresa, userId } = req.user;

    if (!(await userCanAccess(permissionGroup, "Mostrar Stock", userId))) {
        const message = "Acesso negado a lista de Stock.";
        return handleResponse(req, res, 403, [], message);
    }

    const response = [];

    const stock = await knex("stock_disponivel")
        .where({ removido: false, empresa })
        .orderBy("data_added", "DESC");
    const stockConfig = await knex("stock_configuracao")
        .where({ empresa })
        .first();
    let prefixo = "";
    if (stockConfig) {
        prefixo = stockConfig.prefixo ? stockConfig.prefixo : "";
    }

    for (let i = 0; i < stock.length; i++) {
        const docExists = await knex("documento_item")
            .select(["id"])
            .where({ stock: stock[i].id, removido: false })
            .first();
        const anexo = await knex("anexo").where("id", stock[i].anexo).first();
        const categoria = await knex("categoria_estoque")
            .where("id", stock[i].categoria)
            .select(["id", "nome", "descricao"])
            .first();

        let attach = stock[i].anexo;
        attach = `${process.env.API_ADDRESS}/static/anexos/${
            (anexo && anexo.nome_ficheiro) || "default.png"
        }`;

        response.push({
            ...stock[i],
            tipo: stock[i].tipo == 0 ? "Stock" : "Serviço",
            anexo: attach,
            categoria: categoria.nome,
            referencia: prefixo + stockReferencia(stock[i]),
            docExists,
        });
    }

    /* #swagger.responses[200] = { 
               schema: { $ref: "#/definitions/Stock" },
               description:'Listando Stock.' 
        } */

    return handleResponse(req, res, 200, {
        items: response,
    });
};

export const excelStock = async (req, res) => {
    // #swagger.tags = ['Stock']
    // #swagger.description = 'Endpoint para Exportar lista de stock para excel'
    const { from = "", to = "" } = req.body;

    let header = [
        "Id",
        "Nome",
        "Ref",
        "Categoria",
        "Tipo",
        "Descrição",
        "Empresa",
        "Data",
    ];

    const response = [header];

    const stock = await knex(tableName)
        .where({ removido: false })
        .whereBetween("data_added", [from, to]);

    console.log(stock);

    for (let i = 0; i < stock.length; i++) {
        const categoria = await knex("categoria_estoque")
            .where("id", stock[i].categoria)
            .select(["id", "nome", "descricao"])
            .first();

        const checkEmpresaId = await knex("empresa")
            .where({ id: stock[i].empresa })
            .first();

        response.push([
            stock[i].id,
            stock[i].nome,
            stock[i].referencia,
            categoria.nome,
            stock[i].tipo == 0 ? "Stock" : "Serviço",
            stock[i].descricao,
            checkEmpresaId.nome,
            stock[i].data_added,
        ]);
    }

    var ws = XLSX.utils.aoa_to_sheet(response);
    var wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "SheetJS");
    var buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    res.setHeader("Content-Type", "application/vnd.ms-excel");
    res.setHeader("content-disposition", "attachment; filename=export.xls");
    res.send(buf);
};

export const create = async (req, res) => {
    const { userId } = req.user;

    if (!(await userCanAccess(permissionGroup, "Criar Stock", userId))) {
        const message = "Acesso negado a criação de Stock.";
        return handleResponse(req, res, 403, [], message);
    }
    // #swagger.tags = ['Stock']
    // #swagger.description = 'Endpoint para cadastrar Stock.'
    const data = dadosValidos(req);

    /* #swagger.responses[404] = { 
      schema: { $ref: "#/definitions/NaoCadastrado" },
      description:'Categoria não está cadastrada.' 
  } */

    if (
        !(await knex("categoria_estoque")
            .where({
                id: data.categoria,
                removido: false,
                empresa: data.empresa,
            })
            .first())
    ) {
        const message = `Categoria não está cadastrada.`;
        return handleResponse(req, res, 404, [], message);
    }
    /* #swagger.responses[404] = { 
      schema: { $ref: "#/definitions/NaoCadastrado" },
      description:'Taxa não está cadastrada.' 
    } */

    if (
        !(await knex("taxa")
            .where({
                id: data.taxa,
                removido: false,
                empresa: data.empresa,
            })
            .first())
    ) {
        const message = `Taxa não está cadastrada.`;
        return handleResponse(req, res, 404, [], message);
    }

    let anexoId = 1;
    if (req.files && req.files.anexo) {
        anexoId = await uploadAttach(req.files.anexo, req);
    }

    data.anexo = anexoId;

    const referenciaAuto = await knex("stock_configuracao")
        .where({ empresa: data.empresa })
        .first();
    const lastStockInsertedWithReference = await knex(tableName)
        .where({
            empresa: data.empresa,
            removido: false,
            referencia_automatica: true,
        })
        .orderBy("data_added", "DESC")
        .first();

    if (referenciaAuto && referenciaAuto.referencia_automatica) {
        if (lastStockInsertedWithReference) {
            data.referencia =
                lastStockInsertedWithReference.referencia != null
                    ? Number(lastStockInsertedWithReference.referencia) + 1
                    : 1;
        } else {
            data.referencia = 1;
        }
        data.referencia_automatica = true;
    }

    knex(tableName)
        .insert(data)
        .then(async (id) => {
            const stock = await knex(tableName).where({ id }).first();
            const anexo = await knex("anexo").where("id", stock.anexo).first();
            stock.anexo = `${process.env.API_ADDRESS}/static/anexos/${anexo.nome_ficheiro}`;

            /* #swagger.responses[200] = { 
               schema: { $ref: "#/definitions/Stock" },
               description:'Stock registado com sucesso.' 
            } */

            const message = "Stock registado com sucesso.";

            const sTipo = data.tipo == 0 ? tipo[0] : tipo[1];

            log({
                item_id: id[0],
                descricao:
                    "Adicionado um novo stock designação: " +
                    data.designacao +
                    ", tipo: " +
                    sTipo,
                tipo: 1,
                tabela: tableName,
                empresa: req.user.empresa,
                usuario_added: userId,
                usuario_updated: userId,
            });

            return handleResponse(req, res, 200, stock, message);
        })
        .catch((e) => handleResponse(res, res, 500, e));
};

export const gerarReferenciaAutomatica = async (req, res) => {
    const { empresa } = req.user;
    try {
        let referenceAuto = 1;
        const lastStockInsertedWithReference = await knex("stock")
            .where({
                empresa,
                removido: false,
                referencia_automatica: true,
            })
            .orderBy("data_added", "DESC")
            .first();
        if (
            lastStockInsertedWithReference &&
            lastStockInsertedWithReference.referencia_automatica
        ) {
            referenceAuto =
                lastStockInsertedWithReference.referencia != null
                    ? Number(lastStockInsertedWithReference.referencia) + 1
                    : 1;
        }
        return handleResponse(req, res, 200, {
            referencia_automatica: true,
            referencia: ("0000" + referenceAuto).slice(-4),
        });
    } catch (error) {
        return handleResponse(req, res, 500, error);
    }
};

export const findById = async (req, res) => {
    // #swagger.tags = ['Stock']
    // #swagger.description = 'Endpoint para listar stock em função do Id.'

    const { empresa, userId } = req.user;

    if (!(await userCanAccess(permissionGroup, "Detalhes do Stock", userId))) {
        const message = "Acesso negado a detalhes do Stock.";
        return handleResponse(req, res, 403, [], message);
    }

    const { id } = req.params;
    const stock = await knex("stock_disponivel")
        .where({ id, removido: false, empresa })
        .first();

    /* #swagger.responses[404] = { 
        schema: { $ref: "#/definitions/IdNo" },
        description:'Registo não encontrado.' 
    } */

    if (!stock) {
        return handleResponse(req, res, 404, [], `Registo não encontrado.`);
    }

    const anexo = await knex("anexo").where("id", stock.anexo).first();
    let attach = stock.anexo;
    attach = `${process.env.API_ADDRESS}/static/anexos/${
        (anexo && anexo.nome_ficheiro) || "default.png"
    }`;
    const categoria = await knex("categoria_estoque")
        .where("id", stock.categoria)
        .select(["id", "nome", "descricao"])
        .first();
    const taxa = await knex("taxa").where("id", stock.taxa).first();
    const stockConfig = await knex("stock_configuracao")
        .where({ empresa })
        .first();
    let prefixo = "";
    if (stockConfig) {
        prefixo = stockConfig.prefixo ? stockConfig.prefixo : "";
    }
    /* #swagger.responses[200] = { 
        schema: { $ref: "#/definitions/Stock" },
        description:'Listando Stock em função do Id.' 
    } */

    return handleResponse(req, res, 200, {
        ...stock,
        anexo: attach,
        categoria,
        taxa,
        referencia: stockReferencia(stock),
        prefixo,
    });
};

export const findByArmazem = async (req, res) => {
    const { empresa } = req.user;
    const { armazem } = req.params;
    const response = [];

    const getStock = await knex("estado_stock").where({
        armazem: armazem,
        empresa,
    });

    for (let i = 0; i < getStock.length; i++) {
        const stockDisponivel = await knex("stock_disponivel")
            .where({
                id: getStock[i].stock,
                empresa,
            })
            .first();
        response.push({
            ...getStock[i],
            designacao: stockDisponivel.designacao,
            referencia: stockDisponivel.referencia,
        });
    }

    // if (!getStock) {
    //     const message = "Nenhum registo encontrado";
    //     return handleResponse(req, res, 404, [], message);
    // }

    return handleResponse(req, res, 200, { items: response });
};

export const update = async (req, res) => {
    const { userId } = req.user;

    if (!(await userCanAccess(permissionGroup, "Editar Stock", userId))) {
        const message = "Acesso negado a atualização do Stock.";
        return handleResponse(req, res, 403, [], message);
    }
    // #swagger.tags = ['Stock']
    // #swagger.description = 'Endpoint para actualizar stock.'
    const { id } = req.params;
    const data = dadosValidos(req);

    /* #swagger.responses[404] = { 
        schema: { $ref: "#/definitions/IdNo" },
        description:'Stock não encontrado.' 
    } */

    const stockExists = await knex(tableName)
        .where({ id, removido: false, empresa: data.empresa })
        .first();

    if (!stockExists) {
        return handleResponse(req, res, 404, [], `Stock não encontrado.`);
    }

    /* #swagger.responses[404] = { 
        schema: { $ref: "#/definitions/Categoryes"},
        description:'Categoria de stock não está cadastrada.' 
    } */
    if (
        !(await knex("categoria_estoque")
            .where({
                id: data.categoria,
                removido: false,
                empresa: data.empresa,
            })
            .first())
    ) {
        const message = `Categoria de stock não está cadastrada.`;
        return handleResponse(req, res, 404, [], message);
    }

    /* #swagger.responses[404] = { 
      schema: { $ref: "#/definitions/NaoCadastrado" },
      description:'Taxa não está cadastrada.' 
    } */

    if (
        !(await knex("taxa")
            .where({
                id: data.taxa,
                removido: false,
                empresa: data.empresa,
            })
            .first())
    ) {
        const message = `Taxa não está cadastrada.`;
        return handleResponse(req, res, 404, [], message);
    }

    let anexoId = stockExists.anexo;
    if (req.files && req.files.anexo) {
        anexoId = await uploadAttach(req.files.anexo, req);
    }
    data.usuario_added = undefined;
  
    data.anexo = anexoId;

    try {
        /* #swagger.responses[200] = { 
            schema: { $ref: "#/definitions/idUpdate"},
            description:'Dados atualizados com sucesso.' 
        } */
        await knex(tableName).update(data).where({ id });

        const sTipo = data.tipo == 0 ? tipo[0] : tipo[1];

        log({
            item_id: id,
            descricao:
                "Actualizado o stock designação: " +
                data.designacao +
                ", tipo: " +
                sTipo,
            tipo: 2,
            tabela: tableName,
            empresa: req.user.empresa,
            usuario_added: userId,
            usuario_updated: userId,
        });

        const message = "Dados atualizados com sucesso";
        return handleResponse(res, res, 200, { id }, message);
    } catch (error) {
        return handleResponse(res, res, 500, error);
    }
};

export const remove = async (req, res) => {
    // #swagger.tags = ['Stock']
    // #swagger.description = 'Endpoint para remover stock.'
    const { id } = req.params;
    const { userId } = req.user;

    if (!(await userCanAccess(permissionGroup, "Deletar Stock", userId))) {
        const message = "Sem permissão para excluir Stock.";
        return handleResponse(req, res, 403, [], message);
    }
    knex(tableName)
        .update("removido", true)
        .where({ id, removido: false })
        .then(async (row) => {
            if (!row) {
                /* #swagger.responses[404] = { 
               schema: { $ref: "#/definitions/IdNo"},
               description:'Registo não encontrado.' 
        } */
                const message = `Registo não encontrado.`;
                return handleResponse(req, res, 404, [], message);
            }

            /* #swagger.responses[200] = { 
               schema: { $ref: "#/definitions/idDelete"},
               description:'removido com sucesso.' 
        } */

            const data = await knex(tableName).where({ id }).first();

            const sTipo = data.tipo == 0 ? tipo[0] : tipo[1];

            log({
                item_id: id,
                descricao:
                    "Removido o stock designação: " +
                    data.designacao +
                    ", tipo: " +
                    sTipo,
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

export const transacoes = async (req, res) => {
    const { id } = req.params;
    const response = [];
    try {
        const transacoes = await knex("movimento_stock").where({
            stock: id,
        });
        let tipoTransacao = "";

        for (let i = 0; i < transacoes.length; i++) {
            const { nome } = await knex("documento")
                .select(["nome"])
                .where({ id: transacoes[i].documento })
                .first();

            if (transacoes[i].transacao == "entrada") {
                tipoTransacao = "Entrada";
            } else if (transacoes[i].transacao == "saida") {
                tipoTransacao = "Saída";
            } else {
                tipoTransacao = "Transferência";
            }
            response.push({
                ...transacoes[i],
                tipoTransacao,
                documento_nome: nome,
            });
        }

        return handleResponse(req, res, 200, response);
    } catch (error) {
        return handleResponse(req, res, 500, error);
    }
};

export const estados = async (req, res) => {
    const { id } = req.params;
    const response = [];
    try {
        const transacoes = await knex("movimento_stock").where({
            stock: id,
        });

        for (let i = 0; i < transacoes.length; i++) {
            const index = response.findIndex(
                (s) =>
                    s.armazem == transacoes[i].armazem_entrada ||
                    s.armazem == transacoes[i].armazem_saida
            );

            if (index >= 0) {
                const quantidade = response[index].quantidade;
                response[index].quantidade =
                    transacoes[i].entrada - transacoes[i].saida + quantidade;
            } else {
                response.push({
                    ...transacoes[i],
                    armazem: transacoes[i].armazem_entrada,
                    armazem_nome:
                        transacoes[i].armazem_entrada_nome ||
                        transacoes[i].armazem_saida_nome,
                    armazem_entrada: transacoes[i].armazem_entrada,
                    armazem_saida: transacoes[i].armazem_saida,
                    armazem_entrada_nome: transacoes[i].armazem_entrada_nome,
                    armazem_saida_nome: transacoes[i].armazem_saida_nome,
                    quantidade: transacoes[i].entrada - transacoes[i].saida,
                    stock: await knex("stock")
                        .where({ id: transacoes[i].stock })
                        .first(),
                });
            }
        }

        return handleResponse(req, res, 200, response);
    } catch (error) {
        return handleResponse(req, res, 500);
    }
};

const uploadAttach = (anexo, req) => {
    // #swagger.tags = ['Stock']
    // #swagger.description = 'Endpoint para fazer upload de anexo.'
    const { empresa } = req.user;

    try {
        const { name, filename, mimetype } = upload(anexo, "anexos");
        return knex("anexo")
            .insert({
                nome_original: name,
                nome_ficheiro: filename,
                mime_type: mimetype,
                extensao: path.extname(anexo.name),
                empresa,
                usuario_added: req.userId,
                usuario_updated: req.userId,
            })
            .then((id) => id)
            .catch((err) => 1);
    } catch (error) {
        return 1;
    }
};

const dadosValidos = (req) => {
    const usuario_added = req.userId;
    const usuario_updated = req.userId;
    const { empresa } = req.user;
    const {
        designacao,
        referencia = "",
        descricao,
        preco_compra = 0,
        margem1,
        margem2,
        margem3,
        margem4,
        margem5,
        preco1 = 0,
        preco2 = 0,
        preco3 = 0,
        preco4 = 0,
        preco5 = 0,
        categoria,
        tipo = 0,
        taxa,
        prefixo,
    } = req.body;

    return {
        designacao,
        referencia,
        descricao,
        preco_compra: replaceComma(preco_compra),
        margem1: margem1 ? replaceComma(margem1) : null,
        margem2: margem2 ? replaceComma(margem2) : null,
        margem3: margem3 ? replaceComma(margem3) : null,
        margem4: margem4 ? replaceComma(margem4) : null,
        margem5: margem5 ? replaceComma(margem5) : null,
        preco1: replaceComma(preco1),
        preco2: replaceComma(preco2),
        preco3: replaceComma(preco3),
        preco4: replaceComma(preco4),
        preco5: replaceComma(preco5),
        categoria,
        tipo,
        taxa,
        referencia_automatica: false,
        prefixo,
        empresa,
        usuario_added,
        usuario_updated,
    };
};

const replaceComma = (num) => parseFloat(String(num).replace(/,/g, ""));

export const stockReferencia = (stock) => {
    if (stock.referencia_automatica) {
        return ("0000" + stock.referencia).slice(-4);
    }
    return stock.referencia;
};

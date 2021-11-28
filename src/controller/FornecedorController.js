import knex from "../database";
import XLSX from "xlsx";
import { handleResponse } from "../utils/handleResponse";
import { userCanAccess } from "../middleware/userCanAccess";
import { log } from "../utils/log";
import { formatCurrency } from "../helper/FormatCurrency";

const permissionGroup = "Fornecedores";
const tableName = "fornecedor";

export const all = async (req, res) => {
    const { userId } = req.user;

    if (!(await userCanAccess(permissionGroup, "Mostrar Fornecedor", userId))) {
        const message = "Sem permissão para visualizar os fornecedores.";
        return handleResponse(req, res, 403, [], message);
    }
    // #swagger.tags = ['Fornecedor']
    // #swagger.description = 'Endpoint para listar Fornecedores.'
    const { empresa } = req.user;
    const { activo = 1 } = req.query;
    const response = [];
    let fornecedores = await knex("fornecedor_saldo").where({
        empresa,
        removido: false,
    });

    if (activo) {
        fornecedores = await knex("fornecedor_saldo").where({
            empresa,
            removido: false,
        });
    }

    const empresaUsuario = await knex("empresa").where({ id: empresa }).first();
    const moeda = await knex("moeda")
        .where({
            id: empresaUsuario.moeda_padrao,
        })
        .first();

    for (let i = 0; i < fornecedores.length; i++) {
        const tipoFornecedor = await knex("fornecedor")
            .where({ id: fornecedores[i].id })
            .first();
        const docExists = await knex("documento")
            .select(["id"])
            .where({ fornecedor: fornecedores[i].id, removido: false })
            .first();
        response.push({
            ...fornecedores[i],
            tipo_fornecedor: tipoFornecedor.tipo_fornecedor,
            preco: tipoFornecedor.preco,
            taxa: tipoFornecedor.taxa,
            activo: tipoFornecedor.activo,
            saldo: fornecedores[i].saldo,
            saldo_formatado:
                formatCurrency(fornecedores[i].saldo) + " " + moeda.codigo,
            docExists,
        });
    }

    /* #swagger.responses[200] = { 
        schema: { $ref: "#/definitions/Fornecedor" },
        description:'Listando Fornecedores' 
    } */
    return handleResponse(req, res, 200, {
        items: response,
    });
};

export const findById = async (req, res) => {
    const { userId } = req.user;

    if (
        !(await userCanAccess(
            permissionGroup,
            "Detalhes do Fornecedor",
            userId
        ))
    ) {
        const message = "Sem permissão para visualizar o fornecedor.";
        return handleResponse(req, res, 403, [], message);
    }
    // #swagger.tags = ['Fornecedor']
    // #swagger.description = 'Endpoint para listar Fornecedores em Função do Id.'
    const { id } = req.params;
    const { empresa } = req.user;
    const fornecedor = await knex("fornecedor_saldo")
        .where({ id, removido: false, empresa })
        .first();
    /* #swagger.responses[404] = { 
        schema: { $ref: "#/definitions/IdNo" },
        description:'Registo não encontrado.' 
    } */
    if (!fornecedor) {
        return handleResponse(req, res, 404, [], `Registo não encontrado.`);
    }

    const tipoFornecedor = await knex("fornecedor")
        .where({ id: fornecedor.id })
        .first();

    /* #swagger.responses[200] = { 
        schema: { $ref: "#/definitions/Fornecedor" },
        description:'Listando Fornecedor em função do Id.' 
    } */
    const docExists = await knex("documento")
        .select(["id"])
        .where({ fornecedor: fornecedor.id, removido: false })
        .first();

    const empresaAssociada = await knex("empresa")
        .where({ id: empresa })
        .first();
    const moeda = await knex("moeda")
        .where({ id: empresaAssociada.moeda_padrao })
        .first();

    return handleResponse(req, res, 200, {
        ...fornecedor,
        tipo_fornecedor: tipoFornecedor.tipo_fornecedor,
        preco: tipoFornecedor.preco,
        taxa: tipoFornecedor.taxa,
        activo: tipoFornecedor.activo,
        saldo: fornecedor.saldo,
        saldo_formatado: formatCurrency(fornecedor.saldo) + " " + moeda.codigo,
        docExists,
    });
};

export const excelFornecedor = async (req, res) => {
    // #swagger.tags = ['Fornecedor']
    // #swagger.description = 'Listagem  de fornecedores em excel.'
    let header = [
        "Id",
        "Nome",
        "Email",
        "Contacto1",
        "Contacto2",
        "Nuit",
        "Endereço",
        "Empresa",
        "nuel",
        "taxa_insento",
        "motivo",
        "desconto_fixo",
        "Data",
    ];

    const data = [header];

    const { from = "", to = "" } = req.body;

    const fornecedores = await knex("fornecedor")
        .where({ removido: false })
        .whereBetween("data_added", [from, to]);

    for (let i = 0; i < fornecedores.length; i++) {
        const checkEmpresaId = await knex("empresa")
            .where({ id: fornecedores[i].empresa })
            .first();

        data.push([
            fornecedores[i].id,
            fornecedores[i].nome,
            fornecedores[i].email,
            fornecedores[i].contacto1,
            fornecedores[i].contacto2,
            fornecedores[i].nuit,
            fornecedores[i].endereco,
            checkEmpresaId.nome,
            fornecedores[i].nuel,
            fornecedores[i].taxa_isento == 1 ? "Sim" : "Não",
            fornecedores[i].motivo,
            fornecedores[i].desconto_fixo == 1 ? "Sim" : "Não",
            fornecedores[i].data_added,
        ]);

        console.log(data);
    }

    var ws = XLSX.utils.aoa_to_sheet(data);
    var wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "SheetJS");
    var buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    res.setHeader("Content-Type", "application/vnd.ms-excel");
    res.setHeader("content-disposition", "attachment; filename=export.xls");
    res.send(buf);
};

export const AllRemoved = async (req, res) => {
    // #swagger.tags = ['Fornecedor']
    // #swagger.description = 'Endpoint para listar Fornecedores com status true (1) removido.'
    const { empresa } = req.user;
    let { page = 1, perPage = 10, q = "" } = req.query;
    page = page <= 0 ? 1 : page;

    const count = await knex(tableName)
        .where({ removido: true, empresa })
        .count("id as total");

    const fornecedores = await knex(tableName)
        .where({ removido: true, empresa })
        .where("nome", "like", `%${q}%`)
        .limit(perPage)
        .offset((page - 1) * perPage);

    /* #swagger.responses[200] = { 
               schema: { $ref: "#/definitions/Fornecedor" },
               description:'Listando Fornecedor em função do Estado.' 
        } */

    res.setHeader("X-Total-Count", count[0].total);
    return handleResponse(req, res, 200, {
        page: page,
        per_page: perPage,
        total: count[0].total,
        items: fornecedores,
    });
};

export const create = async (req, res) => {
    const { userId } = req.user;

    if (!(await userCanAccess(permissionGroup, "Criar Fornecedor", userId))) {
        const message = "Sem permissão para criar os fornecedores.";
        return handleResponse(req, res, 403, [], message);
    }
    // #swagger.tags = ['Fornecedor']
    // #swagger.description = 'Endpoint para cadastrar Fornecedores.'
    const data = dadosValidos(req);

    /* #swagger.parameters['Entidade'] = {
               in: 'body',
               description: 'Informações do Fornecedor.',
               required: true,
               type: 'object',
               schema: { $ref: "#/definitions/Fornecedor" }
    } */

    /* #swagger.responses[409] = { 
               schema: { $ref: "#/definitions/emailNo" },
               description:'Fornecedor com e-mail ${email} já está registado' 
        }
         */

    if (
        data.email &&
        (await knex(tableName)
            .where({
                email: data.email,
                empresa: data.empresa,
                removido: false,
            })
            .first())
    ) {
        const message = `Fornecedor com e-mail ${data.email} já está registado.`;
        return handleResponse(req, res, 409, [], message);
    }
    /* #swagger.responses[200] = { 
               schema: { $ref: "#/definitions/registerSuccess" },
               description:'Adicionado com sucesso.' 
        } */

    try {
        const [created] = await knex(tableName).insert(data);
        const message = "Adicionado com sucesso.";

        log({
            item_id: created,
            descricao: "Adicionado fornecedor " + data.nome,
            tipo: 1,
            tabela: tableName,
            empresa: req.user.empresa,
            usuario_added: userId,
            usuario_updated: userId,
        });

        return handleResponse(req, res, 200, { id: created }, message);
    } catch (error) {
        return handleResponse(res, res, 500, error);
    }
};

export const update = async (req, res) => {
    const { userId, empresa } = req.user;

    if (!(await userCanAccess(permissionGroup, "Editar Fornecedor", userId))) {
        const message = "Sem permissão para editar os fornecedores.";
        return handleResponse(req, res, 403, [], message);
    }
    // #swagger.tags = ['Fornecedor']
    // #swagger.description = 'Endpoint para actualizar Fornecedores'
    const { id } = req.params;
    const data = dadosValidos(req);

    /* #swagger.parameters['Fornecedor'] = {
               in: 'body',
               description: 'Informações do Fornecedor.',
               required: true,
               type: 'object',
               schema: { $ref: "#/definitions/Fornecedor" }
    } */

    /* #swagger.responses[404] = { 
               schema: { $ref: "#/definitions/IdNo" },
               description:'Registo não encontrado' 
        } */

    try {
        if (!(await knex(tableName).where({ id, empresa }))) {
            const message = "Registo não encontrado.";
            return handleResponse(req, res, 404, [], message);
        }

        await knex(tableName).update(data).where({ id, removido: false });

        log({
            item_id: id,
            descricao: "Actualizado fornecedor N°: " + id,
            tipo: 2,
            tabela: tableName,
            empresa: req.user.empresa,
            usuario_added: userId,
            usuario_updated: userId,
        });

        const message = "Atualizado com sucesso.";
        return handleResponse(req, res, 200, { id }, message);
    } catch (error) {
        return handleResponse(res, res, 500);
    }
};

export const remove = async (req, res) => {
    const { userId } = req.user;

    if (!(await userCanAccess(permissionGroup, "Deletar Fornecedor", userId))) {
        const message = "Sem permissão para deletar os fornecedores.";
        return handleResponse(req, res, 403, [], message);
    }
    // #swagger.tags = ['Fornecedor']
    // #swagger.description = 'Endpoint para remover Fornecedores.'
    const { id } = req.params;
    const { empresa } = req.user;

    /* #swagger.responses[404] = { 
        schema: { $ref: "#/definitions/IdNo" },
        description:'Registo não encontrado.' 
    } */

    try {
        if (!(await knex(tableName).where({ id, empresa }))) {
            const message = "Registo não encontrado.";
            return handleResponse(req, res, 404, [], message);
        }

        await knex(tableName)
            .update("removido", true)
            .where({ id, removido: false, empresa });
        const message = `Removido com sucesso.`;

        log({
            item_id: id,
            descricao: "Removido fornecedor N°: " + id,
            tipo: 3,
            tabela: tableName,
            empresa: req.user.empresa,
            usuario_added: userId,
            usuario_updated: userId,
        });

        return handleResponse(req, res, 200, [], message);
    } catch (error) {
        return handleResponse(req, res, 500, error);
    }
};

const dadosValidos = (req) => {
    const usuario_added = req.userId;
    const usuario_updated = req.userId;
    const { empresa } = req.user;

    const {
        nome,
        email = "",
        contacto1,
        contacto2 = "",
        endereco = "",
        plafond,
        preco,
        nuit,
        tipo_fornecedor,
        nuel,
        activo = 1,
        taxa_isento = 0,
        taxa,
        motivo,
        desconto_fixo = 0,
    } = req.body;

    return {
        nome,
        email,
        contacto1,
        contacto2,
        endereco,
        empresa,
        preco,
        nuit: nuit == "" ? null : nuit,
        tipo_fornecedor: tipo_fornecedor == "" ? null : tipo_fornecedor,
        plafond: plafond == "" ? null : plafond,
        nuel,
        taxa_isento,
        taxa: taxa == "" ? null : taxa,
        motivo,
        activo,
        desconto_fixo: desconto_fixo == "" ? 0 : desconto_fixo,
        usuario_added,
        usuario_updated,
    };
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

export const getTipoDoc = async (req, res) => {
    const { fornecedor, tipo_doc } = req.params;

    var fornecedorDoc = await knex("documento").where({
        fornecedor,
        tipo_doc,
        empresa: req.user.empresa,
        removido: false,
    });

    let document = [];

    if (
        !(await knex("documento")
            .where({
                fornecedor,
                tipo_doc,
                empresa: req.user.empresa,
                removido: false,
            })
            .first())
    ) {
        const message = "Registo não encontrado";
        return handleResponse(req, res, 404, message);
    }
    for (let i = 0; i < fornecedorDoc.length; i++) {
        let total = 0;
        const documentoItems = await knex("documento_item").where({
            documento: fornecedorDoc[i].id,
        });

        const moedaPadrao = await knex("moeda")
            .select(["codigo"])
            .where({ id: fornecedorDoc[i].moeda_padrao })
            .first();

        documentoItems.map(async (item) => {
            const taxa = await knex("taxa")
                .select(["id", "valor"])
                .where({ id: item.taxa })
                .first();

            total +=
                item.preco * item.quantidade +
                (item.preco * item.quantidade * taxa.valor) / 100 +
                (item.preco * item.quantidade * item.desconto) / 100;
        });
        document.push({
            ...fornecedorDoc[i],
            referencia: numeroDocFormat(fornecedorDoc[i]),
            total: formatCurrency(total) + " " + moedaPadrao.codigo,
        });
    }
    return handleResponse(req, res, 200, document);
};

export const numeroDocFormat = (fornecedorDoc) => {
    return `${fornecedorDoc.prefixo}-${("0000" + fornecedorDoc.numero).slice(
        -4
    )}/${new Date(fornecedorDoc.data_added).getFullYear()}`;
};

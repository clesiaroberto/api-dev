import knex from "../database";
import { handleResponse } from "../utils/handleResponse";

const create = async (req, res) => {
    // #swagger.tags = ['Permissao']
    // #swagger.description = 'Endpoint para criar Permissao.'
    const { nome, grupo } = req.body;
    const permission = await knex("permissao").where({ grupo, nome }).first();

    /* #swagger.responses[400] = { 
               schema: { $ref: "#/definitions/nameYes" },
               description:'A permissão ${nome} pertencente ao grupo já está cadastrada.' 
        } */

    if (permission) {
        const message = `A permissão ${nome} pertencente ao grupo ${grupo} já está cadastrada`;
        return handleResponse(req, res, 400, [], message);
    }

    /* #swagger.responses[400] = { 
               schema: { $ref: "#/definitions/GrupoNo" },
               description:'O grupo de permissão não existe' 
        } */

    if (!(await knex("permissao_grupo").where("id", grupo).first())) {
        const message = `O grupo de permissão ${grupo} não existe`;
        return handleResponse(req, res, 400, [], message);
    }

    const permissionCreated = await knex("permissao").insert({
        nome,
        grupo,
        usuario_added: req.userId,
        usuario_updated: req.userId,
    });
    /* #swagger.responses[200] = { 
               schema: { $ref: "#/definitions/registerSuccess" },
               description:'Permissão registada com sucesso.' 
        } */
    return handleResponse(
        res,
        res,
        200,
        await knex("permissao").where("id", permissionCreated).first(),
        "Permissão registada com sucesso."
    );
};

/**
 *
 * @param {*} req
 * @param {*} res
 * @returns
 */
const all = async (req, res) => {
    // #swagger.tags = ['Permissao']
    // #swagger.description = 'Endpoint para listar Permissoes.'
    const groupPermission = await knex("permissao_grupo").orderBy(
        "nome",
        "ASC"
    );
    const response = [];

    for (let i = 0; i < groupPermission.length; i++) {
        const permission = await knex("permissao")
            .orderBy("nome", "ASC")
            .where("grupo", groupPermission[i].id);

        response.push({
            ...groupPermission[i],
            permissoes: permission,
        });
    }
    /* #swagger.responses[200] = { 
        schema: { $ref: "#/definitions/Permissao" },
        description:'Listando Permissoes' 
    } */

    return handleResponse(req, res, 200, response);
};

/**
 *
 * @param {*} req
 * @param {*} res
 * @returns
 */
const findById = async (req, res) => {
    // #swagger.tags = ['Permissao']
    // #swagger.description = 'Endpoint para listar Permissoes em funcao do Id.'
    const { id } = req.params;
    const permissao = await knex("permissao").where("permissao.id", id).first();

    /* #swagger.responses[200] = { 
               schema: { $ref: "#/definitions/IdNo" },
               description:'Permissão com ID não encontrado.' 
        } */

    if (!permissao) {
        const message = `Permissão com ID ${id} não encontrado.`;
        return handleResponse(req, res, 400, [], message);
    }

    const grupo = await knex("permissao_grupo")
        .where("id", permissao.grupo)
        .first();
    /* #swagger.responses[200] = { 
               schema: { $ref: "#/definitions/Permissao" },
               description:'Listando Permissão.' 
        } */
    const response = { ...permissao, grupo };

    return handleResponse(req, res, 200, response);
};

const findByGroupId = async (req, res) => {
    // #swagger.tags = ['Permissao']
    // #swagger.description = 'Endpoint para listar Permissoes em funcao do Id do grupo.'
    const { id } = req.params;
    const permissao = await knex("permissao")
        .orderBy("nome", "ASC")
        .where("grupo", id);
    const response = [];

    /* #swagger.responses[404] = { 
               schema: { $ref: "#/definitions/IdNo" },
               description:'Permissão com grupo não encontrada.' 
        } */

    if (permissao.length == 0) {
        const message = `Permissão com grupo ${id} não encontrada.`;
        return handleResponse(req, res, 404, [], message);
    }
    const grupo = await knex("permissao_grupo").where({ id }).first();

    response.push({
        ...grupo,
        permissoes: permissao,
    });
    /* #swagger.responses[200] = { 
               schema: { $ref: "#/definitions/Permissao" },
               description:'Listando Permissão em função do Id.' 
        } */
    return handleResponse(req, res, 200, response);
};

const createAllPermissions = async (req, res) => {
    const { userId } = req.user;
    try {
        await knex("usuario_permissao").where({ usuario: 1 }).del();
        await knex("permissao").del();
        await knex("permissao_grupo").del();

        permissions.map(async (permission) => {
            const [grupo] = await knex("permissao_grupo").insert({
                nome: permission.title,
                usuario_added: userId,
                usuario_updated: userId,
            });
            permission.group.map(async (group) => {
                const [permissao] = await knex("permissao").insert({
                    nome: group,
                    grupo,
                    usuario_added: userId,
                    usuario_updated: userId,
                });

                await knex("usuario_permissao").insert({
                    permissao,
                    usuario: 1,
                    usuario_added: userId,
                    usuario_updated: userId,
                });
            });
        });
        return handleResponse(req, res, 200);
    } catch (error) {
        return handleResponse(req, res, 500, error);
    }
};

const permissions = [
    {
        title: "Stock & Serviços",
        group: [
            "Criar Stock",
            "Mostrar Stock",
            "Editar Stock",
            "Deletar Stock",
            "Detalhes do Stock",
        ],
    },
    {
        title: "Categorias de Stock",
        group: [
            "Criar Categoria",
            "Mostrar Categoria",
            "Editar Categoria",
            "Deletar Categoria",
            "Detalhes da Categoria",
        ],
    },
    {
        title: "Clientes",
        group: [
            "Criar Cliente",
            "Mostrar Cliente",
            "Editar Cliente",
            "Deletar Cliente",
            "Detalhes do Cliente",
        ],
    },
    {
        title: "Fornecedores",
        group: [
            "Criar Fornecedor",
            "Mostrar Fornecedor",
            "Editar Fornecedor",
            "Deletar Fornecedor",
            "Detalhes do Fornecedor",
        ],
    },
    {
        title: "Entidades",
        group: [
            "Criar Entidade",
            "Mostrar Entidade",
            "Editar Entidade",
            "Deletar Entidade",
            "Detalhes da Entidade",
        ],
    },
    {
        title: "Documentos",
        group: [
            "Criar Documento",
            "Mostrar Documento",
            "Editar Documento",
            "Duplicar Documento",
            "Converter Documento",
            "Deletar Documento",
            "Detalhes do Documento",
            "Cancelar Documento",
        ],
    },
    {
        title: "Contas Bancárias",
        group: [
            "Mostrar conta bancaria",
            "Criar conta bancaria",
            "Editar conta bancaria",
            "Deletar conta bancaria",
        ],
    },
    {
        title: "Depósitos",
        group: [
            "Mostrar depósito",
            "Criar depósito",
            "Editar depósito",
            "Deletar depósito",
        ],
    },
    {
        title: "Transferências",
        group: [
            "Mostrar transferência",
            "Criar transferência",
            "Editar transferência",
            "Deletar transferência",
            "Detalhes da transferência",
        ],
    },
    {
        title: "Categoria de Despesa",
        group: [
            "Criar Categoria",
            "Mostrar Categoria",
            "Editar Categoria",
            "Deletar Categoria",
            "Detalhes da Categoria",
        ],
    },
    {
        title: "Despesas",
        group: [
            "Criar despesa",
            "Mostrar despesa",
            "Editar despesa",
            "Deletar despesa",
            "Detalhes da despesa",
        ],
    },
    {
        title: "Taxas",
        group: [
            "Criar taxa",
            "Mostrar taxa",
            "Editar taxa",
            "Deletar taxa",
            "Detalhes da taxa",
        ],
    },
    {
        title: "Câmbios",
        group: [
            "Criar cambio",
            "Mostrar cambio",
            "Editar cambio",
            "Deletar cambio",
            "Detalhes do cambio",
        ],
    },
    {
        title: "Tipo de Documento",
        group: [
            "Criar tipo de documento",
            "Mostrar tipo de documento",
            "Editar tipo de documento",
            "Deletar tipo de documento",
            "Detalhes do tipo de documento",
        ],
    },
    {
        title: "Armazéns",
        group: [
            "Criar armazém",
            "Mostrar armazém",
            "Editar armazém",
            "Deletar armazém",
            "Detalhes do armazém",
        ],
    },
    {
        title: "Configurações do Stock",
        group: [
            "Criar configuração",
            "Editar configuração",
            "Mostrar configuração",
        ],
    },
    {
        title: "Pendentes dos Clientes",
        group: ["Mostrar pendentes", "Imprimir pendentes"],
    },
    {
        title: "Extratos dos Clientes",
        group: ["Mostrar extrato", "Imprimir extrato"],
    },
    {
        title: "Pendentes dos Fornecedores",
        group: ["Mostrar pendentes", "Imprimir pendentes"],
    },
    {
        title: "Extratos dos Fornecedores",
        group: ["Mostrar extrato", "Imprimir extrato"],
    },
    {
        title: "Relatório de despesas",
        group: ["Mostrar relatório", "Imprimir relatório"],
    },
    {
        title: "Pagamento ao Fornecedor",
        group: [
            "Criar pagamento",
            "Mostrar pagamento",
            "Editar pagamento",
            "Deletar pagamento",
            "Detalhes do pagamento",
        ],
    },
    {
        title: "Recibo de Adiantamento",
        group: [
            "Criar Recibo",
            "Mostrar Recibo",
            "Editar Recibo",
            "Deletar Recibo",
            "Detalhes do Recibo",
        ],
    },
    {
        title: "Recibos",
        group: [
            "Criar Recibo",
            "Mostrar Recibo",
            "Editar Recibo",
            "Deletar Recibo",
            "Detalhes do Recibo",
        ],
    },
    {
        title: "Adiantamento ao Fornecedor",
        group: [
            "Criar Adiantamento",
            "Mostrar Adiantamento",
            "Editar Adiantamento",
            "Deletar Adiantamento",
            "Detalhes do Adiantamento",
        ],
    },
    {
        title: "Actividades",
        group: [
            "Criar Actividade",
            "Mostrar Actividade",
            "Editar Actividade",
            "Deletar Actividade",
            "Detalhes do Actividade",
        ],
    },
];

export { create, all, findById, findByGroupId };

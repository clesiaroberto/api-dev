const swaggerAutogen = require("swagger-autogen")();

const doc = {
    info: {
        title: "Documentação Erp",
        description: "Documentação",
    },
    consumes: ["application/json"],
    produces: ["application/json"],
    host: "http://localhost:3000",
    schemes: ["http", "https"],
    definitions: {
        loginUser: {
            email: "admin@ncsoftware.co.mz",
            password: "12345678",
        },
        loginUserErr: {
            message: "E-mail ou password incorrecto",
        },
        UserErr: {
            message: "A sua conta está desativada. Contacte o suporte técnico",
        },
        UserEmpty: {
            message: "E-mail e Password são obrigatórios",
        },
        TokenSuccess: {
            message: "Usuário autenticado",
        },
        Token: {
            message: "Refresh token expirado",
        },
        userToken: {
            menssagem: "Refresh Token não Encontrado",
        },
        NotFoundCategory: {
            message: "Registo com categoria ${categoria} não foi encontrado",
        },
        LogOut: {
            message: "Sessão Terminada!",
        },
        UnAuthorized: {
            message: "Não autorizado!",
        },
        IdNo: {
            message: "Registo Não Encontrado!",
        },
        NameNo: {
            message: "Nome Não Encontrado!",
        },
        idUpdate: {
            message: "Actualizado com Sucesso!",
        },
        idDelete: {
            message: "Removido com Sucesso!",
        },
        empresaNo: {
            message: "Empresa informada não existe!",
        },
        registerSuccess: {
            message: "Registado com Sucesso!",
        },
        StatusNo: {
            message: "Não podes alterar o estado da tua própria conta",
        },
        statusInvalid: {
            message: "O estado informado não é válido.",
        },
        statusUpdate: {
            message: "Status actualizado com sucesso!",
        },
        emailNo: {
            message: "E-mail informado Já existe!",
        },
        nameYes: {
            message: "Nome informado Já existe!",
        },
        CategoryNo: {
            message: "Categoria informada Já existe!",
        },
        permissaoYes: {
            message: "O usuário já possui esta permissão!",
        },
        permissaoNo: {
            message: "Nenhum registo encontrado!",
        },
        Categoryes: {
            message: "Categoria informada não está cadastrada!",
        },
        StockYes: {
            message: "Stock informado Já existe!",
        },
        TipoDocYes: {
            message: "Tipo de documento informado Já existe!",
        },
        GrupoNo: {
            message: "Grupo informado não existe!",
        },
        SenhaActual: {
            message: "A senha não está correta",
        },
        SenhaOk: {
            message: "Senha Confirmada",
        },
        NovaSenha: {
            message: "A nova senha não pode ser igual a senha atual.",
        },
        IdAdmin: {
            message: "Não podes alterar senha de um administrador",
        },
        SenhaUpdate: {
            message: "Senha alterada com Sucesso.",
        },
        InvalidValue: {
            message: "Valor introduzido Inválido.",
        },
        MoedaNo: {
            message: " A moeda Padrão não pode ser igual a moeda de conversão.",
        },
        SenhaNo: {
            message: "Senha não informada.",
        },
        UserTokenSUccess: {
            UserId: 18,
            nome: "clesia",
            apelido: "Roberto",
            imagem: "img.png",
            empresaId: 1,
            empresaNome: "Nc Software",
            isAdmin: false,
        },
        User: {
            id: 18,
            nome: "Clésia",
            apelido: "Roberto",
            email: "clesiaroberto@yahoo.com",
            contacto1: "844024855",
            contacto2: "844024855",
            imagem: "default.png",
            estado: 1,
            empresa: 1,
        },
        Categoria_Estoque: {
            nome: "Stock1",
            descricao: "Primeira Categoria",
            empresa: 1,
            usuario_added: 1,
            usuario_updated: 1,
        },
        Cliente: {
            nome: "Marta",
            email: "marta@yahoo.com",
            contacto1: "123456789",
            contacto2: "123456789",
            nuit: "123456789",
            nuel: "nuel",
            plafond: 1.1,
            preco: 1000,
            taxa_isento: 1,
            motivo: "motivo",
            desconto_fixo: 100,
            endereco: "Matola",
            empresa: 1,
            data_added: 1,
            data_updated: 1,
        },
        Empresa: {
            nome: "Nzila",
            slogan: "NZ",
            nuit: "123456789",
            email: "nzila@yahoo.com",
            contacto1: "123456789",
            contacto2: "821458963",
            endereco1: "Maputo",
            endereco2: "Matola",
            usuario_added: 1,
            usuario_updated: 1,
        },
        Entidade: {
            nome: "Nzila",
            email: "nzila@yahoo.com",
            contacto1: "123456789",
            contacto2: "821458963",
            endereco: "Maputo",
            empresa: 1,
            nuit: "123456789",
            data_added: 2020 - 10 - 10,
            data_updated: 2020 - 10 - 10,
            usuario_added: 1,
            usuario_updated: 1,
        },
        Fornecedor: {
            nome: "Nzila",
            email: "nzila@yahoo.com",
            contacto1: "123456789",
            contacto2: "821458963",
            endereco1: "Maputo",
            nuit: 13484849,
            nuel: "nuel",
            plafond: 1.2,
            taxa_isento: 1,
            motivo: "motivo",
            desconto_fixo: 19,
            endereco: "Matola",
            empresa: 1,
            data_added: 2020 - 10 - 10,
            data_updated: 2020 - 10 - 10,
            usuario_added: 1,
            usuario_updated: 1,
        },
        NaoCadastrado: {
            message: "Não cadastrado",
        },
        Permissao: {
            nome: "Caixas",
            grupo: 2,
            usuario_added: 1,
            usuario_updated: 1,
        },
        Permissao_Grupo: {
            nome: "Admin",
            usuario_added: 1,
            usuario_updated: 1,
        },
        Stock: {
            nome: "Stock",
            referencia: "stf1",
            categoria: 6,
            tipo: 1,
            descricao: "stock",
            empresa: 1,
            usuario_added: 1,
            usuario_updated: 1,
        },
        Taxa: {
            nome: "Taxa",
            valor: "100",
            percentual: true,
            empresa: 1,
            usuario_added: 1,
            usuario_updated: 1,
        },
        Tipo_Doc: {
            nome: "Fatura",
            prefixo: "FT",
            categoria: 1,
            descricao: "documentos",
            empresa: 1,
            move_estoque: 1,
            move_conta_corrente: 1,
            move_a_credito: 1,
            requer_recibo: 1,
            usuario_added: 1,
            usuario_updated: 1,
            removido: 1,
        },
        Cambio: {
            moeda_padrao: "Metical",
            moeda_conversao: "Dollar",
            preco_compra: "100",
            preco_venda: "150",
            usuario_added: 1,
            usuario_updated: 1,
        },
    },
    loginUserErr: {
        message: "E-mail ou password incorrecto",
    },
    UserErr: {
        message: "A sua conta está desativada. Contacte o suporte técnico",
    },
    UserEmpty: {
        message: "E-mail e Password são obrigatórios",
    },
    TokenSuccess: {
        message: "Usuário autenticado",
    },
    Token: {
        message: "Refresh token expirado",
    },
    userToken: {
        menssagem: "Refresh Token não Encontrado",
    },
    NotFoundCategory: {
        message: "Registo com categoria ${categoria} não foi encontrado",
    },
    LogOut: {
        message: "Sessão Terminada!",
    },
    UnAuthorized: {
        message: "Não autorizado!",
    },
    IdNo: {
        message: "Registo Não Encontrado!",
    },
    NameNo: {
        message: "Nome Não Encontrado!",
    },
    idUpdate: {
        message: "Actualizado com Sucesso!",
    },
    idDelete: {
        message: "Removido com Sucesso!",
    },
    empresaNo: {
        message: "Empresa informada não existe!",
    },
    registerSuccess: {
        message: "Registado com Sucesso!",
    },
    StatusNo: {
        message: "Não podes alterar o estado da tua própria conta",
    },
    statusInvalid: {
        message: "O estado informado não é válido.",
    },
    statusUpdate: {
        message: "Status actualizado com sucesso!",
    },
    emailNo: {
        message: "E-mail informado Já existe!",
    },
    nameYes: {
        message: "Nome informado Já existe!",
    },
    CategoryNo: {
        message: "Categoria informada Já existe!",
    },
    permissaoYes: {
        message: "O usuário já possui esta permissão!",
    },
    permissaoNo: {
        message: "Nenhum registo encontrado!",
    },
    Categoryes: {
        message: "Categoria informada não está cadastrada!",
    },
    StockYes: {
        message: "Stock informado Já existe!",
    },
    TipoDocYes: {
        message: "Tipo de documento informado Já existe!",
    },
    GrupoNo: {
        message: "Grupo informado não existe!",
    },
    SenhaActual: {
        message: "A senha não está correta",
    },
    SenhaOk: {
        message: "Senha Confirmada",
    },
    NovaSenha: {
        message: "A nova senha não pode ser igual a senha atual.",
    },
    IdAdmin: {
        message: "Não podes alterar senha de um administrador",
    },
    SenhaUpdate: {
        message: "Senha alterada com Sucesso.",
    },
    InvalidValue: {
        message: "Valor introduzido Inválido.",
    },
    MoedaNo: {
        message: " A moeda Padrão não pode ser igual a moeda de conversão.",
    },
    SenhaNo: {
        message: "Senha não informada.",
    },
    TchaveNo: {
        message: "Tradução Chave não Encontrada.",
    },
    linguaNo: {
        message: "Línngua não Encontrada.",
    },
    UserTokenSUccess: {
        UserId: 18,
        nome: "clesia",
        apelido: "Roberto",
        imagem: "img.png",
        empresaId: 1,
        empresaNome: "Nc Software",
        isAdmin: false,
    },
    User: {
        id: 18,
        nome: "Clésia",
        apelido: "Roberto",
        email: "clesiaroberto@yahoo.com",
        contacto1: "844024855",
        contacto2: "844024855",
        imagem: "default.png",
        estado: 1,
        empresa: 1,
    },
    Categoria_Estoque: {
        nome: "Stock1",
        descricao: "Primeira Categoria",
        empresa: 1,
        usuario_added: 1,
        usuario_updated: 1,
    },
    Cliente: {
        nome: "Marta",
        email: "marta@yahoo.com",
        contacto1: "123456789",
        contacto2: "123456789",
        nuit: "123456789",
        endereco: "Matola",
        endereco2: "Maputo",
        empresa: 1,
        usuario_added: 1,
        usuario_updated: 1,
    },
    Empresa: {
        nome: "Nzila",
        slogan: "NZ",
        nuit: "123456789",
        email: "nzila@yahoo.com",
        contacto1: "123456789",
        contacto2: "821458963",
        endereco1: "Maputo",
        endereco2: "Matola",
        usuario_added: 1,
        usuario_updated: 1,
    },
    Entidade: {
        nome: "Nzila",
        email: "nzila@yahoo.com",
        contacto1: "123456789",
        contacto2: "821458963",
        endereco1: "Maputo",
        endereco2: "Matola",
        empresa: 1,
        nuit: "123456789",
        usuario_added: 1,
        usuario_updated: 1,
    },
    Fornecedor: {
        nome: "Nzila",
        email: "nzila@yahoo.com",
        contacto1: "123456789",
        contacto2: "821458963",
        endereco1: "Maputo",
        endereco2: "Matola",
        empresa: 1,
        nuit: "123456789",
        usuario_added: 1,
        usuario_updated: 1,
    },
    NaoCadastrado: {
        message: "Não cadastrado",
    },
    Permissao: {
        nome: "Caixas",
        grupo: 2,
        usuario_added: 1,
        usuario_updated: 1,
    },
    Permissao_Grupo: {
        nome: "Admin",
        usuario_added: 1,
        usuario_updated: 1,
    },
    Stock: {
        nome: "Stock",
        referencia: "stf1",
        categoria: 6,
        tipo: 1,
        descricao: "stock",
        empresa: 1,
        usuario_added: 1,
        usuario_updated: 1,
    },
    Taxa: {
        nome: "Taxa",
        valor: "100",
        percentual: true,
        empresa: 1,
        usuario_added: 1,
        usuario_updated: 1,
    },
    Tipo_Doc: {
        nome: "Fatura",
        prefixo: "FT",
        categoria: 1,
        descricao: "documentos",
        empresa: 1,
        move_estoque: 1,
        move_conta_corrente: 1,
        move_a_credito: 1,
        requer_recibo: 1,
        usuario_added: 1,
        usuario_updated: 1,
        removido: 1,
    },
    Cambio: {
        moeda_padrao: "Metical",
        moeda_conversao: "Dollar",
        preco_compra: "100",
        preco_venda: "150",
        usuario_added: 1,
        usuario_updated: 1,
    },
    Traducao: {
        lingua: "Português",
        traducao_chave: "Pt1",
        traducao: "Bem-vindo",
        usuario_added: 1,
        usuario_updated: 1,
    },
};

const outputFile = "./swagger-output.json";
const endpointsFiles = [
    "./src/routes/auth.js",
    "./src/routes/usuario.js",
    "./src/routes/categoriaEstoque.js",
    "./src/routes/cliente.js",
    "./src/routes/empresa.js",
    "./src/routes/entidade.js",
    "./src/routes/fornecedor.js",
    "./src/routes/Permissao.js",
    "./src/routes/PermissaoGrupo.js",
    "./src/routes/stock.js",
    "./src/routes/taxa.js",
    "./src/routes/tipodoc.js",
    "./src/routes/usuario.js",
    "./src/routes/usuarioPermissao.js",
    "./src/routes/cambio.js",
    "./src/routes/lingua.js",
    "./src/routes/traducao.js",
    "./src/routes/traducaoChave.js",
    "./src/routes/Pdf.js",
    "./src/routes/armazem.js",
    "./src/routes/contaBancaria.js",
    "./src/routes/moeda.js",
    "./src/routes/pacote.js",
    "./src/routes/moedaCambioEmpresa.js",
    "./src/routes/modeloImpressao.js",
    "./src/routes/reciboAd.js",
    "./src/routes/documento.js",
    "./src/routes/transferencia.js",
    "./src/routes/despesa.js",
];

swaggerAutogen(outputFile, endpointsFiles, doc);

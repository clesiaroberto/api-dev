window.onload = function () {
    // Build a system
    var url = window.location.search.match(/url=([^&]+)/);
    if (url && url.length > 1) {
        url = decodeURIComponent(url[1]);
    } else {
        url = window.location.origin;
    }
    var options = {
        swaggerDoc: {
            swagger: "2.0",
            info: {
                title: "Documentação Erp",
                description: "Documentação",
                version: "1.0.0",
            },
            host: "http://localhost:3000",
            basePath: "/",
            tags: [],
            schemes: ["http", "https"],
            consumes: ["application/json"],
            produces: ["application/json"],
            paths: {
                "/auth": {
                    post: {
                        tags: ["Auth"],
                        description: "Endpoint para autenticação.",
                        parameters: [
                            {
                                name: "UserLogin",
                                in: "body",
                                description: "Informações do usuário.",
                                required: true,
                                type: "object",
                                schema: {
                                    $ref: "#/definitions/loginUser",
                                },
                            },
                        ],
                        responses: {
                            200: {
                                schema: {
                                    $ref: "#/definitions/User",
                                },
                                description:
                                    "Usuário Autenticado com Sucesso!.",
                            },
                            400: {
                                schema: {
                                    $ref: "#/definitions/UserEmpty",
                                },
                                description: "E-mail e Password imcompletos!.",
                            },
                            401: {
                                schema: {
                                    $ref: "#/definitions/loginUserErr",
                                },
                                description: "E-mail ou password incorrecto!.",
                            },
                            403: {
                                schema: {
                                    $ref: "#/definitions/UserErr",
                                },
                                description: "Conta desativada!.",
                            },
                        },
                    },
                },
                "/auth/refresh-token": {
                    post: {
                        tags: ["Auth"],
                        description:
                            "Endpoint para aumentar o tempo da sessão.",
                        parameters: [],
                        responses: {
                            200: {
                                schema: {
                                    $ref: "#/definitions/UserTokenSuccess",
                                },
                                description: "Sucesso!.",
                            },
                            401: {
                                schema: {
                                    $ref: "#/definitions/UnAuthorized",
                                },
                                description: "Não autorizado",
                            },
                        },
                    },
                },
                "/auth/verify-token": {
                    post: {
                        tags: ["Auth"],
                        description:
                            "Endpoint para verificar o token da sessão.",
                        parameters: [],
                        responses: {
                            200: {
                                schema: {
                                    $ref: "#/definitions/TokenSuccess",
                                },
                                description: "Usuário autenticado!.",
                            },
                            401: {
                                schema: {
                                    $ref: "#/definitions/UnAuthorized",
                                },
                                description: "Não autorizado",
                            },
                        },
                    },
                },
                "/auth/logout": {
                    post: {
                        tags: ["Auth"],
                        description: "Endpoint para terminar sessão.",
                        parameters: [],
                        responses: {
                            204: {
                                schema: {
                                    $ref: "#/definitions/LogOut",
                                },
                                description: "Fazendo Logout!.",
                            },
                        },
                    },
                },
                "/usuarios/": {
                    get: {
                        tags: ["Usuário"],
                        description: "Endpoint para Listar Usuário.",
                        parameters: [],
                        responses: {
                            200: {
                                schema: {
                                    $ref: "#/definitions/User",
                                },
                                description: "Listando Usuários.",
                            },
                        },
                    },
                },
                "/usuarios/{id}": {
                    get: {
                        tags: ["Usuário"],
                        description: "Endpoint para Listar Usuário por Id.",
                        parameters: [
                            {
                                name: "id",
                                in: "path",
                                required: true,
                                type: "string",
                            },
                        ],
                        responses: {
                            200: {
                                schema: {
                                    $ref: "#/definitions/User",
                                },
                                description:
                                    "Listando Usuário em função do Id.",
                            },
                            404: {
                                schema: {
                                    $ref: "#/definitions/IdNo",
                                },
                                description:
                                    "Usuário com ID ${id} não encontrado.",
                            },
                        },
                    },
                    put: {
                        tags: ["Usuário"],
                        description: "Endpoint para Actualizar Usuário.",
                        parameters: [
                            {
                                name: "id",
                                in: "path",
                                required: true,
                                type: "string",
                            },
                        ],
                        responses: {
                            200: {
                                schema: {
                                    $ref: "#/definitions/idUpdate",
                                },
                                description: "Dados atualizados com sucesso.",
                            },
                            404: {
                                schema: {
                                    $ref: "#/definitions/IdNo",
                                },
                                description: "Usuário não encontrado.",
                            },
                        },
                    },
                },
                "/usuarios/estado/{estado}": {
                    get: {
                        tags: ["Usuário"],
                        description:
                            "Endpoint para Listar Usuarios em função do Status .",
                        parameters: [
                            {
                                name: "estado",
                                in: "path",
                                required: true,
                                type: "string",
                            },
                        ],
                        responses: {
                            200: {
                                schema: {
                                    $ref: "#/definitions/User",
                                },
                                description:
                                    "Listando usuários em função do Status!.",
                            },
                        },
                    },
                },
                "/me": {
                    get: {
                        tags: ["Usuário"],
                        description:
                            "Endpoint para verificar os dados do Usuário Autenticado.",
                        parameters: [],
                        responses: {
                            200: {
                                schema: {
                                    $ref: "#/definitions/Empresa",
                                },
                                description: "Listando Perfil do Usuário!.",
                            },
                        },
                    },
                },
                "/usuarios": {
                    post: {
                        tags: ["Usuário"],
                        description: "Endpoint para Registar Usuário.",
                        parameters: [
                            {
                                name: "Usuario",
                                in: "body",
                                description: "Informações do Usuário.",
                                required: true,
                                type: "object",
                                schema: {
                                    $ref: "#/definitions/User",
                                },
                            },
                        ],
                        responses: {
                            200: {
                                schema: {
                                    $ref: "#/definitions/User",
                                },
                                description: "Usuário registado com sucesso.",
                            },
                            400: {
                                schema: {
                                    $ref: "#/definitions/emailNo",
                                },
                                description:
                                    "Usuário com E-mail ${email} já está cadastrado.",
                            },
                            404: {
                                schema: {
                                    $ref: "#/definitions/IdNo",
                                },
                                description: "A empresa informada não existe.",
                            },
                        },
                    },
                },
                "/usuarios/{id}/atualizar-estado": {
                    post: {
                        tags: ["Usuário"],
                        description: "Endpoint para Actualizar Status.",
                        parameters: [
                            {
                                name: "id",
                                in: "path",
                                required: true,
                                type: "string",
                            },
                            {
                                name: "obj",
                                in: "body",
                                schema: {
                                    type: "object",
                                    properties: {
                                        estado: {
                                            example: "any",
                                        },
                                    },
                                },
                            },
                        ],
                        responses: {
                            200: {
                                schema: {
                                    $ref: "#/definitions/statusUpdate",
                                },
                                description: "Status Actualizado com sucesso!.",
                            },
                            400: {
                                schema: {
                                    $ref: "#/definitions/idUpdate",
                                },
                                description:
                                    "Usuário não pode alterar o estado da própria conta.",
                            },
                            404: {
                                schema: {
                                    $ref: "#/definitions/IdNo",
                                },
                                description:
                                    "Usuário com ID ${id} não encontrado.",
                            },
                        },
                    },
                },
                "/me/confirm-password": {
                    post: {
                        tags: ["Usuário"],
                        description:
                            "Endpoint para confirmar password do usuário autenticado.",
                        parameters: [
                            {
                                name: "obj",
                                in: "body",
                                schema: {
                                    type: "object",
                                    properties: {
                                        password: {
                                            example: "any",
                                        },
                                    },
                                },
                            },
                        ],
                        responses: {
                            200: {
                                schema: {
                                    $ref: "#/definitions/SenhaOk",
                                },
                                description: "Senha confirmada.",
                            },
                            403: {
                                schema: {
                                    $ref: "#/definitions/SenhaActual",
                                },
                                description: "Senha incorreta.",
                            },
                        },
                    },
                },
                "/update-password/{id}": {
                    patch: {
                        tags: ["Usuário"],
                        description:
                            "Endpoint para Actualizar Senha do Administrador.",
                        parameters: [
                            {
                                name: "id",
                                in: "path",
                                required: true,
                                type: "string",
                            },
                            {
                                name: "obj",
                                in: "body",
                                schema: {
                                    type: "object",
                                    properties: {
                                        password: {
                                            example: "any",
                                        },
                                    },
                                },
                            },
                        ],
                        responses: {
                            200: {
                                schema: {
                                    $ref: "#/definitions/idUpdate",
                                },
                                description: "Senha alterada com Sucesso.",
                            },
                            400: {
                                schema: {
                                    $ref: "#/definitions/IdAdmin",
                                },
                                description:
                                    "Não podes alterar senha de um administrador.",
                            },
                            404: {
                                schema: {
                                    $ref: "#/definitions/IdNo",
                                },
                                description: "Usuário não encontrado.",
                            },
                        },
                    },
                },
                "\r/usuarios/password-update": {
                    post: {
                        tags: ["Usuário"],
                        description:
                            "Endpoint para Actualizar Senha do Usuário.",
                        parameters: [
                            {
                                name: "obj",
                                in: "body",
                                schema: {
                                    type: "object",
                                    properties: {
                                        senha_actual: {
                                            example: "any",
                                        },
                                        nova_senha: {
                                            example: "any",
                                        },
                                    },
                                },
                            },
                        ],
                        responses: {
                            200: {
                                schema: {
                                    $ref: "#/definitions/SenhaUpdate",
                                },
                                description: "Senha alterada com Sucesso.",
                            },
                            400: {
                                schema: {
                                    $ref: "#/definitions/NovaSenha",
                                },
                                description:
                                    "A nova senha não pode ser igual a senha atual.",
                            },
                        },
                    },
                },
                "/categorias-stock": {
                    get: {
                        tags: ["Categoria de stock"],
                        description:
                            "Endpoint para listar todas as categorias de stock.",
                        parameters: [],
                        responses: {
                            200: {
                                schema: {
                                    $ref: "#/definitions/Categoria_stock",
                                },
                                description: "OK",
                            },
                        },
                    },
                    post: {
                        tags: ["Categoria de stock"],
                        description: "Endpoint para criar categoria de stock.",
                        parameters: [
                            {
                                name: "Categoria_stock",
                                in: "body",
                                description:
                                    "Informações da categoria de stock.",
                                required: true,
                                type: "object",
                                schema: {
                                    $ref: "#/definitions/Categoria_stock",
                                },
                            },
                        ],
                        responses: {
                            200: {
                                schema: {
                                    $ref: "#/definitions/registerSuccess",
                                },
                                description: "Dados adicionados com sucesso",
                            },
                            409: {
                                schema: {
                                    $ref: "#/definitions/CategoryNo",
                                },
                                description:
                                    "Categoria ${data.nome} já está registada",
                            },
                        },
                    },
                },
                "/categorias-stock/{id}": {
                    get: {
                        tags: ["Categoria de stock"],
                        description:
                            "Endpoint para listar categoria de stock em função do Id.",
                        parameters: [
                            {
                                name: "id",
                                in: "path",
                                required: true,
                                type: "string",
                            },
                        ],
                        responses: {
                            200: {
                                schema: {
                                    $ref: "#/definitions/Categoria_stock",
                                },
                                description:
                                    "Categoria com ID ${id} não encontrada",
                            },
                            404: {
                                schema: {
                                    $ref: "#/definitions/IdNo",
                                },
                                description:
                                    "Categoria com ID ${id} não encontrado.",
                            },
                        },
                    },
                    put: {
                        tags: ["Categoria de stock"],
                        description:
                            "Endpoint para actualizar categoria de stock.",
                        parameters: [
                            {
                                name: "id",
                                in: "path",
                                required: true,
                                type: "string",
                            },
                            {
                                name: "Categoria_stock",
                                in: "body",
                                description:
                                    "Informações da categoria de stock.",
                                required: true,
                                type: "object",
                                schema: {
                                    $ref: "#/definitions/Categoria_stock",
                                },
                            },
                        ],
                        responses: {
                            200: {
                                schema: {
                                    $ref: "#/definitions/idUpdate",
                                },
                                description: "Dados atualizados com sucesso.",
                            },
                            404: {
                                schema: {
                                    $ref: "#/definitions/IdNo",
                                },
                                description:
                                    "Categoria de stock não encontrada.",
                            },
                        },
                    },
                    delete: {
                        tags: ["Categoria de stock"],
                        description: "Endpoint para criar categoria de stock.",
                        parameters: [
                            {
                                name: "id",
                                in: "path",
                                required: true,
                                type: "string",
                            },
                        ],
                        responses: {
                            200: {
                                schema: {
                                    $ref: "#/definitions/idDelete",
                                },
                                description: "Categoria removida com sucesso",
                            },
                            404: {
                                schema: {
                                    $ref: "#/definitions/IdNo",
                                },
                                description: "Categoria não encontrada.",
                            },
                        },
                    },
                },
                "/clientes": {
                    post: {
                        tags: ["Cliente"],
                        description: "Cadastro de clientes.",
                        parameters: [
                            {
                                name: "Cliente",
                                in: "body",
                                description: "Informações do cliente.",
                                required: true,
                                type: "object",
                                schema: {
                                    $ref: "#/definitions/Cliente",
                                },
                            },
                        ],
                        responses: {
                            200: {
                                schema: {
                                    $ref: "#/definitions/registerSuccess",
                                },
                                description: "Dados adicionados com sucesso",
                            },
                            409: {
                                schema: {
                                    $ref: "#/definitions/emailNo",
                                },
                                description:
                                    "O cliente com email ${email} já está registado",
                            },
                        },
                    },
                    get: {
                        tags: ["Cliente"],
                        description: "Endpoint para listar Clientes.",
                        produces: [],
                        parameters: [
                            {
                                name: "page",
                                in: "query",
                                type: "string",
                            },
                            {
                                name: "perPage",
                                in: "query",
                                type: "string",
                            },
                            {
                                name: "q",
                                in: "query",
                                type: "string",
                            },
                        ],
                        responses: {
                            200: {
                                schema: {
                                    $ref: "#/definitions/Cliente",
                                },
                                description: "Listando Clientes",
                            },
                        },
                    },
                },
                "/clientes/{id}": {
                    put: {
                        tags: ["Cliente"],
                        description:
                            "Endpoint para actualizar dados dos Clientes.",
                        parameters: [
                            {
                                name: "id",
                                in: "path",
                                required: true,
                                type: "string",
                            },
                            {
                                name: "Cliente",
                                in: "body",
                                description: "Informações do cliente.",
                                required: true,
                                type: "object",
                                schema: {
                                    $ref: "#/definitions/Cliente",
                                },
                            },
                        ],
                        responses: {
                            200: {
                                schema: {
                                    $ref: "#/definitions/idUpdate",
                                },
                                description: "Atualizado com sucesso.",
                            },
                            404: {
                                schema: {
                                    $ref: "#/definitions/IdNo",
                                },
                                description: "Registo não encontrado.",
                            },
                        },
                    },
                    get: {
                        tags: ["Cliente"],
                        description:
                            "Endpoint para listar Clientes em função do Id.",
                        parameters: [
                            {
                                name: "id",
                                in: "path",
                                required: true,
                                type: "string",
                            },
                        ],
                        responses: {
                            200: {
                                schema: {
                                    $ref: "#/definitions/Cliente",
                                },
                                description: "Listando Clientes",
                            },
                            404: {
                                schema: {
                                    $ref: "#/definitions/IdNo",
                                },
                                description: "Cliente não encontrado.",
                            },
                        },
                    },
                    delete: {
                        tags: ["Cliente"],
                        description:
                            "Endpoint para remover Clientes em função do Id.",
                        parameters: [
                            {
                                name: "id",
                                in: "path",
                                required: true,
                                type: "string",
                            },
                        ],
                        responses: {
                            200: {
                                schema: {
                                    $ref: "#/definitions/idDelete",
                                },
                                description: "Removido com sucesso",
                            },
                            404: {
                                schema: {
                                    $ref: "#/definitions/IdNo",
                                },
                                description: "Removendo Clientes",
                            },
                        },
                    },
                },
                "/clientes-pdf": {
                    get: {
                        tags: [],
                        description: "",
                        produces: [],
                        parameters: [],
                        responses: {},
                    },
                },
                "/clientesExcel": {
                    get: {
                        tags: [],
                        description: "",
                        produces: [],
                        parameters: [
                            {
                                name: "obj",
                                in: "body",
                                schema: {
                                    type: "object",
                                    properties: {
                                        from: {
                                            example: "any",
                                        },
                                        to: {
                                            example: "any",
                                        },
                                    },
                                },
                            },
                        ],
                        responses: {},
                    },
                },
                "/empresas": {
                    get: {
                        tags: ["Empresa"],
                        description: "Endpoint para listar empresas.",
                        produces: [],
                        parameters: [
                            {
                                name: "page",
                                in: "query",
                                type: "string",
                            },
                            {
                                name: "perPage",
                                in: "query",
                                type: "string",
                            },
                            {
                                name: "q",
                                in: "query",
                                type: "string",
                            },
                        ],
                        responses: {
                            200: {
                                schema: {
                                    $ref: "#/definitions/Empresa",
                                },
                                description: "Listando Empresas",
                            },
                        },
                    },
                    post: {
                        tags: ["Empresa"],
                        description: "Endpoint para cadastrar empresas.",
                        parameters: [
                            {
                                name: "Empresa",
                                in: "body",
                                description:
                                    "Informações da categoria de stock.",
                                required: true,
                                type: "object",
                                schema: {
                                    $ref: "#/definitions/Empresa",
                                },
                            },
                        ],
                        responses: {
                            200: {
                                schema: {
                                    $ref: "#/definitions/registerSuccess",
                                },
                                description: "Empresa registada com sucesso.",
                            },
                            409: {
                                schema: {
                                    $ref: "#/definitions/NameNo",
                                },
                                description:
                                    "Empresa com nome ${nome} já está cadastrada.",
                            },
                        },
                    },
                },
                "/empresas/one": {
                    get: {
                        tags: ["Empresa"],
                        description:
                            "Endpoint para listar empresa do Usuário que está autenticado.",
                        parameters: [],
                        responses: {
                            200: {
                                schema: {
                                    $ref: "#/definitions/Empresa",
                                },
                                description: "Encontrada a Empresa.",
                            },
                            404: {
                                schema: {
                                    $ref: "#/definitions/IdNo",
                                },
                                description:
                                    "Empresa com ID ${id} não encontrado.",
                            },
                        },
                    },
                },
                "/empresas/one/{id}": {
                    get: {
                        tags: ["Empresa"],
                        description:
                            "Endpoint para listar empresa em função do Id.",
                        parameters: [
                            {
                                name: "id",
                                in: "path",
                                required: true,
                                type: "string",
                            },
                        ],
                        responses: {
                            200: {
                                schema: {
                                    $ref: "#/definitions/Empresa",
                                },
                                description:
                                    "Listando Empresas em função do ID.",
                            },
                            404: {
                                schema: {
                                    $ref: "#/definitions/IdNo",
                                },
                                description:
                                    "Empresa com ID ${id} não encontrado.",
                            },
                        },
                    },
                },
                "/empresas/{id}": {
                    put: {
                        tags: ["Empresa"],
                        description:
                            "Endpoint para actualizar dados da empresa.",
                        parameters: [
                            {
                                name: "id",
                                in: "path",
                                required: true,
                                type: "string",
                            },
                            {
                                name: "Empresa",
                                in: "body",
                                description:
                                    "Informações da categoria de stock.",
                                required: true,
                                type: "object",
                                schema: {
                                    $ref: "#/definitions/Empresa",
                                },
                            },
                        ],
                        responses: {
                            200: {
                                schema: {
                                    $ref: "#/definitions/idUpdate",
                                },
                                description: "Dados atualizados com sucesso.",
                            },
                            400: {
                                schema: {
                                    $ref: "#/definitions/NameNo",
                                },
                                description:
                                    "Empresa com email ${nome} já está cadastrada.",
                            },
                            404: {
                                schema: {
                                    $ref: "#/definitions/IdNo",
                                },
                                description: "Empresa com ID ${id} não existe.",
                            },
                        },
                    },
                },
                "/empresas/usuarios/{id}": {
                    get: {
                        tags: ["Empresa"],
                        description:
                            "Endpoint para usuarios que pertencem a empresa.",
                        parameters: [
                            {
                                name: "id",
                                in: "path",
                                required: true,
                                type: "string",
                            },
                        ],
                        responses: {
                            200: {
                                schema: {
                                    $ref: "#/definitions/User",
                                },
                                description:
                                    "Listando Usuários que pertencem a empresa",
                            },
                        },
                    },
                },
                "/entidades": {
                    get: {
                        tags: ["Entidade"],
                        description: "Endpoint para listar todas as entidades.",
                        produces: [],
                        parameters: [
                            {
                                name: "page",
                                in: "query",
                                type: "string",
                            },
                            {
                                name: "perPage",
                                in: "query",
                                type: "string",
                            },
                            {
                                name: "q",
                                in: "query",
                                type: "string",
                            },
                        ],
                        responses: {
                            200: {
                                schema: {
                                    $ref: "#/definitions/Entidade",
                                },
                                description: "Listando Entidades",
                            },
                        },
                    },
                    post: {
                        tags: ["Entidade"],
                        description: "Endpoint para cadastrar entidades.",
                        parameters: [
                            {
                                name: "Entidade",
                                in: "body",
                                description: "Informações da Entidade.",
                                required: true,
                                type: "object",
                                schema: {
                                    $ref: "#/definitions/Entidade",
                                },
                            },
                        ],
                        responses: {
                            200: {
                                schema: {
                                    $ref: "#/definitions/registerSuccess",
                                },
                                description: "Dados adicionados com sucesso.",
                            },
                            409: {
                                schema: {
                                    $ref: "#/definitions/emailNo",
                                },
                                description:
                                    "Entidade com e-mail ${email} já está registada",
                            },
                        },
                    },
                },
                "/entidades/{id}": {
                    get: {
                        tags: ["Entidade"],
                        description:
                            "Endpoint para listar entidades em função do Id.",
                        parameters: [
                            {
                                name: "id",
                                in: "path",
                                required: true,
                                type: "string",
                            },
                        ],
                        responses: {
                            200: {
                                schema: {
                                    $ref: "#/definitions/Entidade",
                                },
                                description:
                                    "Listando Entidade em função do Id.",
                            },
                            404: {
                                schema: {
                                    $ref: "#/definitions/IdNo",
                                },
                                description: "Entidade não encontrada.",
                            },
                        },
                    },
                    put: {
                        tags: ["Entidade"],
                        description: "Endpoint para actualizar entidades.",
                        parameters: [
                            {
                                name: "id",
                                in: "path",
                                required: true,
                                type: "string",
                            },
                            {
                                name: "Entidade",
                                in: "body",
                                description: "Informações da Entidade.",
                                required: true,
                                type: "object",
                                schema: {
                                    $ref: "#/definitions/Entidade",
                                },
                            },
                        ],
                        responses: {
                            200: {
                                schema: {
                                    $ref: "#/definitions/idUpdate",
                                },
                                description: "Atualizado com sucesso.",
                            },
                            404: {
                                schema: {
                                    $ref: "#/definitions/IdNo",
                                },
                                description: "Registo não encontrado",
                            },
                        },
                    },
                    delete: {
                        tags: ["Entidade"],
                        description: "Endpoint para ____FUNC____ entidades.",
                        parameters: [
                            {
                                name: "id",
                                in: "path",
                                required: true,
                                type: "string",
                            },
                        ],
                        responses: {
                            200: {
                                schema: {
                                    $ref: "#/definitions/idDelete",
                                },
                                description: "Removido com sucesso",
                            },
                            404: {
                                schema: {
                                    $ref: "#/definitions/IdNo",
                                },
                                description: "Registo não encontrado.",
                            },
                        },
                    },
                },
                "/entidades/nome/{name}": {
                    get: {
                        tags: ["Entidade"],
                        description:
                            "Endpoint para listar entidades em função do Nome.",
                        parameters: [
                            {
                                name: "name",
                                in: "path",
                                required: true,
                                type: "string",
                            },
                        ],
                        responses: {
                            200: {
                                schema: {
                                    $ref: "#/definitions/Entidade",
                                },
                                description: "Listando Entidade.",
                            },
                            404: {
                                schema: {
                                    $ref: "#/definitions/NameNo",
                                },
                                description: "Entidade ${name} não encontrada.",
                            },
                        },
                    },
                },
                "/entidades-excel": {
                    get: {
                        tags: [],
                        description: "",
                        produces: [],
                        parameters: [
                            {
                                name: "obj",
                                in: "body",
                                schema: {
                                    type: "object",
                                    properties: {
                                        from: {
                                            example: "any",
                                        },
                                        to: {
                                            example: "any",
                                        },
                                    },
                                },
                            },
                        ],
                        responses: {},
                    },
                },
                "/entidades/removidos/find": {
                    get: {
                        tags: ["Entidade"],
                        description:
                            "Endpoint para listar entidades com estado removido true (1).",
                        produces: [],
                        parameters: [
                            {
                                name: "page",
                                in: "query",
                                type: "string",
                            },
                            {
                                name: "perPage",
                                in: "query",
                                type: "string",
                            },
                            {
                                name: "q",
                                in: "query",
                                type: "string",
                            },
                        ],
                        responses: {
                            200: {
                                schema: {
                                    $ref: "#/definitions/Entidade",
                                },
                                description:
                                    "Listando Entidade em função do Estado.",
                            },
                        },
                    },
                },
                "/fornecedores": {
                    get: {
                        tags: ["Fornecedor"],
                        description: "Endpoint para listar Fornecedores.",
                        produces: [],
                        parameters: [
                            {
                                name: "page",
                                in: "query",
                                type: "string",
                            },
                            {
                                name: "perPage",
                                in: "query",
                                type: "string",
                            },
                            {
                                name: "q",
                                in: "query",
                                type: "string",
                            },
                        ],
                        responses: {
                            200: {
                                schema: {
                                    $ref: "#/definitions/Fornecedor",
                                },
                                description: "Listando Fornecedores",
                            },
                        },
                    },
                    post: {
                        tags: ["Fornecedor"],
                        description: "Endpoint para cadastrar Fornecedores.",
                        parameters: [
                            {
                                name: "Entidade",
                                in: "body",
                                description: "Informações do Fornecedor.",
                                required: true,
                                type: "object",
                                schema: {
                                    $ref: "#/definitions/Fornecedor",
                                },
                            },
                        ],
                        responses: {
                            200: {
                                schema: {
                                    $ref: "#/definitions/registerSuccess",
                                },
                                description: "Adicionado com sucesso.",
                            },
                            409: {
                                schema: {
                                    $ref: "#/definitions/emailNo",
                                },
                                description:
                                    "Fornecedor com e-mail ${email} já está registado",
                            },
                        },
                    },
                },
                "/fornecedores/{id}": {
                    get: {
                        tags: ["Fornecedor"],
                        description:
                            "Endpoint para listar Fornecedores em Função do Id.",
                        parameters: [
                            {
                                name: "id",
                                in: "path",
                                required: true,
                                type: "string",
                            },
                        ],
                        responses: {
                            200: {
                                schema: {
                                    $ref: "#/definitions/Fornecedor",
                                },
                                description:
                                    "Listando Fornecedor em função do Id.",
                            },
                            404: {
                                schema: {
                                    $ref: "#/definitions/IdNo",
                                },
                                description: "Registo não encontrado.",
                            },
                        },
                    },
                    put: {
                        tags: ["Fornecedor"],
                        description: "Endpoint para actualizar Fornecedores",
                        parameters: [
                            {
                                name: "id",
                                in: "path",
                                required: true,
                                type: "string",
                            },
                            {
                                name: "Fornecedor",
                                in: "body",
                                description: "Informações do Fornecedor.",
                                required: true,
                                type: "object",
                                schema: {
                                    $ref: "#/definitions/Fornecedor",
                                },
                            },
                        ],
                        responses: {
                            200: {
                                schema: {
                                    $ref: "#/definitions/idUpdate",
                                },
                                description: "Atualizado com sucesso.",
                            },
                            404: {
                                schema: {
                                    $ref: "#/definitions/IdNo",
                                },
                                description: "Registo não encontrado",
                            },
                        },
                    },
                    delete: {
                        tags: ["Fornecedor"],
                        description: "Endpoint para ____FUNC____ Fornecedores.",
                        parameters: [
                            {
                                name: "id",
                                in: "path",
                                required: true,
                                type: "string",
                            },
                        ],
                        responses: {
                            200: {
                                schema: {
                                    $ref: "#/definitions/idDelete",
                                },
                                description: "Removido com sucesso",
                            },
                            404: {
                                schema: {
                                    $ref: "#/definitions/IdNo",
                                },
                                description: "Registo não encontrado.",
                            },
                        },
                    },
                },
                "/fornecedores/nome/{name}": {
                    get: {
                        tags: ["Fornecedor"],
                        description:
                            "Endpoint para listar Fornecedores em função do Nome.",
                        parameters: [
                            {
                                name: "name",
                                in: "path",
                                required: true,
                                type: "string",
                            },
                        ],
                        responses: {
                            200: {
                                schema: {
                                    $ref: "#/definitions/Fornecedor",
                                },
                                description: "Listando Fornecedor.",
                            },
                            404: {
                                schema: {
                                    $ref: "#/definitions/NameNo",
                                },
                                description: "Registo ${name} não encontrado.",
                            },
                        },
                    },
                },
                "/fornecedores-excel": {
                    get: {
                        tags: [],
                        description: "",
                        produces: [],
                        parameters: [
                            {
                                name: "obj",
                                in: "body",
                                schema: {
                                    type: "object",
                                    properties: {
                                        from: {
                                            example: "any",
                                        },
                                        to: {
                                            example: "any",
                                        },
                                    },
                                },
                            },
                        ],
                        responses: {},
                    },
                },
                "/fornecedores/removidos/find": {
                    get: {
                        tags: ["Fornecedor"],
                        description:
                            "Endpoint para listar Fornecedores com status true (1) removido.",
                        produces: [],
                        parameters: [
                            {
                                name: "page",
                                in: "query",
                                type: "string",
                            },
                            {
                                name: "perPage",
                                in: "query",
                                type: "string",
                            },
                            {
                                name: "q",
                                in: "query",
                                type: "string",
                            },
                        ],
                        responses: {
                            200: {
                                schema: {
                                    $ref: "#/definitions/Fornecedor",
                                },
                                description:
                                    "Listando Fornecedor em função do Estado.",
                            },
                        },
                    },
                },
                "/preco-compra/{preco_id}": {
                    delete: {
                        tags: [],
                        description: "",
                        parameters: [
                            {
                                name: "preco_id",
                                in: "path",
                                required: true,
                                type: "string",
                            },
                        ],
                        responses: {},
                    },
                },
                "/stock/update/fornecedor/{preco_id}": {
                    put: {
                        tags: [],
                        description: "",
                        parameters: [
                            {
                                name: "preco_id",
                                in: "path",
                                required: true,
                                type: "string",
                            },
                            {
                                name: "obj",
                                in: "body",
                                schema: {
                                    type: "object",
                                    properties: {
                                        preco_compra: {
                                            example: "any",
                                        },
                                        moeda_compra: {
                                            example: "any",
                                        },
                                        stock: {
                                            example: "any",
                                        },
                                    },
                                },
                            },
                        ],
                        responses: {},
                    },
                },
                "/stock/update/fornecedor/{fornecedor_id}/{stock_id}": {
                    put: {
                        tags: [],
                        description: "",
                        parameters: [
                            {
                                name: "fornecedor_id",
                                in: "path",
                                required: true,
                                type: "string",
                            },
                            {
                                name: "stock_id",
                                in: "path",
                                required: true,
                                type: "string",
                            },
                            {
                                name: "obj",
                                in: "body",
                                schema: {
                                    type: "object",
                                    properties: {
                                        preco_compra: {
                                            example: "any",
                                        },
                                    },
                                },
                            },
                        ],
                        responses: {},
                    },
                },
                "/stock/add/fornecedor/{stock}/{fornecedor}": {
                    post: {
                        tags: [],
                        description: "",
                        parameters: [
                            {
                                name: "stock",
                                in: "path",
                                required: true,
                                type: "string",
                            },
                            {
                                name: "fornecedor",
                                in: "path",
                                required: true,
                                type: "string",
                            },
                            {
                                name: "obj",
                                in: "body",
                                schema: {
                                    type: "object",
                                    properties: {
                                        preco_compra: {
                                            example: "any",
                                        },
                                        moeda_compra: {
                                            example: "any",
                                        },
                                    },
                                },
                            },
                        ],
                        responses: {},
                    },
                },
                "/stock-preco/fornecedor/{fornecedor}": {
                    get: {
                        tags: [],
                        description: "",
                        parameters: [
                            {
                                name: "fornecedor",
                                in: "path",
                                required: true,
                                type: "string",
                            },
                        ],
                        responses: {},
                    },
                },
                "/preco-stock/fornecedor/{id}": {
                    get: {
                        tags: [],
                        description: "",
                        parameters: [
                            {
                                name: "id",
                                in: "path",
                                required: true,
                                type: "string",
                            },
                        ],
                        responses: {},
                    },
                },
                "/permissoes": {
                    post: {
                        tags: ["Permissao"],
                        description: "Endpoint para criar Permissao.",
                        parameters: [
                            {
                                name: "obj",
                                in: "body",
                                schema: {
                                    type: "object",
                                    properties: {
                                        nome: {
                                            example: "any",
                                        },
                                        grupo: {
                                            example: "any",
                                        },
                                    },
                                },
                            },
                        ],
                        responses: {
                            200: {
                                schema: {
                                    $ref: "#/definitions/registerSuccess",
                                },
                                description: "Permissão registada com sucesso.",
                            },
                            400: {
                                schema: {
                                    $ref: "#/definitions/GrupoNo",
                                },
                                description: "O grupo de permissão não existe",
                            },
                        },
                    },
                    get: {
                        tags: ["Permissao"],
                        description: "Endpoint para listar Permissoes.",
                        parameters: [],
                        responses: {
                            200: {
                                schema: {
                                    $ref: "#/definitions/Permissao",
                                },
                                description: "Listando Permissoes",
                            },
                        },
                    },
                },
                "/permissoes/por_grupo/{id}": {
                    get: {
                        tags: ["Permissao"],
                        description:
                            "Endpoint para listar Permissoes em funcao do Id do grupo.",
                        parameters: [
                            {
                                name: "id",
                                in: "path",
                                required: true,
                                type: "string",
                            },
                        ],
                        responses: {
                            200: {
                                schema: {
                                    $ref: "#/definitions/Permissao",
                                },
                                description:
                                    "Listando Permissão em função do Id.",
                            },
                            404: {
                                schema: {
                                    $ref: "#/definitions/IdNo",
                                },
                                description:
                                    "Permissão com grupo não encontrada.",
                            },
                        },
                    },
                },
                "/permissoes/{id}": {
                    get: {
                        tags: ["Permissao"],
                        description:
                            "Endpoint para listar Permissoes em funcao do Id.",
                        parameters: [
                            {
                                name: "id",
                                in: "path",
                                required: true,
                                type: "string",
                            },
                        ],
                        responses: {
                            200: {
                                schema: {
                                    $ref: "#/definitions/Permissao",
                                },
                                description: "Listando Permissão.",
                            },
                        },
                    },
                },
                "/grupo/permissoes": {
                    post: {
                        tags: ["Permissao Grupo"],
                        description: "Endpoint para criar Grupo de Permissoes.",
                        parameters: [
                            {
                                name: "obj",
                                in: "body",
                                schema: {
                                    type: "object",
                                    properties: {
                                        nome: {
                                            example: "any",
                                        },
                                    },
                                },
                            },
                        ],
                        responses: {
                            200: {
                                schema: {
                                    $ref: "#/definitions/registerSuccess",
                                },
                                description:
                                    "Grupo de Permissões registado com sucesso.",
                            },
                            400: {
                                schema: {
                                    $ref: "#/definitions/nameYes",
                                },
                                description:
                                    "A permissão ${nome} já está cadastrada.",
                            },
                        },
                    },
                    get: {
                        tags: ["Permissao Grupo"],
                        description:
                            "Endpoint para listar Grupo de Permissoes.",
                        parameters: [],
                        responses: {
                            200: {
                                schema: {
                                    $ref: "#/definitions/Permissao_Grupo",
                                },
                                description: "Listando Grupos de Permissão",
                            },
                        },
                    },
                },
                "/grupo/permissoes/{id}": {
                    get: {
                        tags: ["Permissao Grupo"],
                        description:
                            "Endpoint para listar Grupo de Permissoes em função do Id.",
                        parameters: [
                            {
                                name: "id",
                                in: "path",
                                required: true,
                                type: "string",
                            },
                        ],
                        responses: {
                            200: {
                                schema: {
                                    $ref: "#/definitions/Permissao_Grupo",
                                },
                                description:
                                    "Listando Grupo de Permissão em função do Id.",
                            },
                            400: {
                                schema: {
                                    $ref: "#/definitions/IdNo",
                                },
                                description:
                                    "Grupo de Permissão com ID ${id} não encontrado.",
                            },
                        },
                    },
                },
                "/grupo/permissoes/nome/{nome}": {
                    get: {
                        tags: ["Permissao Grupo"],
                        description:
                            "Endpoint para listar Grupo de Permissoes em função do Nome.",
                        parameters: [
                            {
                                name: "nome",
                                in: "path",
                                required: true,
                                type: "string",
                            },
                        ],
                        responses: {
                            200: {
                                schema: {
                                    $ref: "#/definitions/Permissao_Grupo",
                                },
                                description:
                                    "Listando Grupo de Permissão em função do Nome",
                            },
                            400: {
                                schema: {
                                    $ref: "#/definitions/NameNo",
                                },
                                description:
                                    "Grupo de Permissão com o nome ${nome} não encontrado.",
                            },
                        },
                    },
                },
                "/stock": {
                    get: {
                        tags: ["Stock"],
                        description: "Endpoint para listar Stock.",
                        produces: [],
                        parameters: [
                            {
                                name: "page",
                                in: "query",
                                type: "string",
                            },
                            {
                                name: "perPage",
                                in: "query",
                                type: "string",
                            },
                            {
                                name: "q",
                                in: "query",
                                type: "string",
                            },
                        ],
                        responses: {
                            200: {
                                schema: {
                                    $ref: "#/definitions/Stock",
                                },
                                description: "Listando Stock.",
                            },
                        },
                    },
                    post: {
                        tags: ["Stock"],
                        description: "Endpoint para cadastrar Stock.",
                        parameters: [
                            {
                                name: "obj",
                                in: "body",
                                schema: {
                                    type: "object",
                                    properties: {
                                        preco_venda: {
                                            example: "any",
                                        },
                                        preco_compra: {
                                            example: "any",
                                        },
                                        moeda_compra: {
                                            example: "any",
                                        },
                                        moeda_venda: {
                                            example: "any",
                                        },
                                        venda_taxa: {
                                            example: "any",
                                        },
                                        compra_taxa: {
                                            example: "any",
                                        },
                                        venda_taxa_inclusa: {
                                            example: "any",
                                        },
                                        compra_taxa_inclusa: {
                                            example: "any",
                                        },
                                    },
                                },
                            },
                        ],
                        responses: {
                            200: {
                                schema: {
                                    $ref: "#/definitions/Stock",
                                },
                                description: "Stock registado com sucesso.",
                            },
                            404: {
                                schema: {
                                    $ref: "#/definitions/NaoCadastrado",
                                },
                                description: "Categoria não está cadastrada.",
                            },
                            409: {
                                schema: {
                                    $ref: "#/definitions/StockYes",
                                },
                                description: "Stock já informado.",
                            },
                        },
                    },
                },
                "/stock/update/{preco_id}": {
                    put: {
                        tags: [],
                        description: "",
                        parameters: [
                            {
                                name: "preco_id",
                                in: "path",
                                required: true,
                                type: "string",
                            },
                            {
                                name: "obj",
                                in: "body",
                                schema: {
                                    type: "object",
                                    properties: {
                                        preco_venda: {
                                            example: "any",
                                        },
                                        moeda_venda: {
                                            example: "any",
                                        },
                                    },
                                },
                            },
                        ],
                        responses: {},
                    },
                },
                "/stock/update/cliente/{cliente_id}/{stock_id}": {
                    put: {
                        tags: [],
                        description: "",
                        parameters: [
                            {
                                name: "cliente_id",
                                in: "path",
                                required: true,
                                type: "string",
                            },
                            {
                                name: "stock_id",
                                in: "path",
                                required: true,
                                type: "string",
                            },
                            {
                                name: "obj",
                                in: "body",
                                schema: {
                                    type: "object",
                                    properties: {
                                        preco_venda: {
                                            example: "any",
                                        },
                                    },
                                },
                            },
                        ],
                        responses: {},
                    },
                },
                "/stock/add/{stock}/{cliente}": {
                    post: {
                        tags: [],
                        description: "",
                        parameters: [
                            {
                                name: "stock",
                                in: "path",
                                required: true,
                                type: "string",
                            },
                            {
                                name: "cliente",
                                in: "path",
                                required: true,
                                type: "string",
                            },
                            {
                                name: "obj",
                                in: "body",
                                schema: {
                                    type: "object",
                                    properties: {
                                        preco_venda: {
                                            example: "any",
                                        },
                                        moeda_venda: {
                                            example: "any",
                                        },
                                    },
                                },
                            },
                        ],
                        responses: {},
                    },
                },
                "/stock/{id}": {
                    get: {
                        tags: ["Stock"],
                        description:
                            "Endpoint para listar stock em função do Id.",
                        parameters: [
                            {
                                name: "id",
                                in: "path",
                                required: true,
                                type: "string",
                            },
                        ],
                        responses: {
                            200: {
                                schema: {
                                    $ref: "#/definitions/Stock",
                                },
                                description: "Listando Stock em função do Id.",
                            },
                            404: {
                                schema: {
                                    $ref: "#/definitions/IdNo",
                                },
                                description: "Registo não encontrado.",
                            },
                        },
                    },
                    delete: {
                        tags: ["Stock"],
                        description: "Endpoint para ____FUNC____ stock.",
                        parameters: [
                            {
                                name: "id",
                                in: "path",
                                required: true,
                                type: "string",
                            },
                        ],
                        responses: {
                            200: {
                                schema: {
                                    $ref: "#/definitions/idDelete",
                                },
                                description: "removido com sucesso.",
                            },
                            404: {
                                schema: {
                                    $ref: "#/definitions/IdNo",
                                },
                                description: "Registo não encontrado.",
                            },
                        },
                    },
                    put: {
                        tags: ["Stock"],
                        description: "Endpoint para actualizar stock.",
                        parameters: [
                            {
                                name: "id",
                                in: "path",
                                required: true,
                                type: "string",
                            },
                            {
                                name: "obj",
                                in: "body",
                                schema: {
                                    type: "object",
                                    properties: {
                                        preco_venda: {
                                            example: "any",
                                        },
                                        preco_compra: {
                                            example: "any",
                                        },
                                        venda_taxa: {
                                            example: "any",
                                        },
                                        moeda_compra: {
                                            example: "any",
                                        },
                                        moeda_venda: {
                                            example: "any",
                                        },
                                        compra_taxa: {
                                            example: "any",
                                        },
                                        venda_taxa_inclusa: {
                                            example: "any",
                                        },
                                        compra_taxa_inclusa: {
                                            example: "any",
                                        },
                                    },
                                },
                            },
                        ],
                        responses: {
                            200: {
                                schema: {
                                    $ref: "#/definitions/idUpdate",
                                },
                                description: "Dados atualizados com sucesso.",
                            },
                            404: {
                                schema: {
                                    $ref: "#/definitions/Categoryes",
                                },
                                description:
                                    "Categoria de stock não está cadastrada.",
                            },
                        },
                    },
                },
                "/stock-preco/{clienteId}": {
                    get: {
                        tags: ["Preco_venda"],
                        description: "Endpoint para listar Stock.",
                        parameters: [
                            {
                                name: "clienteId",
                                in: "path",
                                required: true,
                                type: "string",
                            },
                        ],
                        responses: {},
                    },
                },
                "/preco-stock/{id}": {
                    get: {
                        tags: ["Preco_venda"],
                        description: "Endpoint para listar Stock.",
                        parameters: [
                            {
                                name: "id",
                                in: "path",
                                required: true,
                                type: "string",
                            },
                        ],
                        responses: {},
                    },
                },
                "/stock/ref/{ref}": {
                    get: {
                        tags: ["Stock"],
                        description:
                            "Endpoint para listar stock em função do Id.",
                        parameters: [
                            {
                                name: "ref",
                                in: "path",
                                required: true,
                                type: "string",
                            },
                        ],
                        responses: {
                            200: {
                                schema: {
                                    $ref: "#/definitions/Stock",
                                },
                                description: "Listando Stock em função do Id.",
                            },
                            404: {
                                schema: {
                                    $ref: "#/definitions/IdNo",
                                },
                                description: "Registo não encontrado.",
                            },
                        },
                    },
                },
                "/stock-excel": {
                    get: {
                        tags: [],
                        description: "",
                        produces: [],
                        parameters: [
                            {
                                name: "obj",
                                in: "body",
                                schema: {
                                    type: "object",
                                    properties: {
                                        from: {
                                            example: "any",
                                        },
                                        to: {
                                            example: "any",
                                        },
                                    },
                                },
                            },
                        ],
                        responses: {},
                    },
                },
                "/stock/removed/all": {
                    get: {
                        tags: ["Stock"],
                        description:
                            "Endpoint para listar stock com status removido true (1).",
                        produces: [],
                        parameters: [
                            {
                                name: "page",
                                in: "query",
                                type: "string",
                            },
                            {
                                name: "perPage",
                                in: "query",
                                type: "string",
                            },
                            {
                                name: "q",
                                in: "query",
                                type: "string",
                            },
                        ],
                        responses: {
                            200: {
                                schema: {
                                    $ref: "#/definitions/Stock",
                                },
                                description:
                                    "Listando Stock em função do estado.",
                            },
                        },
                    },
                },
                "/preco-venda/{preco_id}": {
                    delete: {
                        tags: [],
                        description: "",
                        parameters: [
                            {
                                name: "preco_id",
                                in: "path",
                                required: true,
                                type: "string",
                            },
                        ],
                        responses: {},
                    },
                },
                "/taxas": {
                    post: {
                        tags: ["Taxa"],
                        description: "Endpoint para cadastrar Taxa.",
                        parameters: [],
                        responses: {
                            200: {
                                schema: {
                                    $ref: "#/definitions/Taxa",
                                },
                                description: "Registado com sucesso.",
                            },
                        },
                    },
                    get: {
                        tags: ["Taxa"],
                        description: "Endpoint para listar Taxa.",
                        parameters: [],
                        responses: {
                            200: {
                                schema: {
                                    $ref: "#/definitions/Taxa",
                                },
                                description: "Listando Taxas.",
                            },
                        },
                    },
                },
                "/taxas/{id}": {
                    get: {
                        tags: ["Taxa"],
                        description:
                            "Endpoint para listar Taxa em função do Id.",
                        parameters: [
                            {
                                name: "id",
                                in: "path",
                                required: true,
                                type: "string",
                            },
                        ],
                        responses: {
                            200: {
                                schema: {
                                    $ref: "#/definitions/Taxa",
                                },
                                description: "Listando Taxa em função do Id.",
                            },
                            404: {
                                schema: {
                                    $ref: "#/definitions/IdNo",
                                },
                                description:
                                    "Taxa com o ID ${id} não encontrado..",
                            },
                        },
                    },
                    delete: {
                        tags: ["Taxa"],
                        description: "Endpoint para remover Taxa.",
                        parameters: [
                            {
                                name: "id",
                                in: "path",
                                required: true,
                                type: "string",
                            },
                        ],
                        responses: {
                            200: {
                                schema: {
                                    $ref: "#/definitions/idDelete",
                                },
                                description: "Taxa removida com sucesso.",
                            },
                            404: {
                                schema: {
                                    $ref: "#/definitions/IdNo",
                                },
                                description:
                                    "Taxa com ID ${id} não encontrada.",
                            },
                        },
                    },
                    put: {
                        tags: ["Taxa"],
                        description: "Endpoint para actualizar Taxa.",
                        parameters: [
                            {
                                name: "id",
                                in: "path",
                                required: true,
                                type: "string",
                            },
                        ],
                        responses: {
                            200: {
                                schema: {
                                    $ref: "#/definitions/idUpdate",
                                },
                                description: "Taxa Actualizada com sucesso.",
                            },
                            404: {
                                schema: {
                                    $ref: "#/definitions/IdNo",
                                },
                                description:
                                    "Taxa com ID ${id} não encontrada.",
                            },
                        },
                    },
                },
                "/tipo-doc": {
                    post: {
                        tags: ["Tipo de Documento"],
                        description: "Endpoint para criar Tipo de documento",
                        parameters: [],
                        responses: {
                            200: {
                                schema: {
                                    $ref: "#/definitions/Tipo_Doc",
                                },
                                description: "Dados adicionados com sucesso.",
                            },
                            409: {
                                schema: {
                                    $ref: "#/definitions/TipoDocYes",
                                },
                                description: "Tipo de documento já registado.",
                            },
                        },
                    },
                    get: {
                        tags: ["Tipo de Documento"],
                        description:
                            "Endpoint para listar todos os Tipos de documento",
                        parameters: [],
                        responses: {
                            200: {
                                schema: {
                                    $ref: "#/definitions/Tipo_Doc",
                                },
                                description: "Listando Tipo de documento.",
                            },
                        },
                    },
                },
                "/tipo-doc/{id}": {
                    put: {
                        tags: ["Tipo de Documento"],
                        description: "Endpoint para criar Tipo de documento",
                        parameters: [
                            {
                                name: "id",
                                in: "path",
                                required: true,
                                type: "string",
                            },
                        ],
                        responses: {
                            200: {
                                schema: {
                                    $ref: "#/definitions/Tipo_Doc",
                                },
                                description: "Dados adicionados com sucesso.",
                            },
                        },
                    },
                    delete: {
                        tags: ["Tipo de Documento"],
                        description: "Endpoint para remover Tipo de documento",
                        parameters: [
                            {
                                name: "id",
                                in: "path",
                                required: true,
                                type: "string",
                            },
                        ],
                        responses: {
                            200: {
                                schema: {
                                    $ref: "#/definitions/idDelete",
                                },
                                description:
                                    "Tipo de documento removido com sucesso.",
                            },
                        },
                    },
                    get: {
                        tags: ["Tipo de Documento"],
                        description:
                            "Endpoint para listar Tipos de documento em função do Id",
                        parameters: [
                            {
                                name: "id",
                                in: "path",
                                required: true,
                                type: "string",
                            },
                        ],
                        responses: {
                            404: {
                                schema: {
                                    $ref: "#/definitions/Tipo_Doc",
                                },
                                description:
                                    "Listando Tipo de Documento por Id.",
                            },
                        },
                    },
                },
                "/tipoDoc/{categoria}": {
                    get: {
                        tags: ["Tipo de Documento"],
                        description:
                            "Endpoint para listar Tipos de documento em função do Id",
                        parameters: [
                            {
                                name: "categoria",
                                in: "path",
                                required: true,
                                type: "string",
                            },
                        ],
                        responses: {
                            404: {
                                schema: {
                                    $ref: "#/definitions/Tipo_Doc",
                                },
                                description:
                                    "Listando Tipo de Documento por Id.",
                            },
                        },
                    },
                },
                "/permissoes-usuario/{id}": {
                    get: {
                        tags: ["Permissão de Usuário"],
                        description:
                            "Endpoint listar permissao ao Usuario em função do Id",
                        parameters: [
                            {
                                name: "id",
                                in: "path",
                                required: true,
                                type: "string",
                            },
                        ],
                        responses: {},
                    },
                },
                "/permissoes-usuario": {
                    post: {
                        tags: ["Permissão de Usuário"],
                        description:
                            "Endpoint para atribuir permissao ao Usuario",
                        parameters: [
                            {
                                name: "obj",
                                in: "body",
                                schema: {
                                    type: "object",
                                    properties: {
                                        permissaoId: {
                                            example: "any",
                                        },
                                        usuarioId: {
                                            example: "any",
                                        },
                                    },
                                },
                            },
                        ],
                        responses: {
                            200: {
                                schema: {
                                    $ref: "#/definitions/registerSuccess",
                                },
                                description:
                                    "Permissão adicionada com sucesso.",
                            },
                            400: {
                                description:
                                    "Um usuário com o Id ${usuarioId} Já possui esta permissão .",
                                schema: {
                                    $ref: "#/definitions/permissaoYes",
                                },
                            },
                            404: {
                                description:
                                    "Não existe Nenhum usuário com o Id ${usuarioId}.",
                                schema: {
                                    $ref: "#/definitions/IdNo",
                                },
                            },
                        },
                    },
                },
                "/permissoes-usuario/lista": {
                    post: {
                        tags: ["Permissão de Usuário"],
                        description:
                            "Endpoint para atribuir permissões ao Usuario",
                        parameters: [
                            {
                                name: "obj",
                                in: "body",
                                schema: {
                                    type: "object",
                                    properties: {
                                        permissions: {
                                            example: "any",
                                        },
                                        userId: {
                                            example: "any",
                                        },
                                    },
                                },
                            },
                        ],
                        responses: {
                            200: {
                                schema: {
                                    $ref: "#/definitions/registerSuccess",
                                },
                                description:
                                    "Permissões adicionadas com sucesso.",
                            },
                            404: {
                                schema: {
                                    $ref: "#/definitions/IdNo",
                                },
                                description: "Usuário não encontrado.",
                            },
                        },
                    },
                },
                "/deletePermissoes/{idU}/{idP}": {
                    post: {
                        tags: ["Permissão de Usuário"],
                        description:
                            "Endpoint para remover permissao de Usuario",
                        parameters: [
                            {
                                name: "idU",
                                in: "path",
                                required: true,
                                type: "string",
                            },
                            {
                                name: "idP",
                                in: "path",
                                required: true,
                                type: "string",
                            },
                        ],
                        responses: {
                            200: {
                                description: "Permissao removida com sucesso.",
                                schema: {
                                    $ref: "#/definitions/idDelete",
                                },
                            },
                            400: {
                                description:
                                    "Nenhum registro de Permissões encontrado.",
                                schema: {
                                    $ref: "#/definitions/permissaoNo",
                                },
                            },
                            404: {
                                schema: {
                                    $ref: "#/definitions/IdNo",
                                },
                                description:
                                    "Não existe uma permissão com o Id ${Id}.",
                            },
                        },
                    },
                },
                "/cambio": {
                    get: {
                        tags: ["Cambio"],
                        description: "Endpoint para Listar Câmbio.",
                        parameters: [],
                        responses: {},
                    },
                    post: {
                        tags: ["Cambio"],
                        description: "Endpoint para cadastrar Cambio.",
                        parameters: [],
                        responses: {
                            200: {
                                schema: {
                                    $ref: "#/definitions/registerSuccess",
                                },
                                description: "Câmbio registado com sucesso.",
                            },
                            400: {
                                schema: {
                                    $ref: "#/definitions/MoedaNo",
                                },
                                description:
                                    "A moeda Padrão não pode ser igual a moeda de conversão.",
                            },
                        },
                    },
                },
                "/cambio/{id}": {
                    get: {
                        tags: ["Cambio"],
                        description:
                            "Endpoint para Listar Câmbio em função do Id.",
                        parameters: [
                            {
                                name: "id",
                                in: "path",
                                required: true,
                                type: "string",
                            },
                        ],
                        responses: {
                            200: {
                                schema: {
                                    $ref: "#/definitions/Cambio",
                                },
                                description: "Listando Câmbio por Id.",
                            },
                        },
                    },
                    put: {
                        tags: [],
                        description: "",
                        parameters: [
                            {
                                name: "id",
                                in: "path",
                                required: true,
                                type: "string",
                            },
                        ],
                        responses: {
                            200: {
                                schema: {
                                    $ref: "#/definitions/idUpdate",
                                },
                                description: "Dados atualizados com sucesso.",
                            },
                            400: {
                                schema: {
                                    $ref: "#/definitions/InvalidValue",
                                },
                                description: "Valor introduzido inválido.",
                            },
                        },
                    },
                    delete: {
                        tags: ["Cambio"],
                        description: "Endpoint para Remover Câmbio.",
                        parameters: [
                            {
                                name: "id",
                                in: "path",
                                required: true,
                                type: "string",
                            },
                        ],
                        responses: {
                            200: {
                                schema: {
                                    $ref: "#/definitions/idDelete",
                                },
                                description: "Dados removidos com sucesso.",
                            },
                            404: {
                                schema: {
                                    $ref: "#/definitions/idUpdate",
                                },
                                description:
                                    "Câmbio com o ID ${id} não encontrado.",
                            },
                        },
                    },
                },
                "/lingua": {
                    get: {
                        tags: ["Traducao"],
                        description: "Endpoint para listar Taxa.",
                        parameters: [],
                        responses: {
                            200: {
                                schema: {
                                    $ref: "#/definitions/Taxa",
                                },
                                description: "Listando Taxas.",
                            },
                        },
                    },
                    post: {
                        tags: ["Traducao"],
                        description: "Endpoint para cadastrar Taxa.",
                        parameters: [],
                        responses: {},
                    },
                },
                "/lingua/{id}": {
                    get: {
                        tags: ["Taxa"],
                        description:
                            "Endpoint para listar Taxa em função do Id.",
                        parameters: [
                            {
                                name: "id",
                                in: "path",
                                required: true,
                                type: "string",
                            },
                        ],
                        responses: {
                            200: {
                                schema: {
                                    $ref: "#/definitions/Taxa",
                                },
                                description: "Listando Taxa em função do Id.",
                            },
                            404: {
                                schema: {
                                    $ref: "#/definitions/IdNo",
                                },
                                description:
                                    "Taxa com o ID ${id} não encontrado..",
                            },
                        },
                    },
                    put: {
                        tags: ["Traducao"],
                        description: "Endpoint para actualizar Tradução.",
                        parameters: [
                            {
                                name: "id",
                                in: "path",
                                required: true,
                                type: "string",
                            },
                        ],
                        responses: {
                            200: {
                                schema: {
                                    $ref: "#/definitions/idUpdate",
                                },
                                description: "Taxa Actualizada com sucesso.",
                            },
                            404: {
                                schema: {
                                    $ref: "#/definitions/IdNo",
                                },
                                description:
                                    "Taxa com ID ${id} não encontrada.",
                            },
                        },
                    },
                    delete: {
                        tags: ["Traducao"],
                        description: "Endpoint para ____FUNC____ Taxa.",
                        parameters: [
                            {
                                name: "id",
                                in: "path",
                                required: true,
                                type: "string",
                            },
                        ],
                        responses: {
                            200: {
                                schema: {
                                    $ref: "#/definitions/idDelete",
                                },
                                description: "Tradução removida com sucesso.",
                            },
                            404: {
                                schema: {
                                    $ref: "#/definitions/IdNo",
                                },
                                description:
                                    "Tradução com ID ${id} não encontrada.",
                            },
                        },
                    },
                },
                "/traducao": {
                    get: {
                        tags: ["Traducao"],
                        description: "Endpoint para listar Tradução.",
                        parameters: [],
                        responses: {
                            200: {
                                schema: {
                                    $ref: "#/definitions/Traducao",
                                },
                                description: "Listando Traducao.",
                            },
                        },
                    },
                    post: {
                        tags: ["Traducao"],
                        description: "Endpoint para cadastrar Taxa.",
                        parameters: [],
                        responses: {
                            200: {
                                schema: {
                                    $ref: "#/definitions/Traducao",
                                },
                                description: "Registado com sucesso.",
                            },
                            404: {
                                schema: {
                                    $ref: "#/definitions/TchaveNo",
                                },
                                description: "Tradução Chave não encontrada.",
                            },
                        },
                    },
                },
                "/traducao/{id}": {
                    get: {
                        tags: ["Traducao"],
                        description:
                            "Endpoint para listar Tradução em função do Id.",
                        parameters: [
                            {
                                name: "id",
                                in: "path",
                                required: true,
                                type: "string",
                            },
                        ],
                        responses: {
                            200: {
                                schema: {
                                    $ref: "#/definitions/Traducao",
                                },
                                description:
                                    "Traducao com o ID ${id} não encontrado.",
                            },
                            404: {
                                schema: {
                                    $ref: "#/definitions/IdNo",
                                },
                                description:
                                    "Traducao com o ID ${id} não encontrado.",
                            },
                        },
                    },
                    put: {
                        tags: ["Traducao"],
                        description: "Endpoint para actualizar Tradução.",
                        parameters: [
                            {
                                name: "id",
                                in: "path",
                                required: true,
                                type: "string",
                            },
                        ],
                        responses: {
                            200: {
                                schema: {
                                    $ref: "#/definitions/idUpdate",
                                },
                                description:
                                    "Tradução Actualizada com sucesso.",
                            },
                            404: {
                                schema: {
                                    $ref: "#/definitions/IdNo",
                                },
                                description:
                                    "Tradução com ID ${id} não encontrado.",
                            },
                        },
                    },
                    delete: {
                        tags: ["Traducao"],
                        description: "Endpoint para ____FUNC____ Taxa.",
                        parameters: [
                            {
                                name: "id",
                                in: "path",
                                required: true,
                                type: "string",
                            },
                        ],
                        responses: {
                            200: {
                                schema: {
                                    $ref: "#/definitions/idDelete",
                                },
                                description: "Tradução removida com sucesso.",
                            },
                            404: {
                                schema: {
                                    $ref: "#/definitions/IdNo",
                                },
                                description:
                                    "Tradução com ID ${id} não encontrada.",
                            },
                        },
                    },
                },
                "/traducao_chave": {
                    get: {
                        tags: ["Traducao"],
                        description: "Endpoint para listar Taxa.",
                        parameters: [],
                        responses: {
                            200: {
                                schema: {
                                    $ref: "#/definitions/Taxa",
                                },
                                description: "Listando Taxas.",
                            },
                        },
                    },
                    post: {
                        tags: ["Traducao"],
                        description: "Endpoint para cadastrar Taxa.",
                        parameters: [],
                        responses: {},
                    },
                },
                "/traducao_chave/{id}": {
                    get: {
                        tags: ["Taxa"],
                        description:
                            "Endpoint para listar Taxa em função do Id.",
                        parameters: [
                            {
                                name: "id",
                                in: "path",
                                required: true,
                                type: "string",
                            },
                        ],
                        responses: {
                            200: {
                                schema: {
                                    $ref: "#/definitions/Taxa",
                                },
                                description: "Listando Taxa em função do Id.",
                            },
                            404: {
                                schema: {
                                    $ref: "#/definitions/IdNo",
                                },
                                description:
                                    "Taxa com o ID ${id} não encontrado..",
                            },
                        },
                    },
                    put: {
                        tags: ["Traducao"],
                        description: "Endpoint para actualizar Tradução.",
                        parameters: [
                            {
                                name: "id",
                                in: "path",
                                required: true,
                                type: "string",
                            },
                        ],
                        responses: {
                            200: {
                                schema: {
                                    $ref: "#/definitions/idUpdate",
                                },
                                description: "Taxa Actualizada com sucesso.",
                            },
                            404: {
                                schema: {
                                    $ref: "#/definitions/IdNo",
                                },
                                description:
                                    "Taxa com ID ${id} não encontrada.",
                            },
                        },
                    },
                    delete: {
                        tags: ["Traducao"],
                        description: "Endpoint para ____FUNC____ Taxa.",
                        parameters: [
                            {
                                name: "id",
                                in: "path",
                                required: true,
                                type: "string",
                            },
                        ],
                        responses: {
                            200: {
                                schema: {
                                    $ref: "#/definitions/idDelete",
                                },
                                description: "Tradução removida com sucesso.",
                            },
                            404: {
                                schema: {
                                    $ref: "#/definitions/IdNo",
                                },
                                description:
                                    "Tradução com ID ${id} não encontrada.",
                            },
                        },
                    },
                },
            },
            definitions: {
                loginUser: {
                    type: "object",
                    properties: {
                        email: {
                            type: "string",
                            example: "clesiaroberto@yahoo.com",
                        },
                        password: {
                            type: "string",
                            example: "12345678",
                        },
                    },
                },
                loginUserErr: {
                    type: "object",
                    properties: {
                        message: {
                            type: "string",
                            example: "E-mail ou password incorrecto",
                        },
                    },
                },
                UserErr: {
                    type: "object",
                    properties: {
                        message: {
                            type: "string",
                            example:
                                "A sua conta está desativada. Contacte o suporte técnico",
                        },
                    },
                },
                UserEmpty: {
                    type: "object",
                    properties: {
                        message: {
                            type: "string",
                            example: "E-mail e Password são obrigatórios",
                        },
                    },
                },
                TokenSuccess: {
                    type: "object",
                    properties: {
                        message: {
                            type: "string",
                            example: "Usuário autenticado",
                        },
                    },
                },
                Token: {
                    type: "object",
                    properties: {
                        message: {
                            type: "string",
                            example: "Refresh token expirado",
                        },
                    },
                },
                userToken: {
                    type: "object",
                    properties: {
                        menssagem: {
                            type: "string",
                            example: "Refresh Token não Encontrado",
                        },
                    },
                },
                NotFoundCategory: {
                    type: "object",
                    properties: {
                        message: {
                            type: "string",
                            example:
                                "Registo com categoria ${categoria} não foi encontrado",
                        },
                    },
                },
                LogOut: {
                    type: "object",
                    properties: {
                        message: {
                            type: "string",
                            example: "Sessão Terminada!",
                        },
                    },
                },
                UnAuthorized: {
                    type: "object",
                    properties: {
                        message: {
                            type: "string",
                            example: "Não autorizado!",
                        },
                    },
                },
                IdNo: {
                    type: "object",
                    properties: {
                        message: {
                            type: "string",
                            example: "Registo Não Encontrado!",
                        },
                    },
                },
                NameNo: {
                    type: "object",
                    properties: {
                        message: {
                            type: "string",
                            example: "Nome Não Encontrado!",
                        },
                    },
                },
                idUpdate: {
                    type: "object",
                    properties: {
                        message: {
                            type: "string",
                            example: "Actualizado com Sucesso!",
                        },
                    },
                },
                idDelete: {
                    type: "object",
                    properties: {
                        message: {
                            type: "string",
                            example: "Removido com Sucesso!",
                        },
                    },
                },
                empresaNo: {
                    type: "object",
                    properties: {
                        message: {
                            type: "string",
                            example: "Empresa informada não existe!",
                        },
                    },
                },
                registerSuccess: {
                    type: "object",
                    properties: {
                        message: {
                            type: "string",
                            example: "Registado com Sucesso!",
                        },
                    },
                },
                StatusNo: {
                    type: "object",
                    properties: {
                        message: {
                            type: "string",
                            example:
                                "Não podes alterar o estado da tua própria conta",
                        },
                    },
                },
                statusInvalid: {
                    type: "object",
                    properties: {
                        message: {
                            type: "string",
                            example: "O estado informado não é válido.",
                        },
                    },
                },
                statusUpdate: {
                    type: "object",
                    properties: {
                        message: {
                            type: "string",
                            example: "Status actualizado com sucesso!",
                        },
                    },
                },
                emailNo: {
                    type: "object",
                    properties: {
                        message: {
                            type: "string",
                            example: "E-mail informado Já existe!",
                        },
                    },
                },
                nameYes: {
                    type: "object",
                    properties: {
                        message: {
                            type: "string",
                            example: "Nome informado Já existe!",
                        },
                    },
                },
                CategoryNo: {
                    type: "object",
                    properties: {
                        message: {
                            type: "string",
                            example: "Categoria informada Já existe!",
                        },
                    },
                },
                permissaoYes: {
                    type: "object",
                    properties: {
                        message: {
                            type: "string",
                            example: "O usuário já possui esta permissão!",
                        },
                    },
                },
                permissaoNo: {
                    type: "object",
                    properties: {
                        message: {
                            type: "string",
                            example: "Nenhum registo encontrado!",
                        },
                    },
                },
                Categoryes: {
                    type: "object",
                    properties: {
                        message: {
                            type: "string",
                            example: "Categoria informada não está cadastrada!",
                        },
                    },
                },
                StockYes: {
                    type: "object",
                    properties: {
                        message: {
                            type: "string",
                            example: "Stock informado Já existe!",
                        },
                    },
                },
                TipoDocYes: {
                    type: "object",
                    properties: {
                        message: {
                            type: "string",
                            example: "Tipo de documento informado Já existe!",
                        },
                    },
                },
                GrupoNo: {
                    type: "object",
                    properties: {
                        message: {
                            type: "string",
                            example: "Grupo informado não existe!",
                        },
                    },
                },
                SenhaActual: {
                    type: "object",
                    properties: {
                        message: {
                            type: "string",
                            example: "A senha não está correta",
                        },
                    },
                },
                SenhaOk: {
                    type: "object",
                    properties: {
                        message: {
                            type: "string",
                            example: "Senha Confirmada",
                        },
                    },
                },
                NovaSenha: {
                    type: "object",
                    properties: {
                        message: {
                            type: "string",
                            example:
                                "A nova senha não pode ser igual a senha atual.",
                        },
                    },
                },
                IdAdmin: {
                    type: "object",
                    properties: {
                        message: {
                            type: "string",
                            example:
                                "Não podes alterar senha de um administrador",
                        },
                    },
                },
                SenhaUpdate: {
                    type: "object",
                    properties: {
                        message: {
                            type: "string",
                            example: "Senha alterada com Sucesso.",
                        },
                    },
                },
                InvalidValue: {
                    type: "object",
                    properties: {
                        message: {
                            type: "string",
                            example: "Valor introduzido Inválido.",
                        },
                    },
                },
                MoedaNo: {
                    type: "object",
                    properties: {
                        message: {
                            type: "string",
                            example:
                                " A moeda Padrão não pode ser igual a moeda de conversão.",
                        },
                    },
                },
                SenhaNo: {
                    type: "object",
                    properties: {
                        message: {
                            type: "string",
                            example: "Senha não informada.",
                        },
                    },
                },
                UserTokenSUccess: {
                    type: "object",
                    properties: {
                        UserId: {
                            type: "number",
                            example: 18,
                        },
                        nome: {
                            type: "string",
                            example: "clesia",
                        },
                        apelido: {
                            type: "string",
                            example: "Roberto",
                        },
                        imagem: {
                            type: "string",
                            example: "img.png",
                        },
                        empresaId: {
                            type: "number",
                            example: 1,
                        },
                        empresaNome: {
                            type: "string",
                            example: "Nc Software",
                        },
                        isAdmin: {
                            type: "boolean",
                            example: false,
                        },
                    },
                },
                User: {
                    type: "object",
                    properties: {
                        id: {
                            type: "number",
                            example: 18,
                        },
                        nome: {
                            type: "string",
                            example: "Clésia",
                        },
                        apelido: {
                            type: "string",
                            example: "Roberto",
                        },
                        email: {
                            type: "string",
                            example: "clesiaroberto@yahoo.com",
                        },
                        contacto1: {
                            type: "string",
                            example: "844024855",
                        },
                        contacto2: {
                            type: "string",
                            example: "844024855",
                        },
                        imagem: {
                            type: "string",
                            example: "default.png",
                        },
                        estado: {
                            type: "number",
                            example: 1,
                        },
                        empresa: {
                            type: "number",
                            example: 1,
                        },
                    },
                },
                Categoria_Estoque: {
                    type: "object",
                    properties: {
                        nome: {
                            type: "string",
                            example: "Stock1",
                        },
                        descricao: {
                            type: "string",
                            example: "Primeira Categoria",
                        },
                        empresa: {
                            type: "number",
                            example: 1,
                        },
                        usuario_added: {
                            type: "number",
                            example: 1,
                        },
                        usuario_updated: {
                            type: "number",
                            example: 1,
                        },
                    },
                },
                Cliente: {
                    type: "object",
                    properties: {
                        nome: {
                            type: "string",
                            example: "Marta",
                        },
                        email: {
                            type: "string",
                            example: "marta@yahoo.com",
                        },
                        contacto1: {
                            type: "string",
                            example: "123456789",
                        },
                        contacto2: {
                            type: "string",
                            example: "123456789",
                        },
                        nuit: {
                            type: "string",
                            example: "123456789",
                        },
                        endereco: {
                            type: "string",
                            example: "Matola",
                        },
                        endereco2: {
                            type: "string",
                            example: "Maputo",
                        },
                        empresa: {
                            type: "number",
                            example: 1,
                        },
                        usuario_added: {
                            type: "number",
                            example: 1,
                        },
                        usuario_updated: {
                            type: "number",
                            example: 1,
                        },
                    },
                },
                Empresa: {
                    type: "object",
                    properties: {
                        nome: {
                            type: "string",
                            example: "Nzila",
                        },
                        slogan: {
                            type: "string",
                            example: "NZ",
                        },
                        nuit: {
                            type: "string",
                            example: "123456789",
                        },
                        email: {
                            type: "string",
                            example: "nzila@yahoo.com",
                        },
                        contacto1: {
                            type: "string",
                            example: "123456789",
                        },
                        contacto2: {
                            type: "string",
                            example: "821458963",
                        },
                        endereco1: {
                            type: "string",
                            example: "Maputo",
                        },
                        endereco2: {
                            type: "string",
                            example: "Matola",
                        },
                        usuario_added: {
                            type: "number",
                            example: 1,
                        },
                        usuario_updated: {
                            type: "number",
                            example: 1,
                        },
                    },
                },
                Entidade: {
                    type: "object",
                    properties: {
                        nome: {
                            type: "string",
                            example: "Nzila",
                        },
                        email: {
                            type: "string",
                            example: "nzila@yahoo.com",
                        },
                        contacto1: {
                            type: "string",
                            example: "123456789",
                        },
                        contacto2: {
                            type: "string",
                            example: "821458963",
                        },
                        endereco1: {
                            type: "string",
                            example: "Maputo",
                        },
                        endereco2: {
                            type: "string",
                            example: "Matola",
                        },
                        empresa: {
                            type: "number",
                            example: 1,
                        },
                        nuit: {
                            type: "string",
                            example: "123456789",
                        },
                        usuario_added: {
                            type: "number",
                            example: 1,
                        },
                        usuario_updated: {
                            type: "number",
                            example: 1,
                        },
                    },
                },
                Fornecedor: {
                    type: "object",
                    properties: {
                        nome: {
                            type: "string",
                            example: "Nzila",
                        },
                        email: {
                            type: "string",
                            example: "nzila@yahoo.com",
                        },
                        contacto1: {
                            type: "string",
                            example: "123456789",
                        },
                        contacto2: {
                            type: "string",
                            example: "821458963",
                        },
                        endereco1: {
                            type: "string",
                            example: "Maputo",
                        },
                        endereco2: {
                            type: "string",
                            example: "Matola",
                        },
                        empresa: {
                            type: "number",
                            example: 1,
                        },
                        nuit: {
                            type: "string",
                            example: "123456789",
                        },
                        usuario_added: {
                            type: "number",
                            example: 1,
                        },
                        usuario_updated: {
                            type: "number",
                            example: 1,
                        },
                    },
                },
                NaoCadastrado: {
                    type: "object",
                    properties: {
                        message: {
                            type: "string",
                            example: "Não cadastrado",
                        },
                    },
                },
                Permissao: {
                    type: "object",
                    properties: {
                        nome: {
                            type: "string",
                            example: "Caixas",
                        },
                        grupo: {
                            type: "number",
                            example: 2,
                        },
                        usuario_added: {
                            type: "number",
                            example: 1,
                        },
                        usuario_updated: {
                            type: "number",
                            example: 1,
                        },
                    },
                },
                Permissao_Grupo: {
                    type: "object",
                    properties: {
                        nome: {
                            type: "string",
                            example: "Admin",
                        },
                        usuario_added: {
                            type: "number",
                            example: 1,
                        },
                        usuario_updated: {
                            type: "number",
                            example: 1,
                        },
                    },
                },
                Stock: {
                    type: "object",
                    properties: {
                        nome: {
                            type: "string",
                            example: "Stock",
                        },
                        referencia: {
                            type: "string",
                            example: "stf1",
                        },
                        categoria: {
                            type: "number",
                            example: 6,
                        },
                        tipo: {
                            type: "number",
                            example: 1,
                        },
                        descricao: {
                            type: "string",
                            example: "stock",
                        },
                        empresa: {
                            type: "number",
                            example: 1,
                        },
                        usuario_added: {
                            type: "number",
                            example: 1,
                        },
                        usuario_updated: {
                            type: "number",
                            example: 1,
                        },
                    },
                },
                Taxa: {
                    type: "object",
                    properties: {
                        nome: {
                            type: "string",
                            example: "Taxa",
                        },
                        valor: {
                            type: "string",
                            example: "100",
                        },
                        percentual: {
                            type: "boolean",
                            example: true,
                        },
                        empresa: {
                            type: "number",
                            example: 1,
                        },
                        usuario_added: {
                            type: "number",
                            example: 1,
                        },
                        usuario_updated: {
                            type: "number",
                            example: 1,
                        },
                    },
                },
                Tipo_Doc: {
                    type: "object",
                    properties: {
                        nome: {
                            type: "string",
                            example: "Fatura",
                        },
                        prefixo: {
                            type: "string",
                            example: "FT",
                        },
                        categoria: {
                            type: "number",
                            example: 1,
                        },
                        descricao: {
                            type: "string",
                            example: "documentos",
                        },
                        empresa: {
                            type: "number",
                            example: 1,
                        },
                        move_estoque: {
                            type: "number",
                            example: 1,
                        },
                        move_conta_corrente: {
                            type: "number",
                            example: 1,
                        },
                        move_a_credito: {
                            type: "number",
                            example: 1,
                        },
                        requer_recibo: {
                            type: "number",
                            example: 1,
                        },
                        usuario_added: {
                            type: "number",
                            example: 1,
                        },
                        usuario_updated: {
                            type: "number",
                            example: 1,
                        },
                        removido: {
                            type: "number",
                            example: 1,
                        },
                    },
                },
                Cambio: {
                    type: "object",
                    properties: {
                        moeda_padrao: {
                            type: "string",
                            example: "Metical",
                        },
                        moeda_conversao: {
                            type: "string",
                            example: "Dollar",
                        },
                        preco_compra: {
                            type: "string",
                            example: "100",
                        },
                        preco_venda: {
                            type: "string",
                            example: "150",
                        },
                        usuario_added: {
                            type: "number",
                            example: 1,
                        },
                        usuario_updated: {
                            type: "number",
                            example: 1,
                        },
                    },
                },
            },
            loginUserErr: {
                message: "E-mail ou password incorrecto",
            },
            UserErr: {
                message:
                    "A sua conta está desativada. Contacte o suporte técnico",
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
                message:
                    "Registo com categoria ${categoria} não foi encontrado",
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
                message:
                    " A moeda Padrão não pode ser igual a moeda de conversão.",
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
            default: {
                swagger: "2.0",
                info: {
                    title: "Documentação Erp",
                    description: "Documentação",
                    version: "1.0.0",
                },
                host: "http://localhost:3000",
                basePath: "/",
                tags: [],
                schemes: ["http", "https"],
                consumes: ["application/json"],
                produces: ["application/json"],
                paths: {
                    "/auth": {
                        post: {
                            tags: ["Auth"],
                            description: "Endpoint para autenticação.",
                            parameters: [
                                {
                                    name: "UserLogin",
                                    in: "body",
                                    description: "Informações do usuário.",
                                    required: true,
                                    type: "object",
                                    schema: {
                                        $ref: "#/definitions/loginUser",
                                    },
                                },
                            ],
                            responses: {
                                200: {
                                    schema: {
                                        $ref: "#/definitions/User",
                                    },
                                    description:
                                        "Usuário Autenticado com Sucesso!.",
                                },
                                400: {
                                    schema: {
                                        $ref: "#/definitions/UserEmpty",
                                    },
                                    description:
                                        "E-mail e Password imcompletos!.",
                                },
                                401: {
                                    schema: {
                                        $ref: "#/definitions/loginUserErr",
                                    },
                                    description:
                                        "E-mail ou password incorrecto!.",
                                },
                                403: {
                                    schema: {
                                        $ref: "#/definitions/UserErr",
                                    },
                                    description: "Conta desativada!.",
                                },
                            },
                        },
                    },
                    "/auth/refresh-token": {
                        post: {
                            tags: ["Auth"],
                            description:
                                "Endpoint para aumentar o tempo da sessão.",
                            parameters: [],
                            responses: {
                                200: {
                                    schema: {
                                        $ref: "#/definitions/UserTokenSuccess",
                                    },
                                    description: "Sucesso!.",
                                },
                                401: {
                                    schema: {
                                        $ref: "#/definitions/UnAuthorized",
                                    },
                                    description: "Não autorizado",
                                },
                            },
                        },
                    },
                    "/auth/verify-token": {
                        post: {
                            tags: ["Auth"],
                            description:
                                "Endpoint para verificar o token da sessão.",
                            parameters: [],
                            responses: {
                                200: {
                                    schema: {
                                        $ref: "#/definitions/TokenSuccess",
                                    },
                                    description: "Usuário autenticado!.",
                                },
                                401: {
                                    schema: {
                                        $ref: "#/definitions/UnAuthorized",
                                    },
                                    description: "Não autorizado",
                                },
                            },
                        },
                    },
                    "/auth/logout": {
                        post: {
                            tags: ["Auth"],
                            description: "Endpoint para terminar sessão.",
                            parameters: [],
                            responses: {
                                204: {
                                    schema: {
                                        $ref: "#/definitions/LogOut",
                                    },
                                    description: "Fazendo Logout!.",
                                },
                            },
                        },
                    },
                    "/usuarios/": {
                        get: {
                            tags: ["Usuário"],
                            description: "Endpoint para Listar Usuário.",
                            parameters: [],
                            responses: {
                                200: {
                                    schema: {
                                        $ref: "#/definitions/User",
                                    },
                                    description: "Listando Usuários.",
                                },
                            },
                        },
                    },
                    "/usuarios/{id}": {
                        get: {
                            tags: ["Usuário"],
                            description: "Endpoint para Listar Usuário por Id.",
                            parameters: [
                                {
                                    name: "id",
                                    in: "path",
                                    required: true,
                                    type: "string",
                                },
                            ],
                            responses: {
                                200: {
                                    schema: {
                                        $ref: "#/definitions/User",
                                    },
                                    description:
                                        "Listando Usuário em função do Id.",
                                },
                                404: {
                                    schema: {
                                        $ref: "#/definitions/IdNo",
                                    },
                                    description:
                                        "Usuário com ID ${id} não encontrado.",
                                },
                            },
                        },
                        put: {
                            tags: ["Usuário"],
                            description: "Endpoint para Actualizar Usuário.",
                            parameters: [
                                {
                                    name: "id",
                                    in: "path",
                                    required: true,
                                    type: "string",
                                },
                            ],
                            responses: {
                                200: {
                                    schema: {
                                        $ref: "#/definitions/idUpdate",
                                    },
                                    description:
                                        "Dados atualizados com sucesso.",
                                },
                                404: {
                                    schema: {
                                        $ref: "#/definitions/IdNo",
                                    },
                                    description: "Usuário não encontrado.",
                                },
                            },
                        },
                    },
                    "/usuarios/estado/{estado}": {
                        get: {
                            tags: ["Usuário"],
                            description:
                                "Endpoint para Listar Usuarios em função do Status .",
                            parameters: [
                                {
                                    name: "estado",
                                    in: "path",
                                    required: true,
                                    type: "string",
                                },
                            ],
                            responses: {
                                200: {
                                    schema: {
                                        $ref: "#/definitions/User",
                                    },
                                    description:
                                        "Listando usuários em função do Status!.",
                                },
                            },
                        },
                    },
                    "/me": {
                        get: {
                            tags: ["Usuário"],
                            description:
                                "Endpoint para verificar os dados do Usuário Autenticado.",
                            parameters: [],
                            responses: {
                                200: {
                                    schema: {
                                        $ref: "#/definitions/Empresa",
                                    },
                                    description: "Listando Perfil do Usuário!.",
                                },
                            },
                        },
                    },
                    "/usuarios": {
                        post: {
                            tags: ["Usuário"],
                            description: "Endpoint para Registar Usuário.",
                            parameters: [
                                {
                                    name: "Usuario",
                                    in: "body",
                                    description: "Informações do Usuário.",
                                    required: true,
                                    type: "object",
                                    schema: {
                                        $ref: "#/definitions/User",
                                    },
                                },
                            ],
                            responses: {
                                200: {
                                    schema: {
                                        $ref: "#/definitions/User",
                                    },
                                    description:
                                        "Usuário registado com sucesso.",
                                },
                                400: {
                                    schema: {
                                        $ref: "#/definitions/emailNo",
                                    },
                                    description:
                                        "Usuário com E-mail ${email} já está cadastrado.",
                                },
                                404: {
                                    schema: {
                                        $ref: "#/definitions/IdNo",
                                    },
                                    description:
                                        "A empresa informada não existe.",
                                },
                            },
                        },
                    },
                    "/usuarios/{id}/atualizar-estado": {
                        post: {
                            tags: ["Usuário"],
                            description: "Endpoint para Actualizar Status.",
                            parameters: [
                                {
                                    name: "id",
                                    in: "path",
                                    required: true,
                                    type: "string",
                                },
                                {
                                    name: "obj",
                                    in: "body",
                                    schema: {
                                        type: "object",
                                        properties: {
                                            estado: {
                                                example: "any",
                                            },
                                        },
                                    },
                                },
                            ],
                            responses: {
                                200: {
                                    schema: {
                                        $ref: "#/definitions/statusUpdate",
                                    },
                                    description:
                                        "Status Actualizado com sucesso!.",
                                },
                                400: {
                                    schema: {
                                        $ref: "#/definitions/idUpdate",
                                    },
                                    description:
                                        "Usuário não pode alterar o estado da própria conta.",
                                },
                                404: {
                                    schema: {
                                        $ref: "#/definitions/IdNo",
                                    },
                                    description:
                                        "Usuário com ID ${id} não encontrado.",
                                },
                            },
                        },
                    },
                    "/me/confirm-password": {
                        post: {
                            tags: ["Usuário"],
                            description:
                                "Endpoint para confirmar password do usuário autenticado.",
                            parameters: [
                                {
                                    name: "obj",
                                    in: "body",
                                    schema: {
                                        type: "object",
                                        properties: {
                                            password: {
                                                example: "any",
                                            },
                                        },
                                    },
                                },
                            ],
                            responses: {
                                200: {
                                    schema: {
                                        $ref: "#/definitions/SenhaOk",
                                    },
                                    description: "Senha confirmada.",
                                },
                                403: {
                                    schema: {
                                        $ref: "#/definitions/SenhaActual",
                                    },
                                    description: "Senha incorreta.",
                                },
                            },
                        },
                    },
                    "/update-password/{id}": {
                        patch: {
                            tags: ["Usuário"],
                            description:
                                "Endpoint para Actualizar Senha do Administrador.",
                            parameters: [
                                {
                                    name: "id",
                                    in: "path",
                                    required: true,
                                    type: "string",
                                },
                                {
                                    name: "obj",
                                    in: "body",
                                    schema: {
                                        type: "object",
                                        properties: {
                                            password: {
                                                example: "any",
                                            },
                                        },
                                    },
                                },
                            ],
                            responses: {
                                200: {
                                    schema: {
                                        $ref: "#/definitions/idUpdate",
                                    },
                                    description: "Senha alterada com Sucesso.",
                                },
                                400: {
                                    schema: {
                                        $ref: "#/definitions/IdAdmin",
                                    },
                                    description:
                                        "Não podes alterar senha de um administrador.",
                                },
                                404: {
                                    schema: {
                                        $ref: "#/definitions/IdNo",
                                    },
                                    description: "Usuário não encontrado.",
                                },
                            },
                        },
                    },
                    "\r/usuarios/password-update": {
                        post: {
                            tags: ["Usuário"],
                            description:
                                "Endpoint para Actualizar Senha do Usuário.",
                            parameters: [
                                {
                                    name: "obj",
                                    in: "body",
                                    schema: {
                                        type: "object",
                                        properties: {
                                            senha_actual: {
                                                example: "any",
                                            },
                                            nova_senha: {
                                                example: "any",
                                            },
                                        },
                                    },
                                },
                            ],
                            responses: {
                                200: {
                                    schema: {
                                        $ref: "#/definitions/SenhaUpdate",
                                    },
                                    description: "Senha alterada com Sucesso.",
                                },
                                400: {
                                    schema: {
                                        $ref: "#/definitions/NovaSenha",
                                    },
                                    description:
                                        "A nova senha não pode ser igual a senha atual.",
                                },
                            },
                        },
                    },
                    "/categorias-stock": {
                        get: {
                            tags: ["Categoria de stock"],
                            description:
                                "Endpoint para listar todas as categorias de stock.",
                            parameters: [],
                            responses: {
                                200: {
                                    schema: {
                                        $ref: "#/definitions/Categoria_stock",
                                    },
                                    description: "OK",
                                },
                            },
                        },
                        post: {
                            tags: ["Categoria de stock"],
                            description:
                                "Endpoint para criar categoria de stock.",
                            parameters: [
                                {
                                    name: "Categoria_stock",
                                    in: "body",
                                    description:
                                        "Informações da categoria de stock.",
                                    required: true,
                                    type: "object",
                                    schema: {
                                        $ref: "#/definitions/Categoria_stock",
                                    },
                                },
                            ],
                            responses: {
                                200: {
                                    schema: {
                                        $ref: "#/definitions/registerSuccess",
                                    },
                                    description:
                                        "Dados adicionados com sucesso",
                                },
                                409: {
                                    schema: {
                                        $ref: "#/definitions/CategoryNo",
                                    },
                                    description:
                                        "Categoria ${data.nome} já está registada",
                                },
                            },
                        },
                    },
                    "/categorias-stock/{id}": {
                        get: {
                            tags: ["Categoria de stock"],
                            description:
                                "Endpoint para listar categoria de stock em função do Id.",
                            parameters: [
                                {
                                    name: "id",
                                    in: "path",
                                    required: true,
                                    type: "string",
                                },
                            ],
                            responses: {
                                200: {
                                    schema: {
                                        $ref: "#/definitions/Categoria_stock",
                                    },
                                    description:
                                        "Categoria com ID ${id} não encontrada",
                                },
                                404: {
                                    schema: {
                                        $ref: "#/definitions/IdNo",
                                    },
                                    description:
                                        "Categoria com ID ${id} não encontrado.",
                                },
                            },
                        },
                        put: {
                            tags: ["Categoria de stock"],
                            description:
                                "Endpoint para actualizar categoria de stock.",
                            parameters: [
                                {
                                    name: "id",
                                    in: "path",
                                    required: true,
                                    type: "string",
                                },
                                {
                                    name: "Categoria_stock",
                                    in: "body",
                                    description:
                                        "Informações da categoria de stock.",
                                    required: true,
                                    type: "object",
                                    schema: {
                                        $ref: "#/definitions/Categoria_stock",
                                    },
                                },
                            ],
                            responses: {
                                200: {
                                    schema: {
                                        $ref: "#/definitions/idUpdate",
                                    },
                                    description:
                                        "Dados atualizados com sucesso.",
                                },
                                404: {
                                    schema: {
                                        $ref: "#/definitions/IdNo",
                                    },
                                    description:
                                        "Categoria de stock não encontrada.",
                                },
                            },
                        },
                        delete: {
                            tags: ["Categoria de stock"],
                            description:
                                "Endpoint para criar categoria de stock.",
                            parameters: [
                                {
                                    name: "id",
                                    in: "path",
                                    required: true,
                                    type: "string",
                                },
                            ],
                            responses: {
                                200: {
                                    schema: {
                                        $ref: "#/definitions/idDelete",
                                    },
                                    description:
                                        "Categoria removida com sucesso",
                                },
                                404: {
                                    schema: {
                                        $ref: "#/definitions/IdNo",
                                    },
                                    description: "Categoria não encontrada.",
                                },
                            },
                        },
                    },
                    "/clientes": {
                        post: {
                            tags: ["Cliente"],
                            description: "Cadastro de clientes.",
                            parameters: [
                                {
                                    name: "Cliente",
                                    in: "body",
                                    description: "Informações do cliente.",
                                    required: true,
                                    type: "object",
                                    schema: {
                                        $ref: "#/definitions/Cliente",
                                    },
                                },
                            ],
                            responses: {
                                200: {
                                    schema: {
                                        $ref: "#/definitions/registerSuccess",
                                    },
                                    description:
                                        "Dados adicionados com sucesso",
                                },
                                409: {
                                    schema: {
                                        $ref: "#/definitions/emailNo",
                                    },
                                    description:
                                        "O cliente com email ${email} já está registado",
                                },
                            },
                        },
                        get: {
                            tags: ["Cliente"],
                            description: "Endpoint para listar Clientes.",
                            produces: [],
                            parameters: [
                                {
                                    name: "page",
                                    in: "query",
                                    type: "string",
                                },
                                {
                                    name: "perPage",
                                    in: "query",
                                    type: "string",
                                },
                                {
                                    name: "q",
                                    in: "query",
                                    type: "string",
                                },
                            ],
                            responses: {
                                200: {
                                    schema: {
                                        $ref: "#/definitions/Cliente",
                                    },
                                    description: "Listando Clientes",
                                },
                            },
                        },
                    },
                    "/clientes/{id}": {
                        put: {
                            tags: ["Cliente"],
                            description:
                                "Endpoint para actualizar dados dos Clientes.",
                            parameters: [
                                {
                                    name: "id",
                                    in: "path",
                                    required: true,
                                    type: "string",
                                },
                                {
                                    name: "Cliente",
                                    in: "body",
                                    description: "Informações do cliente.",
                                    required: true,
                                    type: "object",
                                    schema: {
                                        $ref: "#/definitions/Cliente",
                                    },
                                },
                            ],
                            responses: {
                                200: {
                                    schema: {
                                        $ref: "#/definitions/idUpdate",
                                    },
                                    description: "Atualizado com sucesso.",
                                },
                                404: {
                                    schema: {
                                        $ref: "#/definitions/IdNo",
                                    },
                                    description: "Registo não encontrado.",
                                },
                            },
                        },
                        get: {
                            tags: ["Cliente"],
                            description:
                                "Endpoint para listar Clientes em função do Id.",
                            parameters: [
                                {
                                    name: "id",
                                    in: "path",
                                    required: true,
                                    type: "string",
                                },
                            ],
                            responses: {
                                200: {
                                    schema: {
                                        $ref: "#/definitions/Cliente",
                                    },
                                    description: "Listando Clientes",
                                },
                                404: {
                                    schema: {
                                        $ref: "#/definitions/IdNo",
                                    },
                                    description: "Cliente não encontrado.",
                                },
                            },
                        },
                        delete: {
                            tags: ["Cliente"],
                            description:
                                "Endpoint para remover Clientes em função do Id.",
                            parameters: [
                                {
                                    name: "id",
                                    in: "path",
                                    required: true,
                                    type: "string",
                                },
                            ],
                            responses: {
                                200: {
                                    schema: {
                                        $ref: "#/definitions/idDelete",
                                    },
                                    description: "Removido com sucesso",
                                },
                                404: {
                                    schema: {
                                        $ref: "#/definitions/IdNo",
                                    },
                                    description: "Removendo Clientes",
                                },
                            },
                        },
                    },
                    "/clientes-pdf": {
                        get: {
                            tags: [],
                            description: "",
                            produces: [],
                            parameters: [],
                            responses: {},
                        },
                    },
                    "/clientesExcel": {
                        get: {
                            tags: [],
                            description: "",
                            produces: [],
                            parameters: [
                                {
                                    name: "obj",
                                    in: "body",
                                    schema: {
                                        type: "object",
                                        properties: {
                                            from: {
                                                example: "any",
                                            },
                                            to: {
                                                example: "any",
                                            },
                                        },
                                    },
                                },
                            ],
                            responses: {},
                        },
                    },
                    "/empresas": {
                        get: {
                            tags: ["Empresa"],
                            description: "Endpoint para listar empresas.",
                            produces: [],
                            parameters: [
                                {
                                    name: "page",
                                    in: "query",
                                    type: "string",
                                },
                                {
                                    name: "perPage",
                                    in: "query",
                                    type: "string",
                                },
                                {
                                    name: "q",
                                    in: "query",
                                    type: "string",
                                },
                            ],
                            responses: {
                                200: {
                                    schema: {
                                        $ref: "#/definitions/Empresa",
                                    },
                                    description: "Listando Empresas",
                                },
                            },
                        },
                        post: {
                            tags: ["Empresa"],
                            description: "Endpoint para cadastrar empresas.",
                            parameters: [
                                {
                                    name: "Empresa",
                                    in: "body",
                                    description:
                                        "Informações da categoria de stock.",
                                    required: true,
                                    type: "object",
                                    schema: {
                                        $ref: "#/definitions/Empresa",
                                    },
                                },
                            ],
                            responses: {
                                200: {
                                    schema: {
                                        $ref: "#/definitions/registerSuccess",
                                    },
                                    description:
                                        "Empresa registada com sucesso.",
                                },
                                409: {
                                    schema: {
                                        $ref: "#/definitions/NameNo",
                                    },
                                    description:
                                        "Empresa com nome ${nome} já está cadastrada.",
                                },
                            },
                        },
                    },
                    "/empresas/one": {
                        get: {
                            tags: ["Empresa"],
                            description:
                                "Endpoint para listar empresa do Usuário que está autenticado.",
                            parameters: [],
                            responses: {
                                200: {
                                    schema: {
                                        $ref: "#/definitions/Empresa",
                                    },
                                    description: "Encontrada a Empresa.",
                                },
                                404: {
                                    schema: {
                                        $ref: "#/definitions/IdNo",
                                    },
                                    description:
                                        "Empresa com ID ${id} não encontrado.",
                                },
                            },
                        },
                    },
                    "/empresas/one/{id}": {
                        get: {
                            tags: ["Empresa"],
                            description:
                                "Endpoint para listar empresa em função do Id.",
                            parameters: [
                                {
                                    name: "id",
                                    in: "path",
                                    required: true,
                                    type: "string",
                                },
                            ],
                            responses: {
                                200: {
                                    schema: {
                                        $ref: "#/definitions/Empresa",
                                    },
                                    description:
                                        "Listando Empresas em função do ID.",
                                },
                                404: {
                                    schema: {
                                        $ref: "#/definitions/IdNo",
                                    },
                                    description:
                                        "Empresa com ID ${id} não encontrado.",
                                },
                            },
                        },
                    },
                    "/empresas/{id}": {
                        put: {
                            tags: ["Empresa"],
                            description:
                                "Endpoint para actualizar dados da empresa.",
                            parameters: [
                                {
                                    name: "id",
                                    in: "path",
                                    required: true,
                                    type: "string",
                                },
                                {
                                    name: "Empresa",
                                    in: "body",
                                    description:
                                        "Informações da categoria de stock.",
                                    required: true,
                                    type: "object",
                                    schema: {
                                        $ref: "#/definitions/Empresa",
                                    },
                                },
                            ],
                            responses: {
                                200: {
                                    schema: {
                                        $ref: "#/definitions/idUpdate",
                                    },
                                    description:
                                        "Dados atualizados com sucesso.",
                                },
                                400: {
                                    schema: {
                                        $ref: "#/definitions/NameNo",
                                    },
                                    description:
                                        "Empresa com email ${nome} já está cadastrada.",
                                },
                                404: {
                                    schema: {
                                        $ref: "#/definitions/IdNo",
                                    },
                                    description:
                                        "Empresa com ID ${id} não existe.",
                                },
                            },
                        },
                    },
                    "/empresas/usuarios/{id}": {
                        get: {
                            tags: ["Empresa"],
                            description:
                                "Endpoint para usuarios que pertencem a empresa.",
                            parameters: [
                                {
                                    name: "id",
                                    in: "path",
                                    required: true,
                                    type: "string",
                                },
                            ],
                            responses: {
                                200: {
                                    schema: {
                                        $ref: "#/definitions/User",
                                    },
                                    description:
                                        "Listando Usuários que pertencem a empresa",
                                },
                            },
                        },
                    },
                    "/entidades": {
                        get: {
                            tags: ["Entidade"],
                            description:
                                "Endpoint para listar todas as entidades.",
                            produces: [],
                            parameters: [
                                {
                                    name: "page",
                                    in: "query",
                                    type: "string",
                                },
                                {
                                    name: "perPage",
                                    in: "query",
                                    type: "string",
                                },
                                {
                                    name: "q",
                                    in: "query",
                                    type: "string",
                                },
                            ],
                            responses: {
                                200: {
                                    schema: {
                                        $ref: "#/definitions/Entidade",
                                    },
                                    description: "Listando Entidades",
                                },
                            },
                        },
                        post: {
                            tags: ["Entidade"],
                            description: "Endpoint para cadastrar entidades.",
                            parameters: [
                                {
                                    name: "Entidade",
                                    in: "body",
                                    description: "Informações da Entidade.",
                                    required: true,
                                    type: "object",
                                    schema: {
                                        $ref: "#/definitions/Entidade",
                                    },
                                },
                            ],
                            responses: {
                                200: {
                                    schema: {
                                        $ref: "#/definitions/registerSuccess",
                                    },
                                    description:
                                        "Dados adicionados com sucesso.",
                                },
                                409: {
                                    schema: {
                                        $ref: "#/definitions/emailNo",
                                    },
                                    description:
                                        "Entidade com e-mail ${email} já está registada",
                                },
                            },
                        },
                    },
                    "/entidades/{id}": {
                        get: {
                            tags: ["Entidade"],
                            description:
                                "Endpoint para listar entidades em função do Id.",
                            parameters: [
                                {
                                    name: "id",
                                    in: "path",
                                    required: true,
                                    type: "string",
                                },
                            ],
                            responses: {
                                200: {
                                    schema: {
                                        $ref: "#/definitions/Entidade",
                                    },
                                    description:
                                        "Listando Entidade em função do Id.",
                                },
                                404: {
                                    schema: {
                                        $ref: "#/definitions/IdNo",
                                    },
                                    description: "Entidade não encontrada.",
                                },
                            },
                        },
                        put: {
                            tags: ["Entidade"],
                            description: "Endpoint para actualizar entidades.",
                            parameters: [
                                {
                                    name: "id",
                                    in: "path",
                                    required: true,
                                    type: "string",
                                },
                                {
                                    name: "Entidade",
                                    in: "body",
                                    description: "Informações da Entidade.",
                                    required: true,
                                    type: "object",
                                    schema: {
                                        $ref: "#/definitions/Entidade",
                                    },
                                },
                            ],
                            responses: {
                                200: {
                                    schema: {
                                        $ref: "#/definitions/idUpdate",
                                    },
                                    description: "Atualizado com sucesso.",
                                },
                                404: {
                                    schema: {
                                        $ref: "#/definitions/IdNo",
                                    },
                                    description: "Registo não encontrado",
                                },
                            },
                        },
                        delete: {
                            tags: ["Entidade"],
                            description:
                                "Endpoint para ____FUNC____ entidades.",
                            parameters: [
                                {
                                    name: "id",
                                    in: "path",
                                    required: true,
                                    type: "string",
                                },
                            ],
                            responses: {
                                200: {
                                    schema: {
                                        $ref: "#/definitions/idDelete",
                                    },
                                    description: "Removido com sucesso",
                                },
                                404: {
                                    schema: {
                                        $ref: "#/definitions/IdNo",
                                    },
                                    description: "Registo não encontrado.",
                                },
                            },
                        },
                    },
                    "/entidades/nome/{name}": {
                        get: {
                            tags: ["Entidade"],
                            description:
                                "Endpoint para listar entidades em função do Nome.",
                            parameters: [
                                {
                                    name: "name",
                                    in: "path",
                                    required: true,
                                    type: "string",
                                },
                            ],
                            responses: {
                                200: {
                                    schema: {
                                        $ref: "#/definitions/Entidade",
                                    },
                                    description: "Listando Entidade.",
                                },
                                404: {
                                    schema: {
                                        $ref: "#/definitions/NameNo",
                                    },
                                    description:
                                        "Entidade ${name} não encontrada.",
                                },
                            },
                        },
                    },
                    "/entidades-excel": {
                        get: {
                            tags: [],
                            description: "",
                            produces: [],
                            parameters: [
                                {
                                    name: "obj",
                                    in: "body",
                                    schema: {
                                        type: "object",
                                        properties: {
                                            from: {
                                                example: "any",
                                            },
                                            to: {
                                                example: "any",
                                            },
                                        },
                                    },
                                },
                            ],
                            responses: {},
                        },
                    },
                    "/entidades/removidos/find": {
                        get: {
                            tags: ["Entidade"],
                            description:
                                "Endpoint para listar entidades com estado removido true (1).",
                            produces: [],
                            parameters: [
                                {
                                    name: "page",
                                    in: "query",
                                    type: "string",
                                },
                                {
                                    name: "perPage",
                                    in: "query",
                                    type: "string",
                                },
                                {
                                    name: "q",
                                    in: "query",
                                    type: "string",
                                },
                            ],
                            responses: {
                                200: {
                                    schema: {
                                        $ref: "#/definitions/Entidade",
                                    },
                                    description:
                                        "Listando Entidade em função do Estado.",
                                },
                            },
                        },
                    },
                    "/fornecedores": {
                        get: {
                            tags: ["Fornecedor"],
                            description: "Endpoint para listar Fornecedores.",
                            produces: [],
                            parameters: [
                                {
                                    name: "page",
                                    in: "query",
                                    type: "string",
                                },
                                {
                                    name: "perPage",
                                    in: "query",
                                    type: "string",
                                },
                                {
                                    name: "q",
                                    in: "query",
                                    type: "string",
                                },
                            ],
                            responses: {
                                200: {
                                    schema: {
                                        $ref: "#/definitions/Fornecedor",
                                    },
                                    description: "Listando Fornecedores",
                                },
                            },
                        },
                        post: {
                            tags: ["Fornecedor"],
                            description:
                                "Endpoint para cadastrar Fornecedores.",
                            parameters: [
                                {
                                    name: "Entidade",
                                    in: "body",
                                    description: "Informações do Fornecedor.",
                                    required: true,
                                    type: "object",
                                    schema: {
                                        $ref: "#/definitions/Fornecedor",
                                    },
                                },
                            ],
                            responses: {
                                200: {
                                    schema: {
                                        $ref: "#/definitions/registerSuccess",
                                    },
                                    description: "Adicionado com sucesso.",
                                },
                                409: {
                                    schema: {
                                        $ref: "#/definitions/emailNo",
                                    },
                                    description:
                                        "Fornecedor com e-mail ${email} já está registado",
                                },
                            },
                        },
                    },
                    "/fornecedores/{id}": {
                        get: {
                            tags: ["Fornecedor"],
                            description:
                                "Endpoint para listar Fornecedores em Função do Id.",
                            parameters: [
                                {
                                    name: "id",
                                    in: "path",
                                    required: true,
                                    type: "string",
                                },
                            ],
                            responses: {
                                200: {
                                    schema: {
                                        $ref: "#/definitions/Fornecedor",
                                    },
                                    description:
                                        "Listando Fornecedor em função do Id.",
                                },
                                404: {
                                    schema: {
                                        $ref: "#/definitions/IdNo",
                                    },
                                    description: "Registo não encontrado.",
                                },
                            },
                        },
                        put: {
                            tags: ["Fornecedor"],
                            description:
                                "Endpoint para actualizar Fornecedores",
                            parameters: [
                                {
                                    name: "id",
                                    in: "path",
                                    required: true,
                                    type: "string",
                                },
                                {
                                    name: "Fornecedor",
                                    in: "body",
                                    description: "Informações do Fornecedor.",
                                    required: true,
                                    type: "object",
                                    schema: {
                                        $ref: "#/definitions/Fornecedor",
                                    },
                                },
                            ],
                            responses: {
                                200: {
                                    schema: {
                                        $ref: "#/definitions/idUpdate",
                                    },
                                    description: "Atualizado com sucesso.",
                                },
                                404: {
                                    schema: {
                                        $ref: "#/definitions/IdNo",
                                    },
                                    description: "Registo não encontrado",
                                },
                            },
                        },
                        delete: {
                            tags: ["Fornecedor"],
                            description:
                                "Endpoint para ____FUNC____ Fornecedores.",
                            parameters: [
                                {
                                    name: "id",
                                    in: "path",
                                    required: true,
                                    type: "string",
                                },
                            ],
                            responses: {
                                200: {
                                    schema: {
                                        $ref: "#/definitions/idDelete",
                                    },
                                    description: "Removido com sucesso",
                                },
                                404: {
                                    schema: {
                                        $ref: "#/definitions/IdNo",
                                    },
                                    description: "Registo não encontrado.",
                                },
                            },
                        },
                    },
                    "/fornecedores/nome/{name}": {
                        get: {
                            tags: ["Fornecedor"],
                            description:
                                "Endpoint para listar Fornecedores em função do Nome.",
                            parameters: [
                                {
                                    name: "name",
                                    in: "path",
                                    required: true,
                                    type: "string",
                                },
                            ],
                            responses: {
                                200: {
                                    schema: {
                                        $ref: "#/definitions/Fornecedor",
                                    },
                                    description: "Listando Fornecedor.",
                                },
                                404: {
                                    schema: {
                                        $ref: "#/definitions/NameNo",
                                    },
                                    description:
                                        "Registo ${name} não encontrado.",
                                },
                            },
                        },
                    },
                    "/fornecedores-excel": {
                        get: {
                            tags: [],
                            description: "",
                            produces: [],
                            parameters: [
                                {
                                    name: "obj",
                                    in: "body",
                                    schema: {
                                        type: "object",
                                        properties: {
                                            from: {
                                                example: "any",
                                            },
                                            to: {
                                                example: "any",
                                            },
                                        },
                                    },
                                },
                            ],
                            responses: {},
                        },
                    },
                    "/fornecedores/removidos/find": {
                        get: {
                            tags: ["Fornecedor"],
                            description:
                                "Endpoint para listar Fornecedores com status true (1) removido.",
                            produces: [],
                            parameters: [
                                {
                                    name: "page",
                                    in: "query",
                                    type: "string",
                                },
                                {
                                    name: "perPage",
                                    in: "query",
                                    type: "string",
                                },
                                {
                                    name: "q",
                                    in: "query",
                                    type: "string",
                                },
                            ],
                            responses: {
                                200: {
                                    schema: {
                                        $ref: "#/definitions/Fornecedor",
                                    },
                                    description:
                                        "Listando Fornecedor em função do Estado.",
                                },
                            },
                        },
                    },
                    "/preco-compra/{preco_id}": {
                        delete: {
                            tags: [],
                            description: "",
                            parameters: [
                                {
                                    name: "preco_id",
                                    in: "path",
                                    required: true,
                                    type: "string",
                                },
                            ],
                            responses: {},
                        },
                    },
                    "/stock/update/fornecedor/{preco_id}": {
                        put: {
                            tags: [],
                            description: "",
                            parameters: [
                                {
                                    name: "preco_id",
                                    in: "path",
                                    required: true,
                                    type: "string",
                                },
                                {
                                    name: "obj",
                                    in: "body",
                                    schema: {
                                        type: "object",
                                        properties: {
                                            preco_compra: {
                                                example: "any",
                                            },
                                            moeda_compra: {
                                                example: "any",
                                            },
                                            stock: {
                                                example: "any",
                                            },
                                        },
                                    },
                                },
                            ],
                            responses: {},
                        },
                    },
                    "/stock/update/fornecedor/{fornecedor_id}/{stock_id}": {
                        put: {
                            tags: [],
                            description: "",
                            parameters: [
                                {
                                    name: "fornecedor_id",
                                    in: "path",
                                    required: true,
                                    type: "string",
                                },
                                {
                                    name: "stock_id",
                                    in: "path",
                                    required: true,
                                    type: "string",
                                },
                                {
                                    name: "obj",
                                    in: "body",
                                    schema: {
                                        type: "object",
                                        properties: {
                                            preco_compra: {
                                                example: "any",
                                            },
                                        },
                                    },
                                },
                            ],
                            responses: {},
                        },
                    },
                    "/stock/add/fornecedor/{stock}/{fornecedor}": {
                        post: {
                            tags: [],
                            description: "",
                            parameters: [
                                {
                                    name: "stock",
                                    in: "path",
                                    required: true,
                                    type: "string",
                                },
                                {
                                    name: "fornecedor",
                                    in: "path",
                                    required: true,
                                    type: "string",
                                },
                                {
                                    name: "obj",
                                    in: "body",
                                    schema: {
                                        type: "object",
                                        properties: {
                                            preco_compra: {
                                                example: "any",
                                            },
                                            moeda_compra: {
                                                example: "any",
                                            },
                                        },
                                    },
                                },
                            ],
                            responses: {},
                        },
                    },
                    "/stock-preco/fornecedor/{fornecedor}": {
                        get: {
                            tags: [],
                            description: "",
                            parameters: [
                                {
                                    name: "fornecedor",
                                    in: "path",
                                    required: true,
                                    type: "string",
                                },
                            ],
                            responses: {},
                        },
                    },
                    "/preco-stock/fornecedor/{id}": {
                        get: {
                            tags: [],
                            description: "",
                            parameters: [
                                {
                                    name: "id",
                                    in: "path",
                                    required: true,
                                    type: "string",
                                },
                            ],
                            responses: {},
                        },
                    },
                    "/permissoes": {
                        post: {
                            tags: ["Permissao"],
                            description: "Endpoint para criar Permissao.",
                            parameters: [
                                {
                                    name: "obj",
                                    in: "body",
                                    schema: {
                                        type: "object",
                                        properties: {
                                            nome: {
                                                example: "any",
                                            },
                                            grupo: {
                                                example: "any",
                                            },
                                        },
                                    },
                                },
                            ],
                            responses: {
                                200: {
                                    schema: {
                                        $ref: "#/definitions/registerSuccess",
                                    },
                                    description:
                                        "Permissão registada com sucesso.",
                                },
                                400: {
                                    schema: {
                                        $ref: "#/definitions/GrupoNo",
                                    },
                                    description:
                                        "O grupo de permissão não existe",
                                },
                            },
                        },
                        get: {
                            tags: ["Permissao"],
                            description: "Endpoint para listar Permissoes.",
                            parameters: [],
                            responses: {
                                200: {
                                    schema: {
                                        $ref: "#/definitions/Permissao",
                                    },
                                    description: "Listando Permissoes",
                                },
                            },
                        },
                    },
                    "/permissoes/por_grupo/{id}": {
                        get: {
                            tags: ["Permissao"],
                            description:
                                "Endpoint para listar Permissoes em funcao do Id do grupo.",
                            parameters: [
                                {
                                    name: "id",
                                    in: "path",
                                    required: true,
                                    type: "string",
                                },
                            ],
                            responses: {
                                200: {
                                    schema: {
                                        $ref: "#/definitions/Permissao",
                                    },
                                    description:
                                        "Listando Permissão em função do Id.",
                                },
                                404: {
                                    schema: {
                                        $ref: "#/definitions/IdNo",
                                    },
                                    description:
                                        "Permissão com grupo não encontrada.",
                                },
                            },
                        },
                    },
                    "/permissoes/{id}": {
                        get: {
                            tags: ["Permissao"],
                            description:
                                "Endpoint para listar Permissoes em funcao do Id.",
                            parameters: [
                                {
                                    name: "id",
                                    in: "path",
                                    required: true,
                                    type: "string",
                                },
                            ],
                            responses: {
                                200: {
                                    schema: {
                                        $ref: "#/definitions/Permissao",
                                    },
                                    description: "Listando Permissão.",
                                },
                            },
                        },
                    },
                    "/grupo/permissoes": {
                        post: {
                            tags: ["Permissao Grupo"],
                            description:
                                "Endpoint para criar Grupo de Permissoes.",
                            parameters: [
                                {
                                    name: "obj",
                                    in: "body",
                                    schema: {
                                        type: "object",
                                        properties: {
                                            nome: {
                                                example: "any",
                                            },
                                        },
                                    },
                                },
                            ],
                            responses: {
                                200: {
                                    schema: {
                                        $ref: "#/definitions/registerSuccess",
                                    },
                                    description:
                                        "Grupo de Permissões registado com sucesso.",
                                },
                                400: {
                                    schema: {
                                        $ref: "#/definitions/nameYes",
                                    },
                                    description:
                                        "A permissão ${nome} já está cadastrada.",
                                },
                            },
                        },
                        get: {
                            tags: ["Permissao Grupo"],
                            description:
                                "Endpoint para listar Grupo de Permissoes.",
                            parameters: [],
                            responses: {
                                200: {
                                    schema: {
                                        $ref: "#/definitions/Permissao_Grupo",
                                    },
                                    description: "Listando Grupos de Permissão",
                                },
                            },
                        },
                    },
                    "/grupo/permissoes/{id}": {
                        get: {
                            tags: ["Permissao Grupo"],
                            description:
                                "Endpoint para listar Grupo de Permissoes em função do Id.",
                            parameters: [
                                {
                                    name: "id",
                                    in: "path",
                                    required: true,
                                    type: "string",
                                },
                            ],
                            responses: {
                                200: {
                                    schema: {
                                        $ref: "#/definitions/Permissao_Grupo",
                                    },
                                    description:
                                        "Listando Grupo de Permissão em função do Id.",
                                },
                                400: {
                                    schema: {
                                        $ref: "#/definitions/IdNo",
                                    },
                                    description:
                                        "Grupo de Permissão com ID ${id} não encontrado.",
                                },
                            },
                        },
                    },
                    "/grupo/permissoes/nome/{nome}": {
                        get: {
                            tags: ["Permissao Grupo"],
                            description:
                                "Endpoint para listar Grupo de Permissoes em função do Nome.",
                            parameters: [
                                {
                                    name: "nome",
                                    in: "path",
                                    required: true,
                                    type: "string",
                                },
                            ],
                            responses: {
                                200: {
                                    schema: {
                                        $ref: "#/definitions/Permissao_Grupo",
                                    },
                                    description:
                                        "Listando Grupo de Permissão em função do Nome",
                                },
                                400: {
                                    schema: {
                                        $ref: "#/definitions/NameNo",
                                    },
                                    description:
                                        "Grupo de Permissão com o nome ${nome} não encontrado.",
                                },
                            },
                        },
                    },
                    "/stock": {
                        get: {
                            tags: ["Stock"],
                            description: "Endpoint para listar Stock.",
                            produces: [],
                            parameters: [
                                {
                                    name: "page",
                                    in: "query",
                                    type: "string",
                                },
                                {
                                    name: "perPage",
                                    in: "query",
                                    type: "string",
                                },
                                {
                                    name: "q",
                                    in: "query",
                                    type: "string",
                                },
                            ],
                            responses: {
                                200: {
                                    schema: {
                                        $ref: "#/definitions/Stock",
                                    },
                                    description: "Listando Stock.",
                                },
                            },
                        },
                        post: {
                            tags: ["Stock"],
                            description: "Endpoint para cadastrar Stock.",
                            parameters: [
                                {
                                    name: "obj",
                                    in: "body",
                                    schema: {
                                        type: "object",
                                        properties: {
                                            preco_venda: {
                                                example: "any",
                                            },
                                            preco_compra: {
                                                example: "any",
                                            },
                                            moeda_compra: {
                                                example: "any",
                                            },
                                            moeda_venda: {
                                                example: "any",
                                            },
                                            venda_taxa: {
                                                example: "any",
                                            },
                                            compra_taxa: {
                                                example: "any",
                                            },
                                            venda_taxa_inclusa: {
                                                example: "any",
                                            },
                                            compra_taxa_inclusa: {
                                                example: "any",
                                            },
                                        },
                                    },
                                },
                            ],
                            responses: {
                                200: {
                                    schema: {
                                        $ref: "#/definitions/Stock",
                                    },
                                    description: "Stock registado com sucesso.",
                                },
                                404: {
                                    schema: {
                                        $ref: "#/definitions/NaoCadastrado",
                                    },
                                    description:
                                        "Categoria não está cadastrada.",
                                },
                                409: {
                                    schema: {
                                        $ref: "#/definitions/StockYes",
                                    },
                                    description: "Stock já informado.",
                                },
                            },
                        },
                    },
                    "/stock/update/{preco_id}": {
                        put: {
                            tags: [],
                            description: "",
                            parameters: [
                                {
                                    name: "preco_id",
                                    in: "path",
                                    required: true,
                                    type: "string",
                                },
                                {
                                    name: "obj",
                                    in: "body",
                                    schema: {
                                        type: "object",
                                        properties: {
                                            preco_venda: {
                                                example: "any",
                                            },
                                            moeda_venda: {
                                                example: "any",
                                            },
                                        },
                                    },
                                },
                            ],
                            responses: {},
                        },
                    },
                    "/stock/update/cliente/{cliente_id}/{stock_id}": {
                        put: {
                            tags: [],
                            description: "",
                            parameters: [
                                {
                                    name: "cliente_id",
                                    in: "path",
                                    required: true,
                                    type: "string",
                                },
                                {
                                    name: "stock_id",
                                    in: "path",
                                    required: true,
                                    type: "string",
                                },
                                {
                                    name: "obj",
                                    in: "body",
                                    schema: {
                                        type: "object",
                                        properties: {
                                            preco_venda: {
                                                example: "any",
                                            },
                                        },
                                    },
                                },
                            ],
                            responses: {},
                        },
                    },
                    "/stock/add/{stock}/{cliente}": {
                        post: {
                            tags: [],
                            description: "",
                            parameters: [
                                {
                                    name: "stock",
                                    in: "path",
                                    required: true,
                                    type: "string",
                                },
                                {
                                    name: "cliente",
                                    in: "path",
                                    required: true,
                                    type: "string",
                                },
                                {
                                    name: "obj",
                                    in: "body",
                                    schema: {
                                        type: "object",
                                        properties: {
                                            preco_venda: {
                                                example: "any",
                                            },
                                            moeda_venda: {
                                                example: "any",
                                            },
                                        },
                                    },
                                },
                            ],
                            responses: {},
                        },
                    },
                    "/stock/{id}": {
                        get: {
                            tags: ["Stock"],
                            description:
                                "Endpoint para listar stock em função do Id.",
                            parameters: [
                                {
                                    name: "id",
                                    in: "path",
                                    required: true,
                                    type: "string",
                                },
                            ],
                            responses: {
                                200: {
                                    schema: {
                                        $ref: "#/definitions/Stock",
                                    },
                                    description:
                                        "Listando Stock em função do Id.",
                                },
                                404: {
                                    schema: {
                                        $ref: "#/definitions/IdNo",
                                    },
                                    description: "Registo não encontrado.",
                                },
                            },
                        },
                        delete: {
                            tags: ["Stock"],
                            description: "Endpoint para ____FUNC____ stock.",
                            parameters: [
                                {
                                    name: "id",
                                    in: "path",
                                    required: true,
                                    type: "string",
                                },
                            ],
                            responses: {
                                200: {
                                    schema: {
                                        $ref: "#/definitions/idDelete",
                                    },
                                    description: "removido com sucesso.",
                                },
                                404: {
                                    schema: {
                                        $ref: "#/definitions/IdNo",
                                    },
                                    description: "Registo não encontrado.",
                                },
                            },
                        },
                        put: {
                            tags: ["Stock"],
                            description: "Endpoint para actualizar stock.",
                            parameters: [
                                {
                                    name: "id",
                                    in: "path",
                                    required: true,
                                    type: "string",
                                },
                                {
                                    name: "obj",
                                    in: "body",
                                    schema: {
                                        type: "object",
                                        properties: {
                                            preco_venda: {
                                                example: "any",
                                            },
                                            preco_compra: {
                                                example: "any",
                                            },
                                            venda_taxa: {
                                                example: "any",
                                            },
                                            moeda_compra: {
                                                example: "any",
                                            },
                                            moeda_venda: {
                                                example: "any",
                                            },
                                            compra_taxa: {
                                                example: "any",
                                            },
                                            venda_taxa_inclusa: {
                                                example: "any",
                                            },
                                            compra_taxa_inclusa: {
                                                example: "any",
                                            },
                                        },
                                    },
                                },
                            ],
                            responses: {
                                200: {
                                    schema: {
                                        $ref: "#/definitions/idUpdate",
                                    },
                                    description:
                                        "Dados atualizados com sucesso.",
                                },
                                404: {
                                    schema: {
                                        $ref: "#/definitions/Categoryes",
                                    },
                                    description:
                                        "Categoria de stock não está cadastrada.",
                                },
                            },
                        },
                    },
                    "/stock-preco/{clienteId}": {
                        get: {
                            tags: ["Preco_venda"],
                            description: "Endpoint para listar Stock.",
                            parameters: [
                                {
                                    name: "clienteId",
                                    in: "path",
                                    required: true,
                                    type: "string",
                                },
                            ],
                            responses: {},
                        },
                    },
                    "/preco-stock/{id}": {
                        get: {
                            tags: ["Preco_venda"],
                            description: "Endpoint para listar Stock.",
                            parameters: [
                                {
                                    name: "id",
                                    in: "path",
                                    required: true,
                                    type: "string",
                                },
                            ],
                            responses: {},
                        },
                    },
                    "/stock/ref/{ref}": {
                        get: {
                            tags: ["Stock"],
                            description:
                                "Endpoint para listar stock em função do Id.",
                            parameters: [
                                {
                                    name: "ref",
                                    in: "path",
                                    required: true,
                                    type: "string",
                                },
                            ],
                            responses: {
                                200: {
                                    schema: {
                                        $ref: "#/definitions/Stock",
                                    },
                                    description:
                                        "Listando Stock em função do Id.",
                                },
                                404: {
                                    schema: {
                                        $ref: "#/definitions/IdNo",
                                    },
                                    description: "Registo não encontrado.",
                                },
                            },
                        },
                    },
                    "/stock-excel": {
                        get: {
                            tags: [],
                            description: "",
                            produces: [],
                            parameters: [
                                {
                                    name: "obj",
                                    in: "body",
                                    schema: {
                                        type: "object",
                                        properties: {
                                            from: {
                                                example: "any",
                                            },
                                            to: {
                                                example: "any",
                                            },
                                        },
                                    },
                                },
                            ],
                            responses: {},
                        },
                    },
                    "/stock/removed/all": {
                        get: {
                            tags: ["Stock"],
                            description:
                                "Endpoint para listar stock com status removido true (1).",
                            produces: [],
                            parameters: [
                                {
                                    name: "page",
                                    in: "query",
                                    type: "string",
                                },
                                {
                                    name: "perPage",
                                    in: "query",
                                    type: "string",
                                },
                                {
                                    name: "q",
                                    in: "query",
                                    type: "string",
                                },
                            ],
                            responses: {
                                200: {
                                    schema: {
                                        $ref: "#/definitions/Stock",
                                    },
                                    description:
                                        "Listando Stock em função do estado.",
                                },
                            },
                        },
                    },
                    "/preco-venda/{preco_id}": {
                        delete: {
                            tags: [],
                            description: "",
                            parameters: [
                                {
                                    name: "preco_id",
                                    in: "path",
                                    required: true,
                                    type: "string",
                                },
                            ],
                            responses: {},
                        },
                    },
                    "/taxas": {
                        post: {
                            tags: ["Taxa"],
                            description: "Endpoint para cadastrar Taxa.",
                            parameters: [],
                            responses: {
                                200: {
                                    schema: {
                                        $ref: "#/definitions/Taxa",
                                    },
                                    description: "Registado com sucesso.",
                                },
                            },
                        },
                        get: {
                            tags: ["Taxa"],
                            description: "Endpoint para listar Taxa.",
                            parameters: [],
                            responses: {
                                200: {
                                    schema: {
                                        $ref: "#/definitions/Taxa",
                                    },
                                    description: "Listando Taxas.",
                                },
                            },
                        },
                    },
                    "/taxas/{id}": {
                        get: {
                            tags: ["Taxa"],
                            description:
                                "Endpoint para listar Taxa em função do Id.",
                            parameters: [
                                {
                                    name: "id",
                                    in: "path",
                                    required: true,
                                    type: "string",
                                },
                            ],
                            responses: {
                                200: {
                                    schema: {
                                        $ref: "#/definitions/Taxa",
                                    },
                                    description:
                                        "Listando Taxa em função do Id.",
                                },
                                404: {
                                    schema: {
                                        $ref: "#/definitions/IdNo",
                                    },
                                    description:
                                        "Taxa com o ID ${id} não encontrado..",
                                },
                            },
                        },
                        delete: {
                            tags: ["Taxa"],
                            description: "Endpoint para remover Taxa.",
                            parameters: [
                                {
                                    name: "id",
                                    in: "path",
                                    required: true,
                                    type: "string",
                                },
                            ],
                            responses: {
                                200: {
                                    schema: {
                                        $ref: "#/definitions/idDelete",
                                    },
                                    description: "Taxa removida com sucesso.",
                                },
                                404: {
                                    schema: {
                                        $ref: "#/definitions/IdNo",
                                    },
                                    description:
                                        "Taxa com ID ${id} não encontrada.",
                                },
                            },
                        },
                        put: {
                            tags: ["Taxa"],
                            description: "Endpoint para actualizar Taxa.",
                            parameters: [
                                {
                                    name: "id",
                                    in: "path",
                                    required: true,
                                    type: "string",
                                },
                            ],
                            responses: {
                                200: {
                                    schema: {
                                        $ref: "#/definitions/idUpdate",
                                    },
                                    description:
                                        "Taxa Actualizada com sucesso.",
                                },
                                404: {
                                    schema: {
                                        $ref: "#/definitions/IdNo",
                                    },
                                    description:
                                        "Taxa com ID ${id} não encontrada.",
                                },
                            },
                        },
                    },
                    "/tipo-doc": {
                        post: {
                            tags: ["Tipo de Documento"],
                            description:
                                "Endpoint para criar Tipo de documento",
                            parameters: [],
                            responses: {
                                200: {
                                    schema: {
                                        $ref: "#/definitions/Tipo_Doc",
                                    },
                                    description:
                                        "Dados adicionados com sucesso.",
                                },
                                409: {
                                    schema: {
                                        $ref: "#/definitions/TipoDocYes",
                                    },
                                    description:
                                        "Tipo de documento já registado.",
                                },
                            },
                        },
                        get: {
                            tags: ["Tipo de Documento"],
                            description:
                                "Endpoint para listar todos os Tipos de documento",
                            parameters: [],
                            responses: {
                                200: {
                                    schema: {
                                        $ref: "#/definitions/Tipo_Doc",
                                    },
                                    description: "Listando Tipo de documento.",
                                },
                            },
                        },
                    },
                    "/tipo-doc/{id}": {
                        put: {
                            tags: ["Tipo de Documento"],
                            description:
                                "Endpoint para criar Tipo de documento",
                            parameters: [
                                {
                                    name: "id",
                                    in: "path",
                                    required: true,
                                    type: "string",
                                },
                            ],
                            responses: {
                                200: {
                                    schema: {
                                        $ref: "#/definitions/Tipo_Doc",
                                    },
                                    description:
                                        "Dados adicionados com sucesso.",
                                },
                            },
                        },
                        delete: {
                            tags: ["Tipo de Documento"],
                            description:
                                "Endpoint para remover Tipo de documento",
                            parameters: [
                                {
                                    name: "id",
                                    in: "path",
                                    required: true,
                                    type: "string",
                                },
                            ],
                            responses: {
                                200: {
                                    schema: {
                                        $ref: "#/definitions/idDelete",
                                    },
                                    description:
                                        "Tipo de documento removido com sucesso.",
                                },
                            },
                        },
                        get: {
                            tags: ["Tipo de Documento"],
                            description:
                                "Endpoint para listar Tipos de documento em função do Id",
                            parameters: [
                                {
                                    name: "id",
                                    in: "path",
                                    required: true,
                                    type: "string",
                                },
                            ],
                            responses: {
                                404: {
                                    schema: {
                                        $ref: "#/definitions/Tipo_Doc",
                                    },
                                    description:
                                        "Listando Tipo de Documento por Id.",
                                },
                            },
                        },
                    },
                    "/tipoDoc/{categoria}": {
                        get: {
                            tags: ["Tipo de Documento"],
                            description:
                                "Endpoint para listar Tipos de documento em função do Id",
                            parameters: [
                                {
                                    name: "categoria",
                                    in: "path",
                                    required: true,
                                    type: "string",
                                },
                            ],
                            responses: {
                                404: {
                                    schema: {
                                        $ref: "#/definitions/Tipo_Doc",
                                    },
                                    description:
                                        "Listando Tipo de Documento por Id.",
                                },
                            },
                        },
                    },
                    "/permissoes-usuario/{id}": {
                        get: {
                            tags: ["Permissão de Usuário"],
                            description:
                                "Endpoint listar permissao ao Usuario em função do Id",
                            parameters: [
                                {
                                    name: "id",
                                    in: "path",
                                    required: true,
                                    type: "string",
                                },
                            ],
                            responses: {},
                        },
                    },
                    "/permissoes-usuario": {
                        post: {
                            tags: ["Permissão de Usuário"],
                            description:
                                "Endpoint para atribuir permissao ao Usuario",
                            parameters: [
                                {
                                    name: "obj",
                                    in: "body",
                                    schema: {
                                        type: "object",
                                        properties: {
                                            permissaoId: {
                                                example: "any",
                                            },
                                            usuarioId: {
                                                example: "any",
                                            },
                                        },
                                    },
                                },
                            ],
                            responses: {
                                200: {
                                    schema: {
                                        $ref: "#/definitions/registerSuccess",
                                    },
                                    description:
                                        "Permissão adicionada com sucesso.",
                                },
                                400: {
                                    description:
                                        "Um usuário com o Id ${usuarioId} Já possui esta permissão .",
                                    schema: {
                                        $ref: "#/definitions/permissaoYes",
                                    },
                                },
                                404: {
                                    description:
                                        "Não existe Nenhum usuário com o Id ${usuarioId}.",
                                    schema: {
                                        $ref: "#/definitions/IdNo",
                                    },
                                },
                            },
                        },
                    },
                    "/permissoes-usuario/lista": {
                        post: {
                            tags: ["Permissão de Usuário"],
                            description:
                                "Endpoint para atribuir permissões ao Usuario",
                            parameters: [
                                {
                                    name: "obj",
                                    in: "body",
                                    schema: {
                                        type: "object",
                                        properties: {
                                            permissions: {
                                                example: "any",
                                            },
                                            userId: {
                                                example: "any",
                                            },
                                        },
                                    },
                                },
                            ],
                            responses: {
                                200: {
                                    schema: {
                                        $ref: "#/definitions/registerSuccess",
                                    },
                                    description:
                                        "Permissões adicionadas com sucesso.",
                                },
                                404: {
                                    schema: {
                                        $ref: "#/definitions/IdNo",
                                    },
                                    description: "Usuário não encontrado.",
                                },
                            },
                        },
                    },
                    "/deletePermissoes/{idU}/{idP}": {
                        post: {
                            tags: ["Permissão de Usuário"],
                            description:
                                "Endpoint para remover permissao de Usuario",
                            parameters: [
                                {
                                    name: "idU",
                                    in: "path",
                                    required: true,
                                    type: "string",
                                },
                                {
                                    name: "idP",
                                    in: "path",
                                    required: true,
                                    type: "string",
                                },
                            ],
                            responses: {
                                200: {
                                    description:
                                        "Permissao removida com sucesso.",
                                    schema: {
                                        $ref: "#/definitions/idDelete",
                                    },
                                },
                                400: {
                                    description:
                                        "Nenhum registro de Permissões encontrado.",
                                    schema: {
                                        $ref: "#/definitions/permissaoNo",
                                    },
                                },
                                404: {
                                    schema: {
                                        $ref: "#/definitions/IdNo",
                                    },
                                    description:
                                        "Não existe uma permissão com o Id ${Id}.",
                                },
                            },
                        },
                    },
                    "/cambio": {
                        get: {
                            tags: ["Cambio"],
                            description: "Endpoint para Listar Câmbio.",
                            parameters: [],
                            responses: {},
                        },
                        post: {
                            tags: ["Cambio"],
                            description: "Endpoint para cadastrar Cambio.",
                            parameters: [],
                            responses: {
                                200: {
                                    schema: {
                                        $ref: "#/definitions/registerSuccess",
                                    },
                                    description:
                                        "Câmbio registado com sucesso.",
                                },
                                400: {
                                    schema: {
                                        $ref: "#/definitions/MoedaNo",
                                    },
                                    description:
                                        "A moeda Padrão não pode ser igual a moeda de conversão.",
                                },
                            },
                        },
                    },
                    "/cambio/{id}": {
                        get: {
                            tags: ["Cambio"],
                            description:
                                "Endpoint para Listar Câmbio em função do Id.",
                            parameters: [
                                {
                                    name: "id",
                                    in: "path",
                                    required: true,
                                    type: "string",
                                },
                            ],
                            responses: {
                                200: {
                                    schema: {
                                        $ref: "#/definitions/Cambio",
                                    },
                                    description: "Listando Câmbio por Id.",
                                },
                            },
                        },
                        put: {
                            tags: [],
                            description: "",
                            parameters: [
                                {
                                    name: "id",
                                    in: "path",
                                    required: true,
                                    type: "string",
                                },
                            ],
                            responses: {
                                200: {
                                    schema: {
                                        $ref: "#/definitions/idUpdate",
                                    },
                                    description:
                                        "Dados atualizados com sucesso.",
                                },
                                400: {
                                    schema: {
                                        $ref: "#/definitions/InvalidValue",
                                    },
                                    description: "Valor introduzido inválido.",
                                },
                            },
                        },
                        delete: {
                            tags: ["Cambio"],
                            description: "Endpoint para Remover Câmbio.",
                            parameters: [
                                {
                                    name: "id",
                                    in: "path",
                                    required: true,
                                    type: "string",
                                },
                            ],
                            responses: {
                                200: {
                                    schema: {
                                        $ref: "#/definitions/idDelete",
                                    },
                                    description: "Dados removidos com sucesso.",
                                },
                                404: {
                                    schema: {
                                        $ref: "#/definitions/idUpdate",
                                    },
                                    description:
                                        "Câmbio com o ID ${id} não encontrado.",
                                },
                            },
                        },
                    },
                    "/lingua": {
                        get: {
                            tags: ["Traducao"],
                            description: "Endpoint para listar Taxa.",
                            parameters: [],
                            responses: {
                                200: {
                                    schema: {
                                        $ref: "#/definitions/Taxa",
                                    },
                                    description: "Listando Taxas.",
                                },
                            },
                        },
                        post: {
                            tags: ["Traducao"],
                            description: "Endpoint para cadastrar Taxa.",
                            parameters: [],
                            responses: {},
                        },
                    },
                    "/lingua/{id}": {
                        get: {
                            tags: ["Taxa"],
                            description:
                                "Endpoint para listar Taxa em função do Id.",
                            parameters: [
                                {
                                    name: "id",
                                    in: "path",
                                    required: true,
                                    type: "string",
                                },
                            ],
                            responses: {
                                200: {
                                    schema: {
                                        $ref: "#/definitions/Taxa",
                                    },
                                    description:
                                        "Listando Taxa em função do Id.",
                                },
                                404: {
                                    schema: {
                                        $ref: "#/definitions/IdNo",
                                    },
                                    description:
                                        "Taxa com o ID ${id} não encontrado..",
                                },
                            },
                        },
                        put: {
                            tags: ["Traducao"],
                            description: "Endpoint para actualizar Tradução.",
                            parameters: [
                                {
                                    name: "id",
                                    in: "path",
                                    required: true,
                                    type: "string",
                                },
                            ],
                            responses: {
                                200: {
                                    schema: {
                                        $ref: "#/definitions/idUpdate",
                                    },
                                    description:
                                        "Taxa Actualizada com sucesso.",
                                },
                                404: {
                                    schema: {
                                        $ref: "#/definitions/IdNo",
                                    },
                                    description:
                                        "Taxa com ID ${id} não encontrada.",
                                },
                            },
                        },
                        delete: {
                            tags: ["Traducao"],
                            description: "Endpoint para ____FUNC____ Taxa.",
                            parameters: [
                                {
                                    name: "id",
                                    in: "path",
                                    required: true,
                                    type: "string",
                                },
                            ],
                            responses: {
                                200: {
                                    schema: {
                                        $ref: "#/definitions/idDelete",
                                    },
                                    description:
                                        "Tradução removida com sucesso.",
                                },
                                404: {
                                    schema: {
                                        $ref: "#/definitions/IdNo",
                                    },
                                    description:
                                        "Tradução com ID ${id} não encontrada.",
                                },
                            },
                        },
                    },
                    "/traducao": {
                        get: {
                            tags: ["Traducao"],
                            description: "Endpoint para listar Tradução.",
                            parameters: [],
                            responses: {
                                200: {
                                    schema: {
                                        $ref: "#/definitions/Traducao",
                                    },
                                    description: "Listando Traducao.",
                                },
                            },
                        },
                        post: {
                            tags: ["Traducao"],
                            description: "Endpoint para cadastrar Taxa.",
                            parameters: [],
                            responses: {
                                200: {
                                    schema: {
                                        $ref: "#/definitions/Traducao",
                                    },
                                    description: "Registado com sucesso.",
                                },
                                404: {
                                    schema: {
                                        $ref: "#/definitions/TchaveNo",
                                    },
                                    description:
                                        "Tradução Chave não encontrada.",
                                },
                            },
                        },
                    },
                    "/traducao/{id}": {
                        get: {
                            tags: ["Traducao"],
                            description:
                                "Endpoint para listar Tradução em função do Id.",
                            parameters: [
                                {
                                    name: "id",
                                    in: "path",
                                    required: true,
                                    type: "string",
                                },
                            ],
                            responses: {
                                200: {
                                    schema: {
                                        $ref: "#/definitions/Traducao",
                                    },
                                    description:
                                        "Traducao com o ID ${id} não encontrado.",
                                },
                                404: {
                                    schema: {
                                        $ref: "#/definitions/IdNo",
                                    },
                                    description:
                                        "Traducao com o ID ${id} não encontrado.",
                                },
                            },
                        },
                        put: {
                            tags: ["Traducao"],
                            description: "Endpoint para actualizar Tradução.",
                            parameters: [
                                {
                                    name: "id",
                                    in: "path",
                                    required: true,
                                    type: "string",
                                },
                            ],
                            responses: {
                                200: {
                                    schema: {
                                        $ref: "#/definitions/idUpdate",
                                    },
                                    description:
                                        "Tradução Actualizada com sucesso.",
                                },
                                404: {
                                    schema: {
                                        $ref: "#/definitions/IdNo",
                                    },
                                    description:
                                        "Tradução com ID ${id} não encontrado.",
                                },
                            },
                        },
                        delete: {
                            tags: ["Traducao"],
                            description: "Endpoint para ____FUNC____ Taxa.",
                            parameters: [
                                {
                                    name: "id",
                                    in: "path",
                                    required: true,
                                    type: "string",
                                },
                            ],
                            responses: {
                                200: {
                                    schema: {
                                        $ref: "#/definitions/idDelete",
                                    },
                                    description:
                                        "Tradução removida com sucesso.",
                                },
                                404: {
                                    schema: {
                                        $ref: "#/definitions/IdNo",
                                    },
                                    description:
                                        "Tradução com ID ${id} não encontrada.",
                                },
                            },
                        },
                    },
                    "/traducao_chave": {
                        get: {
                            tags: ["Traducao"],
                            description: "Endpoint para listar Taxa.",
                            parameters: [],
                            responses: {
                                200: {
                                    schema: {
                                        $ref: "#/definitions/Taxa",
                                    },
                                    description: "Listando Taxas.",
                                },
                            },
                        },
                        post: {
                            tags: ["Traducao"],
                            description: "Endpoint para cadastrar Taxa.",
                            parameters: [],
                            responses: {},
                        },
                    },
                    "/traducao_chave/{id}": {
                        get: {
                            tags: ["Taxa"],
                            description:
                                "Endpoint para listar Taxa em função do Id.",
                            parameters: [
                                {
                                    name: "id",
                                    in: "path",
                                    required: true,
                                    type: "string",
                                },
                            ],
                            responses: {
                                200: {
                                    schema: {
                                        $ref: "#/definitions/Taxa",
                                    },
                                    description:
                                        "Listando Taxa em função do Id.",
                                },
                                404: {
                                    schema: {
                                        $ref: "#/definitions/IdNo",
                                    },
                                    description:
                                        "Taxa com o ID ${id} não encontrado..",
                                },
                            },
                        },
                        put: {
                            tags: ["Traducao"],
                            description: "Endpoint para actualizar Tradução.",
                            parameters: [
                                {
                                    name: "id",
                                    in: "path",
                                    required: true,
                                    type: "string",
                                },
                            ],
                            responses: {
                                200: {
                                    schema: {
                                        $ref: "#/definitions/idUpdate",
                                    },
                                    description:
                                        "Taxa Actualizada com sucesso.",
                                },
                                404: {
                                    schema: {
                                        $ref: "#/definitions/IdNo",
                                    },
                                    description:
                                        "Taxa com ID ${id} não encontrada.",
                                },
                            },
                        },
                        delete: {
                            tags: ["Traducao"],
                            description: "Endpoint para ____FUNC____ Taxa.",
                            parameters: [
                                {
                                    name: "id",
                                    in: "path",
                                    required: true,
                                    type: "string",
                                },
                            ],
                            responses: {
                                200: {
                                    schema: {
                                        $ref: "#/definitions/idDelete",
                                    },
                                    description:
                                        "Tradução removida com sucesso.",
                                },
                                404: {
                                    schema: {
                                        $ref: "#/definitions/IdNo",
                                    },
                                    description:
                                        "Tradução com ID ${id} não encontrada.",
                                },
                            },
                        },
                    },
                },
                definitions: {
                    loginUser: {
                        type: "object",
                        properties: {
                            email: {
                                type: "string",
                                example: "clesiaroberto@yahoo.com",
                            },
                            password: {
                                type: "string",
                                example: "12345678",
                            },
                        },
                    },
                    loginUserErr: {
                        type: "object",
                        properties: {
                            message: {
                                type: "string",
                                example: "E-mail ou password incorrecto",
                            },
                        },
                    },
                    UserErr: {
                        type: "object",
                        properties: {
                            message: {
                                type: "string",
                                example:
                                    "A sua conta está desativada. Contacte o suporte técnico",
                            },
                        },
                    },
                    UserEmpty: {
                        type: "object",
                        properties: {
                            message: {
                                type: "string",
                                example: "E-mail e Password são obrigatórios",
                            },
                        },
                    },
                    TokenSuccess: {
                        type: "object",
                        properties: {
                            message: {
                                type: "string",
                                example: "Usuário autenticado",
                            },
                        },
                    },
                    Token: {
                        type: "object",
                        properties: {
                            message: {
                                type: "string",
                                example: "Refresh token expirado",
                            },
                        },
                    },
                    userToken: {
                        type: "object",
                        properties: {
                            menssagem: {
                                type: "string",
                                example: "Refresh Token não Encontrado",
                            },
                        },
                    },
                    NotFoundCategory: {
                        type: "object",
                        properties: {
                            message: {
                                type: "string",
                                example:
                                    "Registo com categoria ${categoria} não foi encontrado",
                            },
                        },
                    },
                    LogOut: {
                        type: "object",
                        properties: {
                            message: {
                                type: "string",
                                example: "Sessão Terminada!",
                            },
                        },
                    },
                    UnAuthorized: {
                        type: "object",
                        properties: {
                            message: {
                                type: "string",
                                example: "Não autorizado!",
                            },
                        },
                    },
                    IdNo: {
                        type: "object",
                        properties: {
                            message: {
                                type: "string",
                                example: "Registo Não Encontrado!",
                            },
                        },
                    },
                    NameNo: {
                        type: "object",
                        properties: {
                            message: {
                                type: "string",
                                example: "Nome Não Encontrado!",
                            },
                        },
                    },
                    idUpdate: {
                        type: "object",
                        properties: {
                            message: {
                                type: "string",
                                example: "Actualizado com Sucesso!",
                            },
                        },
                    },
                    idDelete: {
                        type: "object",
                        properties: {
                            message: {
                                type: "string",
                                example: "Removido com Sucesso!",
                            },
                        },
                    },
                    empresaNo: {
                        type: "object",
                        properties: {
                            message: {
                                type: "string",
                                example: "Empresa informada não existe!",
                            },
                        },
                    },
                    registerSuccess: {
                        type: "object",
                        properties: {
                            message: {
                                type: "string",
                                example: "Registado com Sucesso!",
                            },
                        },
                    },
                    StatusNo: {
                        type: "object",
                        properties: {
                            message: {
                                type: "string",
                                example:
                                    "Não podes alterar o estado da tua própria conta",
                            },
                        },
                    },
                    statusInvalid: {
                        type: "object",
                        properties: {
                            message: {
                                type: "string",
                                example: "O estado informado não é válido.",
                            },
                        },
                    },
                    statusUpdate: {
                        type: "object",
                        properties: {
                            message: {
                                type: "string",
                                example: "Status actualizado com sucesso!",
                            },
                        },
                    },
                    emailNo: {
                        type: "object",
                        properties: {
                            message: {
                                type: "string",
                                example: "E-mail informado Já existe!",
                            },
                        },
                    },
                    nameYes: {
                        type: "object",
                        properties: {
                            message: {
                                type: "string",
                                example: "Nome informado Já existe!",
                            },
                        },
                    },
                    CategoryNo: {
                        type: "object",
                        properties: {
                            message: {
                                type: "string",
                                example: "Categoria informada Já existe!",
                            },
                        },
                    },
                    permissaoYes: {
                        type: "object",
                        properties: {
                            message: {
                                type: "string",
                                example: "O usuário já possui esta permissão!",
                            },
                        },
                    },
                    permissaoNo: {
                        type: "object",
                        properties: {
                            message: {
                                type: "string",
                                example: "Nenhum registo encontrado!",
                            },
                        },
                    },
                    Categoryes: {
                        type: "object",
                        properties: {
                            message: {
                                type: "string",
                                example:
                                    "Categoria informada não está cadastrada!",
                            },
                        },
                    },
                    StockYes: {
                        type: "object",
                        properties: {
                            message: {
                                type: "string",
                                example: "Stock informado Já existe!",
                            },
                        },
                    },
                    TipoDocYes: {
                        type: "object",
                        properties: {
                            message: {
                                type: "string",
                                example:
                                    "Tipo de documento informado Já existe!",
                            },
                        },
                    },
                    GrupoNo: {
                        type: "object",
                        properties: {
                            message: {
                                type: "string",
                                example: "Grupo informado não existe!",
                            },
                        },
                    },
                    SenhaActual: {
                        type: "object",
                        properties: {
                            message: {
                                type: "string",
                                example: "A senha não está correta",
                            },
                        },
                    },
                    SenhaOk: {
                        type: "object",
                        properties: {
                            message: {
                                type: "string",
                                example: "Senha Confirmada",
                            },
                        },
                    },
                    NovaSenha: {
                        type: "object",
                        properties: {
                            message: {
                                type: "string",
                                example:
                                    "A nova senha não pode ser igual a senha atual.",
                            },
                        },
                    },
                    IdAdmin: {
                        type: "object",
                        properties: {
                            message: {
                                type: "string",
                                example:
                                    "Não podes alterar senha de um administrador",
                            },
                        },
                    },
                    SenhaUpdate: {
                        type: "object",
                        properties: {
                            message: {
                                type: "string",
                                example: "Senha alterada com Sucesso.",
                            },
                        },
                    },
                    InvalidValue: {
                        type: "object",
                        properties: {
                            message: {
                                type: "string",
                                example: "Valor introduzido Inválido.",
                            },
                        },
                    },
                    MoedaNo: {
                        type: "object",
                        properties: {
                            message: {
                                type: "string",
                                example:
                                    " A moeda Padrão não pode ser igual a moeda de conversão.",
                            },
                        },
                    },
                    SenhaNo: {
                        type: "object",
                        properties: {
                            message: {
                                type: "string",
                                example: "Senha não informada.",
                            },
                        },
                    },
                    UserTokenSUccess: {
                        type: "object",
                        properties: {
                            UserId: {
                                type: "number",
                                example: 18,
                            },
                            nome: {
                                type: "string",
                                example: "clesia",
                            },
                            apelido: {
                                type: "string",
                                example: "Roberto",
                            },
                            imagem: {
                                type: "string",
                                example: "img.png",
                            },
                            empresaId: {
                                type: "number",
                                example: 1,
                            },
                            empresaNome: {
                                type: "string",
                                example: "Nc Software",
                            },
                            isAdmin: {
                                type: "boolean",
                                example: false,
                            },
                        },
                    },
                    User: {
                        type: "object",
                        properties: {
                            id: {
                                type: "number",
                                example: 18,
                            },
                            nome: {
                                type: "string",
                                example: "Clésia",
                            },
                            apelido: {
                                type: "string",
                                example: "Roberto",
                            },
                            email: {
                                type: "string",
                                example: "clesiaroberto@yahoo.com",
                            },
                            contacto1: {
                                type: "string",
                                example: "844024855",
                            },
                            contacto2: {
                                type: "string",
                                example: "844024855",
                            },
                            imagem: {
                                type: "string",
                                example: "default.png",
                            },
                            estado: {
                                type: "number",
                                example: 1,
                            },
                            empresa: {
                                type: "number",
                                example: 1,
                            },
                        },
                    },
                    Categoria_Estoque: {
                        type: "object",
                        properties: {
                            nome: {
                                type: "string",
                                example: "Stock1",
                            },
                            descricao: {
                                type: "string",
                                example: "Primeira Categoria",
                            },
                            empresa: {
                                type: "number",
                                example: 1,
                            },
                            usuario_added: {
                                type: "number",
                                example: 1,
                            },
                            usuario_updated: {
                                type: "number",
                                example: 1,
                            },
                        },
                    },
                    Cliente: {
                        type: "object",
                        properties: {
                            nome: {
                                type: "string",
                                example: "Marta",
                            },
                            email: {
                                type: "string",
                                example: "marta@yahoo.com",
                            },
                            contacto1: {
                                type: "string",
                                example: "123456789",
                            },
                            contacto2: {
                                type: "string",
                                example: "123456789",
                            },
                            nuit: {
                                type: "string",
                                example: "123456789",
                            },
                            endereco: {
                                type: "string",
                                example: "Matola",
                            },
                            endereco2: {
                                type: "string",
                                example: "Maputo",
                            },
                            empresa: {
                                type: "number",
                                example: 1,
                            },
                            usuario_added: {
                                type: "number",
                                example: 1,
                            },
                            usuario_updated: {
                                type: "number",
                                example: 1,
                            },
                        },
                    },
                    Empresa: {
                        type: "object",
                        properties: {
                            nome: {
                                type: "string",
                                example: "Nzila",
                            },
                            slogan: {
                                type: "string",
                                example: "NZ",
                            },
                            nuit: {
                                type: "string",
                                example: "123456789",
                            },
                            email: {
                                type: "string",
                                example: "nzila@yahoo.com",
                            },
                            contacto1: {
                                type: "string",
                                example: "123456789",
                            },
                            contacto2: {
                                type: "string",
                                example: "821458963",
                            },
                            endereco1: {
                                type: "string",
                                example: "Maputo",
                            },
                            endereco2: {
                                type: "string",
                                example: "Matola",
                            },
                            usuario_added: {
                                type: "number",
                                example: 1,
                            },
                            usuario_updated: {
                                type: "number",
                                example: 1,
                            },
                        },
                    },
                    Entidade: {
                        type: "object",
                        properties: {
                            nome: {
                                type: "string",
                                example: "Nzila",
                            },
                            email: {
                                type: "string",
                                example: "nzila@yahoo.com",
                            },
                            contacto1: {
                                type: "string",
                                example: "123456789",
                            },
                            contacto2: {
                                type: "string",
                                example: "821458963",
                            },
                            endereco1: {
                                type: "string",
                                example: "Maputo",
                            },
                            endereco2: {
                                type: "string",
                                example: "Matola",
                            },
                            empresa: {
                                type: "number",
                                example: 1,
                            },
                            nuit: {
                                type: "string",
                                example: "123456789",
                            },
                            usuario_added: {
                                type: "number",
                                example: 1,
                            },
                            usuario_updated: {
                                type: "number",
                                example: 1,
                            },
                        },
                    },
                    Fornecedor: {
                        type: "object",
                        properties: {
                            nome: {
                                type: "string",
                                example: "Nzila",
                            },
                            email: {
                                type: "string",
                                example: "nzila@yahoo.com",
                            },
                            contacto1: {
                                type: "string",
                                example: "123456789",
                            },
                            contacto2: {
                                type: "string",
                                example: "821458963",
                            },
                            endereco1: {
                                type: "string",
                                example: "Maputo",
                            },
                            endereco2: {
                                type: "string",
                                example: "Matola",
                            },
                            empresa: {
                                type: "number",
                                example: 1,
                            },
                            nuit: {
                                type: "string",
                                example: "123456789",
                            },
                            usuario_added: {
                                type: "number",
                                example: 1,
                            },
                            usuario_updated: {
                                type: "number",
                                example: 1,
                            },
                        },
                    },
                    NaoCadastrado: {
                        type: "object",
                        properties: {
                            message: {
                                type: "string",
                                example: "Não cadastrado",
                            },
                        },
                    },
                    Permissao: {
                        type: "object",
                        properties: {
                            nome: {
                                type: "string",
                                example: "Caixas",
                            },
                            grupo: {
                                type: "number",
                                example: 2,
                            },
                            usuario_added: {
                                type: "number",
                                example: 1,
                            },
                            usuario_updated: {
                                type: "number",
                                example: 1,
                            },
                        },
                    },
                    Permissao_Grupo: {
                        type: "object",
                        properties: {
                            nome: {
                                type: "string",
                                example: "Admin",
                            },
                            usuario_added: {
                                type: "number",
                                example: 1,
                            },
                            usuario_updated: {
                                type: "number",
                                example: 1,
                            },
                        },
                    },
                    Stock: {
                        type: "object",
                        properties: {
                            nome: {
                                type: "string",
                                example: "Stock",
                            },
                            referencia: {
                                type: "string",
                                example: "stf1",
                            },
                            categoria: {
                                type: "number",
                                example: 6,
                            },
                            tipo: {
                                type: "number",
                                example: 1,
                            },
                            descricao: {
                                type: "string",
                                example: "stock",
                            },
                            empresa: {
                                type: "number",
                                example: 1,
                            },
                            usuario_added: {
                                type: "number",
                                example: 1,
                            },
                            usuario_updated: {
                                type: "number",
                                example: 1,
                            },
                        },
                    },
                    Taxa: {
                        type: "object",
                        properties: {
                            nome: {
                                type: "string",
                                example: "Taxa",
                            },
                            valor: {
                                type: "string",
                                example: "100",
                            },
                            percentual: {
                                type: "boolean",
                                example: true,
                            },
                            empresa: {
                                type: "number",
                                example: 1,
                            },
                            usuario_added: {
                                type: "number",
                                example: 1,
                            },
                            usuario_updated: {
                                type: "number",
                                example: 1,
                            },
                        },
                    },
                    Tipo_Doc: {
                        type: "object",
                        properties: {
                            nome: {
                                type: "string",
                                example: "Fatura",
                            },
                            prefixo: {
                                type: "string",
                                example: "FT",
                            },
                            categoria: {
                                type: "number",
                                example: 1,
                            },
                            descricao: {
                                type: "string",
                                example: "documentos",
                            },
                            empresa: {
                                type: "number",
                                example: 1,
                            },
                            move_estoque: {
                                type: "number",
                                example: 1,
                            },
                            move_conta_corrente: {
                                type: "number",
                                example: 1,
                            },
                            move_a_credito: {
                                type: "number",
                                example: 1,
                            },
                            requer_recibo: {
                                type: "number",
                                example: 1,
                            },
                            usuario_added: {
                                type: "number",
                                example: 1,
                            },
                            usuario_updated: {
                                type: "number",
                                example: 1,
                            },
                            removido: {
                                type: "number",
                                example: 1,
                            },
                        },
                    },
                    Cambio: {
                        type: "object",
                        properties: {
                            moeda_padrao: {
                                type: "string",
                                example: "Metical",
                            },
                            moeda_conversao: {
                                type: "string",
                                example: "Dollar",
                            },
                            preco_compra: {
                                type: "string",
                                example: "100",
                            },
                            preco_venda: {
                                type: "string",
                                example: "150",
                            },
                            usuario_added: {
                                type: "number",
                                example: 1,
                            },
                            usuario_updated: {
                                type: "number",
                                example: 1,
                            },
                        },
                    },
                },
                loginUserErr: {
                    message: "E-mail ou password incorrecto",
                },
                UserErr: {
                    message:
                        "A sua conta está desativada. Contacte o suporte técnico",
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
                    message:
                        "Registo com categoria ${categoria} não foi encontrado",
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
                    message:
                        " A moeda Padrão não pode ser igual a moeda de conversão.",
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
            },
        },
        customOptions: {},
    };
    url = options.swaggerUrl || url;
    var urls = options.swaggerUrls;
    var customOptions = options.customOptions;
    var spec1 = options.swaggerDoc;
    var swaggerOptions = {
        spec: spec1,
        url: url,
        urls: urls,
        dom_id: "#swagger-ui",
        deepLinking: true,
        presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
        plugins: [SwaggerUIBundle.plugins.DownloadUrl],
        layout: "StandaloneLayout",
    };
    for (var attrname in customOptions) {
        swaggerOptions[attrname] = customOptions[attrname];
    }
    var ui = SwaggerUIBundle(swaggerOptions);

    if (customOptions.oauth) {
        ui.initOAuth(customOptions.oauth);
    }

    if (customOptions.authAction) {
        ui.authActions.authorize(customOptions.authAction);
    }

    window.ui = ui;
};

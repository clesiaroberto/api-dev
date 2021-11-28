import knex from "../database";
import bcrypt from "bcryptjs";
import { handleResponse } from "../utils/handleResponse";
import {
    clearCookieTokens,
    COOKIE_OPTIONS,
    generateAccessToken,
    generateRefreshToken,
    getCleanUser,
    verifyAccessToken,
    verifyRefreshToken,
} from "../utils/security";

export const authenticate = async (req, res) => {
    // #swagger.tags = ['Auth']
    // #swagger.description = 'Endpoint para autenticação.'

    const { email, password } = req.body;

    /* #swagger.parameters['UserLogin'] = {
               in: 'body',
               description: 'Informações do usuário.',
               required: true,
               type: 'object',
               schema: { $ref: "#/definitions/loginUser" }
        } */

    /* #swagger.responses[400] = { 
               schema: { $ref: "#/definitions/UserEmpty" },
               description: 'E-mail e Password imcompletos!.' 
        } */

    if (!email || !password) {
        return handleResponse(
            req,
            res,
            400,
            [],
            "E-mail e Password são obrigatórios."
        );
    }

    /* #swagger.responses[401] = { 
               schema: { $ref: "#/definitions/loginUserErr" },
               description: 'E-mail ou password incorrecto!.' 
        } */

    const user = await knex("usuario").where({ email }).first();
    if (!user || !bcrypt.compareSync(password, user.password)) {
        return handleResponse(
            req,
            res,
            401,
            [],
            "Email ou Password incorreto."
        );
    }

    /* #swagger.responses[403] = { 
               schema: { $ref: "#/definitions/UserErr" },
               description: 'Conta desativada!.' 
        } */

    if (user.estado != 1) {
        return handleResponse(
            req,
            res,
            403,
            [],
            "A sua conta está desativada. Contacte o suporte técnico."
        );
    }

    const userObj = getCleanUser(user);
    const { token, xsrfToken } = generateAccessToken(user);
    const refreshToken = generateRefreshToken(userObj.userId);

    res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);
    res.cookie("XSRF-TOKEN", xsrfToken, COOKIE_OPTIONS);
    res.cookie("_token", token, COOKIE_OPTIONS);

    /* #swagger.responses[200] = { 
               schema: { $ref: "#/definitions/User" },
               description: 'Usuário Autenticado com Sucesso!.' 
        } */

    return handleResponse(req, res, 200, userObj);
};

export const refreshToken = (req, res) => {
    // #swagger.tags = ['Auth']
    // #swagger.description = 'Endpoint para aumentar o tempo da sessão.'
    const token = req.cookies.refreshToken;

    /* #swagger.responses[401] = { 
               schema: { $ref: "#/definitions/userToken" },
               description:'Refresh token expirado!.' 
        } */
    const message = "Refresh token não encontrado.";
    if (!token) {
        return handleResponse(req, res, 401, [], message);
    }
    /* #swagger.responses[401] = { 
               schema: { $ref: "#/definitions/Token" },
               description:'Refresh token expirado!.' 
        } */
    try {
        verifyRefreshToken(token, async (err, payload) => {
            if (err) {
                const message = "Refresh token expirado.";
                return handleResponse(req, res, 401, [], message);
            } else {
                const user = await knex("usuario")
                    .where({ id: payload.userId })
                    .first();
                const userObj = getCleanUser(user);
                const { token, xsrfToken } = generateAccessToken(user);
                const refreshToken = generateRefreshToken(userObj.userId);

                res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);
                res.cookie("XSRF-TOKEN", xsrfToken, COOKIE_OPTIONS);
                res.cookie("_token", token, COOKIE_OPTIONS);

                /* #swagger.responses[200] = { 
               schema: { $ref: "#/definitions/UserTokenSuccess" },
               description:'Sucesso!.' 
        } */
                return handleResponse(req, res, 200, userObj);
            }
        });
    } catch (err) {
        /* #swagger.responses[401] = { 
               schema: { $ref: "#/definitions/UnAuthorized" },
               description:'Não autorizado' 
        } */
        return handleResponse(req, res, 401, [], "Refresh token expirado.");
    }
};

export const verifyToken = (req, res) => {
    // #swagger.tags = ['Auth']
    // #swagger.description = 'Endpoint para verificar o token da sessão.'
    const token = req.cookies._token;
    const xsrfToken = req.cookies["XSRF-TOKEN"];

    if (!token || !xsrfToken) {
        /* #swagger.responses[401] = { 
               schema: { $ref: "#/definitions/UnAuthorized" },
               description:'Não autorizado' 
        } */
        return handleResponse(req, res, 401);
    }

    try {
        verifyAccessToken(token, xsrfToken, async (err, payload) => {
            /* #swagger.responses[401] = { 
               schema: { $ref: "#/definitions/UnAuthorized" },
               description:'Não autorizado' 
        } */
            if (err) return handleResponse(req, res, 401, err);
            else {
                /* #swagger.responses[200] = { 
               schema: { $ref: "#/definitions/TokenSuccess" },
               description:'Usuário autenticado!.' 
        } */
                return handleResponse(
                    req,
                    res,
                    200,
                    payload,
                    "Usuário autenticado."
                );
            }
        });
    } catch (err) {
        /* #swagger.responses[401] = { 
               schema: { $ref: "#/definitions/UnAuthorized" },
               description:'Não autorizado' 
        } */
        return handleResponse(req, res, 401, err);
    }
};

export const logout = (req, res) => {
    // #swagger.tags = ['Auth']
    // #swagger.description = 'Endpoint para terminar sessão.'
    clearCookieTokens(req, res);

    /* #swagger.responses[204] = { 
               schema: { $ref: "#/definitions/LogOut" },
               description:'Fazendo Logout!.' 
        } */
    return handleResponse(req, res, 204);
};

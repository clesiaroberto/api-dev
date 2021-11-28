import { sign, verify } from "jsonwebtoken";
import { generate } from "rand-token";

const dev = process.env.NODE_ENV !== "production";
const refreshTokenLife = process.env.REFRESH_TOKEN_LIFE || "7d";
const accessTokenLife = process.env.ACCESS_TOKEN_LIFE || "8h";
const cookieLife = process.env.COOKIE_LIFE || 3600;

// refresh token list to manage the xsrf token
const refreshTokens = {};

export const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: !dev,
    maxAge: Number(cookieLife),
};

// generate tokens and return it
export const generateAccessToken = (user) => {
    if (!user) return null;

    const u = {
        userId: user.id,
        nome: user.nome,
        empresa: user.empresa,
    };

    const xsrfToken = generate(24);
    const privateKey = process.env.JWT_SECRET + xsrfToken;

    return {
        token: sign(u, privateKey, {
            expiresIn: accessTokenLife,
        }),
        xsrfToken,
    };
};

// generate refresh token
export const generateRefreshToken = (userId) => {
    if (!userId) return null;

    return sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: refreshTokenLife,
    });
};

export const verifyAccessToken = (token, xsrfToken = "", cb) => {
    const privateKey = process.env.JWT_SECRET + xsrfToken;
    verify(token, privateKey, cb);
};

// verify access token and refresh token
export const verifyRefreshToken = (token, cb) => {
    verify(token, process.env.JWT_SECRET, cb);
};

// return basic user details
export const getCleanUser = (user) => {
    if (!user) return null;
    const image = user.imagem;
    user.imagem = `${process.env.API_ADDRESS}/static/users/${image}`;

    return {
        userId: user.id,
        nome: user.nome,
        apelido: user.apelido,
        imagem: user.imagem,
        empresaId: user.empresa,
        empresaNome: user.empresa_nome,
        isAdmin: user.empresa == 1,
    };
};

// clear tokens from cookie
export const clearCookieTokens = (req, res) => {
    const { signedCookies = {} } = req;
    const { refreshToken } = signedCookies;
    delete refreshTokens[refreshToken];
    res.clearCookie("XSRF-TOKEN");
    res.clearCookie("refreshToken");
    res.clearCookie("_token");
};

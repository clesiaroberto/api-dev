import { handleResponse } from "../utils/handleResponse";
import { verifyAccessToken } from "../utils/security";

const authorization = (req, res, next) => {
    const token = req.cookies._token;
    const xsrfToken = req.cookies["XSRF-TOKEN"];

    if (!token || !xsrfToken) {
        return handleResponse(req, res, 401);
    }

    try {
        verifyAccessToken(token, xsrfToken, async (err, payload) => {
            if (err) return handleResponse(req, res, 401);
            else {
                req.user = payload;
                req.userId = payload.userId;
                next();
            }
        });
    } catch (err) {
        return handleResponse(req, res, 401);
    }
};

export default authorization;

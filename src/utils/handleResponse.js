/**
 *  handle the API response
 * @param {*} req
 * @param {*} res
 * @param {*} statusCode
 * @param {*} data
 * @param {*} message
 * @returns
 */
const handleResponse = (req, res, statusCode, data, message) => {
    let isError = false;
    let responseMessage = message;

    switch (statusCode) {
        case 200:
        case 201:
        case 204:
            isError = false;
            responseMessage = message || "Operação efetuada com sucesso.";
            break;

        case 400:
            isError = true;
            responseMessage = message || "Dados inválidos.";
            break;

        case 409:
            isError = true;
            responseMessage = message || "Dados já existentes.";
            break;

        case 401:
            isError = true;
            responseMessage = message || "Usuário não está autenticado.";
            break;

        case 403:
            isError = true;
            responseMessage = message || "O acesso a este recurso foi negado.";
            break;

        default:
            isError = true;
            responseMessage =
                message ||
                "Ocorreu um erro interno ao tentar efectuar a operação.";
    }

    return res.status(statusCode).json({
        statusCode,
        isError,
        message: responseMessage,
        data,
    });
};

export { handleResponse };

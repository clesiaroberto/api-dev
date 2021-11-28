import { check, validationResult } from "express-validator";
import { handleResponse } from "../utils/handleResponse";

export const contaBancariaCreateValidation = [
    check("nome_banco")
        .trim()
        .escape()
        .not()
        .isEmpty()
        .withMessage("A  nome do banco é obrigatório"),
    check("numero_conta")
        .isNumeric()
        .withMessage("Numero da conta é obrigatório."),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return handleResponse(
                res,
                res,
                422,
                errors.array(),
                "Dados inválidos."
            );
        }
        next();
    },
];

export const contaBancariaUpdateValidation = [
    check("nome_banco")
        .trim()
        .escape()
        .not()
        .isEmpty()
        .withMessage("A  nome do banco é obrigatório"),
    check("numero_conta")
        .isNumeric()
        .withMessage("Numero da conta é obrigatório."),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return handleResponse(
                res,
                res,
                422,
                errors.array(),
                "Dados inválidos."
            );
        }
        next();
    },
];

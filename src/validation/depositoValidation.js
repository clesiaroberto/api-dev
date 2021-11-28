import { check, validationResult } from "express-validator";
import { handleResponse } from "../utils/handleResponse";

export const CreateValidation = [
    check("conta_bancaria")
        .trim()
        .escape()
        .not()
        .isEmpty()
        .withMessage("A Conta Bancaria é obrigatória")
        .bail(),
    check("valor")
        .trim()
        .escape()
        .not()
        .isEmpty()
        .withMessage("O Valor  é obrigatório")
        .bail(),
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

export const UpdateValidation = [
    check("conta_bancaria")
        .trim()
        .escape()
        .not()
        .isEmpty()
        .withMessage("A Conta Bancaria é obrigatória")
        .bail(),
    check("valor")
        .trim()
        .escape()
        .not()
        .isEmpty()
        .withMessage("O Valor  é obrigatório")
        .bail(),
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

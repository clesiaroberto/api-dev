import { check, validationResult } from "express-validator";
import { handleResponse } from "../utils/handleResponse";

export const createValidation = [
    check("cliente")
        .trim()
        .escape()
        .not()
        .isEmpty()
        .withMessage("O Campo Cliente é obrigatório")
        .bail(),
    check("conta_bancaria")
        .trim()
        .escape()
        .not()
        .isEmpty()
        .withMessage("O Campo conta bancaria é obrigatório")
        .bail(),
    check("metodo_pagamento")
        .trim()
        .escape()
        .not()
        .isEmpty()
        .withMessage("O Campo método pagamento é obrigatório")
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

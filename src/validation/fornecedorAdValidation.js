import { check, validationResult } from "express-validator";
import { handleResponse } from "../utils/handleResponse";

export const createValidation = [
    check("fornecedor")
        .trim()
        .escape()
        .not()
        .isEmpty()
        .withMessage("O Campo Fornecedor é obrigatório")
        .bail(),
    check("descricao")
        .trim()
        .escape()
        .not()
        .isEmpty()
        .withMessage("O Campo descricao é obrigatório")
        .bail(),
    check("valor")
        .trim()
        .escape()
        .not()
        .isEmpty()
        .withMessage("O Campo valor é obrigatório")
        .bail(),
    check("metodo_pagamento")
        .trim()
        .escape()
        .not()
        .isEmpty()
        .withMessage("O Campo valor é obrigatório")
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

export const updateValidation = [
    check("fornecedor")
        .trim()
        .escape()
        .not()
        .isEmpty()
        .withMessage("O Campo Fornecedor é obrigatório")
        .bail(),
    check("descricao")
        .trim()
        .escape()
        .not()
        .isEmpty()
        .withMessage("O Campo descricao é obrigatório")
        .bail(),
    check("valor")
        .trim()
        .escape()
        .not()
        .isEmpty()
        .withMessage("O Campo valor é obrigatório")
        .bail(),
    check("metodo_pagamento")
        .trim()
        .escape()
        .not()
        .isEmpty()
        .withMessage("O Campo valor é obrigatório")
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

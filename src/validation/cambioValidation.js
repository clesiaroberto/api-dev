import { check, validationResult } from "express-validator";
import { handleResponse } from "../utils/handleResponse";

export const cambioCreateValidation = [
    check("moeda_padrao")
        .trim()
        .escape()
        .not()
        .isEmpty()
        .withMessage("A moeda Padrão é obrigatória")
        .isNumeric()
        .withMessage("Preencha o campo apenas com números"),
    check("moeda_conversao")
        .trim()
        .escape()
        .not()
        .isEmpty()
        .withMessage("A moeda de Conversão é obrigatória")
        .isNumeric()
        .withMessage("Preencha o campo apenas com números"),
    check("preco_compra")
        .trim()
        .escape()
        .not()
        .isEmpty()
        .withMessage("O preço de compra é obrigatório")
        .isNumeric()
        .withMessage("Preencha o campo apenas com números"),
    check("preco_venda")
        .trim()
        .escape()
        .not()
        .isEmpty()
        .withMessage("O preço de venda é obrigatório")
        .isNumeric()
        .withMessage("Preencha o campo apenas com números"),
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

export const cambioUpdateValidation = [
    check("moeda_padrao")
        .trim()
        .escape()
        .not()
        .isEmpty()
        .withMessage("A moeda Padrão é obrigatória")
        .isNumeric()
        .withMessage("Preencha o campo apenas com números"),
    check("moeda_conversao")
        .trim()
        .escape()
        .not()
        .isEmpty()
        .withMessage("A moeda de Conversão é obrigatória")
        .isNumeric()
        .withMessage("Preencha o campo apenas com números"),
    check("preco_compra")
        .trim()
        .escape()
        .not()
        .isEmpty()
        .withMessage("O preço de compra é obrigatório")
        .isNumeric()
        .withMessage("Preencha o campo apenas com números"),
    check("preco_venda")
        .trim()
        .escape()
        .not()
        .isEmpty()
        .withMessage("O preço de venda é obrigatório")
        .isNumeric()
        .withMessage("Preencha o campo apenas com números"),
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

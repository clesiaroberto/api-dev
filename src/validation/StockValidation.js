import { check, validationResult } from "express-validator";
import { handleResponse } from "../utils/handleResponse";

export const estoqueCreateValidation = [
    check("referencia")
        .trim()
        .escape()
        .not()
        .isEmpty()
        .withMessage("A referência é obrigatória"),
    check("categoria").isNumeric().withMessage("Categoria inválida"),
    check("tipo").isNumeric().withMessage("Tipo de stock inválido"),
    check("taxa").isNumeric().withMessage("Taxa inválida"),
    check("preco_compra")
        .notEmpty()
        .withMessage("Preço de compra é obrigatório"),
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

export const estoqueUpdateValidation = [
    check("referencia")
        .trim()
        .escape()
        .not()
        .isEmpty()
        .withMessage("A referência é obrigatória"),
    check("categoria").isNumeric().withMessage("Categoria inválida"),
    check("tipo").isNumeric().withMessage("Tipo de stock inválido"),
    check("taxa").isNumeric().withMessage("Taxa inválida"),
    check("preco_compra")
        .notEmpty()
        .withMessage("Preço de compra é obrigatório"),
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

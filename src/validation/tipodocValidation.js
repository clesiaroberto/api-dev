import { check, validationResult } from "express-validator";
import { handleResponse } from "../utils/handleResponse";

export const createValidation = [
    check("nome")
        .trim()
        .escape()
        .not()
        .isEmpty()
        .withMessage("O nome é obrigatório")
        .bail()
        .isLength({ min: 3 })
        .withMessage("O nome precisa ter pelo menos 3 caracteres.")
        .bail(),
    check("prefixo")
        .trim()
        .escape()
        .not()
        .isEmpty()
        .withMessage("O Prefixo é obrigatório.")
        .isString()
        .withMessage("O Prefixo não pode ser um número."),
    check("categoria").isNumeric().withMessage("Categoria invalida"),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return handleResponse(
                res,
                res,
                422,
                errors.array(),
                "Os campos estão incompletos"
            );
        }
        next();
    },
];

export const updateValidation = [
    check("nome")
        .trim()
        .escape()
        .not()
        .isEmpty()
        .withMessage("O nome é obrigatório")
        .bail()
        .isLength({ min: 3 })
        .withMessage("O nome precisa ter pelo menos 3 caracteres.")
        .bail(),
    check("prefixo")
        .trim()
        .escape()
        .not()
        .isEmpty()
        .withMessage("O Prefixo é obrigatório.")
        .isString()
        .withMessage("O Prefixo não pode ser um número."),
    check("categoria").isNumeric().withMessage("Categoria invalida"),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return handleResponse(
                res,
                res,
                422,
                errors.array(),
                "O campo está vazio"
            );
        }
        next();
    },
];

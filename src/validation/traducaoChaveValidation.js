import { check, validationResult } from "express-validator";
import { handleResponse } from "../utils/handleResponse";

export const createValidation = [
    check("chave")
        .trim()
        .escape()
        .not()
        .isEmpty()
        .withMessage("A Chave é obrigatória")
        .bail(),
    check("comentario")
        .trim()
        .escape()
        .not()
        .isEmpty()
        .withMessage("O Comentário é obrigatório")
        .bail(),
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
    check("chave")
        .trim()
        .escape()
        .not()
        .isEmpty()
        .withMessage("A Chave é obrigatória")
        .bail(),
    check("comentario")
        .trim()
        .escape()
        .not()
        .isEmpty()
        .withMessage("O Comentário é obrigatório")
        .bail(),
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

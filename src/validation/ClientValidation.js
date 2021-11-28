import { check, validationResult } from "express-validator";
import { handleResponse } from "../utils/handleResponse";

export const clientCreateValidation = [
    check("nome")
        .trim()
        .escape()
        .not()
        .isEmpty()
        .withMessage("O nome é obrigatório")
        .bail()
        .isLength({ min: 3 })
        .withMessage("O nome precisa ter pelo menos 3 caracteres")
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

export const clientUpdateValidation = [
    check("nome")
        .trim()
        .escape()
        .not()
        .isEmpty()
        .withMessage("O nome é obrigatório")
        .bail()
        .isLength({ min: 3 })
        .withMessage("O nome precisa ter pelo menos 3 caracteres")
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

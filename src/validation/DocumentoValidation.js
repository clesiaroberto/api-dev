import { check, validationResult } from "express-validator";
import { handleResponse } from "../utils/handleResponse";

export const documentoCreateValidation = [
    check("tipo_doc")
        .isNumeric()
        .withMessage("O tipo de documento é obrigatório."),
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

export const documentoUpdateValidation = [
    check("tipo_doc")
        .isNumeric()
        .withMessage("O tipo de documento é obrigatório."),
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

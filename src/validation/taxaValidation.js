import { check, validationResult } from "express-validator";
import { handleResponse } from "../utils/handleResponse";

export const createTaxaValidation = [
    check("nome")
        .trim()
        .escape()
        .not()
        .isEmpty()
        .withMessage("O nome da taxa é obrigatório")
        .bail()
        .isLength({ min: 3 })
        .withMessage("O nome precisa ter pelo menos 3 caracteres"),
    check("valor").isNumeric().withMessage("O Valor introduzido é inválido"),
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

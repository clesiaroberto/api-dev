import { check, validationResult } from "express-validator";
import { handleResponse } from "../utils/handleResponse";

export const empresaCreateValidation = [
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
    check("slogan").isString().withMessage("O slogan é inválido"),
    check("email")
        .trim()
        .normalizeEmail()
        .isEmail()
        .withMessage("Endereço de E-mail inválido"),
    check("contacto1")
        .trim()
        .isLength({ min: 9 })
        .withMessage("O contacto deve ter pelo menos 9 caracteres"),
    check("nuit")
        .trim()
        .isLength({ min: 9, max: 9 })
        .withMessage("O nuit deve ter 9 caracteres"),
    check("pacote").isNumeric().withMessage("O pacote é obrigatório."),
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

export const empresaUpdateValidation = [
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
    check("slogan").isString().withMessage("O slogan é inválido"),
    check("email")
        .trim()
        .normalizeEmail()
        .isEmail()
        .withMessage("Endereço de E-mail inválido"),
    check("contacto1")
        .trim()
        .isLength({ min: 9 })
        .withMessage("O contacto deve ter pelo menos 9 caracteres"),
    check("pacote").isNumeric().withMessage("O pacote é obrigatório."),
    check("nuit")
        .trim()
        .isLength({ min: 9, max: 9 })
        .withMessage("O nuit deve ter 9 caracteres."),
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

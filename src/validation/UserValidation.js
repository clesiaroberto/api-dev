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
        .withMessage("O nome precisa ter pelo menos 3 caracteres")
        .bail(),
    check("apelido")
        .trim()
        .escape()
        .not()
        .isEmpty()
        .withMessage("O apelido é obrigatório")
        .bail()
        .isLength({ min: 3 })
        .withMessage("O apelido precisa ter pelo menos 3 caracteres")
        .bail(),
    check("email")
        .trim()
        .normalizeEmail()
        .isEmail()
        .withMessage("Endereço de E-mail inválido"),
    check("contacto1")
        .trim()
        .isLength({ min: 9 })
        .withMessage("O contacto deve ter 9 caracteres"),
    check("password")
        .trim()
        .isLength({ min: 8 })
        .withMessage("A senha deve ter pelo menos 8 caracteres"),
    check("empresa")
        .isNumeric()
        .not()
        .isEmpty()
        .withMessage("Código da empresa inválido"),
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
    check("apelido")
        .trim()
        .escape()
        .not()
        .isEmpty()
        .withMessage("O apelido é obrigatório")
        .bail()
        .isLength({ min: 3 })
        .withMessage("O apelido precisa ter pelo menos 3 caracteres")
        .bail(),
    check("email")
        .trim()
        .normalizeEmail()
        .isEmail()
        .withMessage("Endereço de E-mail inválido"),
    check("contacto1")
        .trim()
        .isLength({ min: 9 })
        .withMessage("O contacto deve ter 9 caracteres"),
    check("empresa").isNumeric().withMessage("Código da empresa inválido"),
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

export const createPermissionValidation = [
    check("userId").isNumeric().withMessage("Usuário inválido"),
    check("permissionId").isNumeric().withMessage("Permissão inválida"),
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

export const updatePasswordValidation = [
    check("senha_actual")
        .trim()
        .escape()
        .not()
        .isEmpty()
        .withMessage("A senha atual é obrigatória"),
    check("nova_senha")
        .trim()
        .escape()
        .not()
        .isEmpty()
        .withMessage("A nova senha é obrigatória"),
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

import { check, validationResult } from "express-validator";
import { handleResponse } from "../utils/handleResponse";

export const createValidation = [
    check("tipo_doc")
        .trim()
        .escape()
        .not()
        .isEmpty()
        .withMessage("O ID do tipo de documento é obrigatório")
        .isNumeric()
        .withMessage("O valor introduzido é inválido")
        .bail(),
    check("move_stock")
        .trim()
        .escape()
        .not()
        .isEmpty()
        .withMessage("O campo move stock é obrigatório")
        .isNumeric()
        .withMessage("O valor introduzido é inválido")
        .bail(),
    check("move_conta_corrente")
        .trim()
        .escape()
        .not()
        .isEmpty()
        .withMessage("O campo move conta corrente é obrigatório")
        .isNumeric()
        .withMessage("O valor introduzido é inválido")
        .bail(),
    check("move_a_credito")
        .trim()
        .escape()
        .not()
        .isEmpty()
        .withMessage("O campo move a credito é obrigatório")
        .isNumeric()
        .withMessage("O valor introduzido é inválido")
        .bail(),
    check("requer_recibo")
        .trim()
        .escape()
        .not()
        .isEmpty()
        .withMessage("O campo requer recibo é obrigatório")
        .isNumeric()
        .withMessage("O valor introduzido é inválido")
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
    check("removido").isNumeric().withMessage("Estado invalido"),

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

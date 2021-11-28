import { check, validationResult } from "express-validator";
import { handleResponse } from "../utils/handleResponse";

export const createValidation = [
  check("lingua")
    .trim()
    .escape()
    .not()
    .isEmpty()
    .withMessage("A Língua é obrigatória")
    .isNumeric()
    .withMessage("Formato inválido para o campo Língua")
    .bail(),
  check("traducao_chave")
  .trim()
  .escape()
  .not()
  .isEmpty()
  .withMessage("A Língua é obrigatória")
  .isNumeric()
  .withMessage("Formato inválido para o campo traducao_chave")
  .bail(),
  check("traducao")
  .trim()
  .escape()
  .not()
  .isEmpty()
  .withMessage("A Tradução é obrigatória")
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
  check("lingua")
    .trim()
    .escape()
    .not()
    .isEmpty()
    .withMessage("A Língua é obrigatória")
    .isNumeric()
    .withMessage("Formato inválido para o campo Língua")
    .bail(),
    check("traducao_chave")
    .trim()
    .escape()
    .not()
    .isEmpty()
    .withMessage("A Língua é obrigatória")
    .isNumeric()
    .withMessage("Formato inválido para o campo traducao_chave")
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

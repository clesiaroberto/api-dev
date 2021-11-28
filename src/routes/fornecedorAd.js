import { Router } from "express";

import {
    create,
    all,
    findById,
    update,
    remove,
    getLastInsertedFornecedor,
    findByAdiantamento,
} from "../controller/reciboAdFornecedorController";
import {
    createValidation,
    updateValidation,
} from "../validation/fornecedorAdValidation";

export const router = Router();

router.post("/fornecedor-adiantamento", createValidation, create);
router.put("/fornecedor-adiantamento/:id", updateValidation, update);
router.delete("/fornecedor-adiantamento/:id", remove);
router.get("/fornecedor-adiantamento", all);
router.get("/fornecedor-adiantamento/:id", findById);
router.get("/fornecedores-adiantamento/:fornecedor", findByAdiantamento);
router.get(
    "/fornecedores-adiantamento/last-inserted",
    getLastInsertedFornecedor
);

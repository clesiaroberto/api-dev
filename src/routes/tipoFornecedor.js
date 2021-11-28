import { Router } from "express";

import {
    getAll,
    updateTipoFornecedor,
    add,
    getById,
    deleteTipoFornecedor,
    getLastInsertedId,
} from "../controller/tipoFornecedorController";
import {
    CreateValidation,
    UpdateValidation,
} from "../validation/tipoClienteValidation";

export const router = Router();

router.post("/tipo-fornecedor", CreateValidation, add);
router.put("/tipo-fornecedor/:id", UpdateValidation, updateTipoFornecedor);
router.delete("/tipo-fornecedor/:id", deleteTipoFornecedor);
router.get("/tipo-fornecedor", getAll);
router.get("/tipo-fornecedor/:id", getById);
router.get("/tipos-fornecedores/last-inserted", getLastInsertedId);

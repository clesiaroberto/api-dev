import { Router } from "express";

import {
    getAll,
    updateTipoEntidade,
    add,
    getById,
    deleteTipoEntidade,
    getLastInsertedId,
} from "../controller/tipoEntidadeController";
import {
    CreateValidation,
    UpdateValidation,
} from "../validation/tipoClienteValidation";

export const router = Router();

router.post("/tipo-entidade", CreateValidation, add);
router.put("/tipo-entidade/:id", UpdateValidation, updateTipoEntidade);
router.delete("/tipo-entidade/:id", deleteTipoEntidade);
router.get("/tipo-entidade", getAll);
router.get("/tipo-entidade/:id", getById);
router.get("/tipos-entidades/last-inserted", getLastInsertedId);

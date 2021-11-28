import { Router } from "express";

import {
    getAll,
    updateTipoCliente,
    add,
    getById,
    deleteTipoCliente,
    getLastInsertedId,
} from "../controller/tipoClienteController";
import {
    CreateValidation,
    UpdateValidation,
} from "../validation/tipoClienteValidation";

export const router = Router();

router.post("/tipo-cliente", CreateValidation, add);
router.put("/tipo-cliente/:id", UpdateValidation, updateTipoCliente);
router.delete("/tipo-cliente/:id", deleteTipoCliente);
router.get("/tipo-cliente", getAll);
router.get("/tipo-cliente/:id", getById);
router.get("/tipos-cliente/last-inserted", getLastInsertedId);

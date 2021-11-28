import { Router } from "express";

import {
    add,
    updateTransferencia,
    getAll,
    deleteTransferencia,
    getById,
    getLastInsertedId,
} from "../controller/transferenciaController";
import {
    CreateValidation,
    UpdateValidation,
} from "../validation/transferenciaValidation";

export const router = Router();

router.post("/transferencias", CreateValidation, add);
router.put("/transferencias/:id", UpdateValidation, updateTransferencia);
router.get("/transferencias", getAll);
router.get("/transferencias/:id", getById);
router.delete("/transferencias/:id", deleteTransferencia);
router.delete("/transferencia/last-inserted", getLastInsertedId);

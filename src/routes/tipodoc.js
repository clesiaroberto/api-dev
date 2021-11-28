import { Router } from "express";

import {
    addTipoDoc,
    updateTipoDoc,
    getAll,
    getById,
    deleteTipoDoc,
    getByCategoriaId,
} from "../controller/TipoDocController";
import {
    createValidation,
    updateValidation,
} from "../validation/tipodocValidation";

export const router = Router();

router.post("/tipo-doc", createValidation, addTipoDoc);
router.put("/tipo-doc/:id", updateValidation, updateTipoDoc);
router.delete("/tipo-doc/:id", deleteTipoDoc);
router.get("/tipo-doc", getAll);
router.get("/tipo-doc/:id", getById);
router.get("/tipo-doc/categoria/:categoria", getByCategoriaId);

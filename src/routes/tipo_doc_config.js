import { Router } from "express";
import {
    create,
    updateTipoDoc_config,
    deleteTipoDoc_config,
    getAll,
    getById,
} from "../controller/TipoDocConfigController";
import { createValidation } from "../validation/tipo-doc-configValidation";

export const router = Router();

router.post("/tipo-doc-config", createValidation, create);
router.put("/tipo-doc-config/:id", updateTipoDoc_config);
router.delete("/tipo-doc-config/:id", deleteTipoDoc_config);
router.get("/tipo-doc-config", getAll);
router.get("/tipo-doc-config/:id", getById);

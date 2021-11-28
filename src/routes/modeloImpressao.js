import { Router } from "express";

import {
    add,
    update,
    getAll,
    getById,
    deleteModelo,
    getLastInsertedModeloImpressao,
} from "../controller/modeloImpressaoController";
import {
    createValidation,
    updateValidation,
} from "../validation/modeIoImpressaoValidate";

export const router = Router();

router.post("/modelo-impressao", createValidation, add);
router.put("/modelo-impressao/:id", updateValidation, update);
router.delete("/modelo-impressao/:id", deleteModelo);
router.get("/modelo-impressao", getAll);
router.get("/modelo-impressao/:id", getById);
router.get("/modelos-impressao/last-inserted", getLastInsertedModeloImpressao);

import { Router } from "express";
import {
    add,
    updateDespesa,
    getById,
    deleteDespesa,
    getLastInsertedId,
    getAll,
} from "../controller/despesaController";

export const router = Router();

router.post("/despesa", add);
router.put("/despesa/:id", updateDespesa);
router.get("/despesa/:id", getById);
router.get("/despesa", getAll);
router.delete("/despesa/:id", deleteDespesa);
router.get("/despesas/last-inserted", getLastInsertedId);

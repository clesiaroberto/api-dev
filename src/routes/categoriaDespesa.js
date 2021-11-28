import { Router } from "express";
import {
    add,
    updateCategoriaDespesa,
    getById,
    deletecategoriaDespesa,
    getLastInsertedId,
    getAll,
} from "../controller/categoriaDespesaController";

export const router = Router();

router.post("/categoria-despesa", add);
router.put("/categoria-despesa/:id", updateCategoriaDespesa);
router.get("/categoria-despesa/:id", getById);
router.get("/categoria-despesa", getAll);
router.delete("/categoria-despesa/:id", deletecategoriaDespesa);
router.get("/categoria-despesas/last-inserted", getLastInsertedId);

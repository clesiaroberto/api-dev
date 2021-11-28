import { Router } from "express";
import {
    addTaxa,
    getAll,
    getById,
    deleteTaxa,
    updateTaxa,
    getLastInsertedTaxa,
} from "../controller/taxaController";
import { createTaxaValidation } from "../validation/taxaValidation";

export const router = Router();

router.post("/taxas", createTaxaValidation, addTaxa);
router.get("/taxas", getAll);
router.get("/taxas/:id", getById);
router.delete("/taxas/:id", deleteTaxa);
router.put("/taxas/:id", updateTaxa);
router.get("/Taxa/last-inserted", getLastInsertedTaxa);

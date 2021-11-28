import { Router } from "express";

import {
    add,
    updateDeposito,
    getAll,
    deleteDeposito,
    getById,
    getLastInsertedId,
} from "../controller/depositoController";
import {
    CreateValidation,
    UpdateValidation,
} from "../validation/depositoValidation";

export const router = Router();

router.post("/depositos", CreateValidation, add);
router.put("/depositos/:id", UpdateValidation, updateDeposito);
router.get("/depositos", getAll);
router.get("/depositos/:id", getById);
router.delete("/depositos/:id", deleteDeposito);
router.delete("/deposito/last-inserted", getLastInsertedId);

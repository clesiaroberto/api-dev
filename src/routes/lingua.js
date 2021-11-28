import { Router } from "express";
import {
    all,
    create,
    findById,
    remove,
    update,
    getLastInsertedLingua,
} from "../controller/linguaController";
import {
    createValidation,
    updateValidation,
} from "../validation/linguaValidation";

export const router = Router();

router.get("/lingua", all);
router.post("/lingua", createValidation, create);
router.get("/lingua/:id", findById);
router.put("/lingua/:id", updateValidation, update);
router.delete("/lingua/:id", remove);
router.get("/linguas/last-inserted", getLastInsertedLingua);

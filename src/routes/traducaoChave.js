import { Router } from "express";
import {
    all,
    create,
    findById,
    remove,
    update,
} from "../controller/traducaoChaveController";
import {
    createValidation,
    updateValidation,
} from "../validation/traducaoChaveValidation";

export const router = Router();

router.get("/traducao-chave", all);
router.post("/traducao-chave", createValidation, create);
router.get("/traducao-chave/:id", findById);
router.put("/traducao-chave/:id", updateValidation, update);
router.delete("/traducao-chave/:id", remove);

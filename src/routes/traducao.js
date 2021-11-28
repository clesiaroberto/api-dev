import { Router } from "express";
import {
    all,
    create,
    createUpdateList,
    findById,
    remove,
    update,
} from "../controller/traducaoController";
import {
    createValidation,
    updateValidation,
} from "../validation/traducaoValidation";

export const router = Router();

router.get("/traducao", all);
router.post("/traducao", createValidation, create);
router.post("/traducoes", createUpdateList);
router.put("/traducoes", createUpdateList);
router.get("/traducao/:id", findById);
router.put("/traducao/:id", updateValidation, update);
router.delete("/traducao/:id", remove);

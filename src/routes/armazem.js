import { Router } from "express";

import {
    add,
    update,
    getAll,
    getById,
    deleteArmazem,
    getLastInsertedArmazem,
} from "../controller/armazemController";
import {
    CreateValidation,
    UpdateValidation,
} from "../validation/armazemValidation";

export const router = Router();

router.post("/armazem", CreateValidation, add);
router.put("/armazem/:id", UpdateValidation, update);
router.delete("/armazem/:id", deleteArmazem);
router.get("/armazem", getAll);
router.get("/armazem/:id", getById);
router.get("/armazens/last-inserted", getLastInsertedArmazem);

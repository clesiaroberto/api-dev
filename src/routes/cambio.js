import { Router } from "express";
import {
    create,
    findById,
    update,
    remove,
    findAll,
    getLastInsertedCambio,
} from "../controller/cambioController";
import {
    cambioCreateValidation,
    cambioUpdateValidation,
} from "../validation/cambioValidation";

export const router = Router();

router.get("/cambio", findAll);
router.get("/cambio/:id", findById);
router.post("/cambio", cambioCreateValidation, create);
router.put("/cambio/:id", cambioUpdateValidation, update);
router.delete("/cambio/:id", remove);
router.get("/cambios/last-inserted", getLastInsertedCambio);

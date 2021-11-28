import { Router } from "express";

import {
    all,
    update,
    create,
    findById,
    remove,
    getLastInsertedRecibo,
    findByCliente,
} from "../controller/reciboController";
import { createValidation } from "../validation/ReciboValidation";

export const router = Router();

router.post("/recibo", createValidation, create);
router.put("/recibo/:id", update);
router.delete("/recibo/:id", remove);
router.get("/recibo", all);
router.get("/recibo/:id", findById);
router.get("/recibos/:cliente", findByCliente);
router.get("/recibos/last-inserted", getLastInsertedRecibo);

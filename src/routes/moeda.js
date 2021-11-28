import { Router } from "express";
import {
    all,
    findById,
    getLastInsertedMoeda,
} from "../controller/MoedaController";

export const router = Router();

router.get("/moedas", all);
router.get("/moedas/:id", findById);
router.get("/moeda/last-inserted", getLastInsertedMoeda);

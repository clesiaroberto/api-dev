import { Router } from "express";
import {
    all,
    findOne,
    getLastInsertedMoeda,
} from "../controller/MoedaCambioPadraoController";

export const router = Router();

router.get("/moedas-cambio", all);
router.get(`/moedas-cambio/:moeda`, findOne);


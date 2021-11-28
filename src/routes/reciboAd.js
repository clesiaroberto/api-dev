import { Router } from "express";

import {
    add,
    updatereciboAd,
    getAll,
    getById,
    deleteReciboAd,
    metotoPagamentoAll,
    metodoPagamentoId,
    getLastInsertedReciboAd,
    getByCliente,
} from "../controller/reciboAdController";

export const router = Router();

router.post("/recibo-adiantamento", add);
router.put("/recibo-adiantamento/:id", updatereciboAd);
router.delete("/recibo-adiantamento/:id", deleteReciboAd);
router.get("/recibo-adiantamento", getAll);
router.get("/recibo-adiantamento/:id", getById);
router.get("/recibos-adiantamento/:cliente", getByCliente);
router.get("/metodo-pagamento", metotoPagamentoAll);
router.get("/metodo-pagamento/:id", metodoPagamentoId);
router.get("/recibos-ad/last-inserted", getLastInsertedReciboAd);

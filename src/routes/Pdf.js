import { Router } from "express";
import {
    getAdiantamentoFornecedor,
    getDocumento,
    getPagamentoFornecedor,
    getRecibo,
    getReciboAdiantamento,
} from "../controller/pdfController";

export const router = Router();

router.post("/documento-print/:id", getDocumento);
router.post("/recibo-print/:id", getRecibo);
router.post("/recibo-adiantamento-print/:id", getReciboAdiantamento);
router.post("/pagamento-fornecedor-print/:id", getPagamentoFornecedor);
router.post("/adiantamento-fornecedor-print/:id", getAdiantamentoFornecedor);

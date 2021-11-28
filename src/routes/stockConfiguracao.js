import { Router } from "express";
import {
    configuracoesPorId,
    configuracoesStock,
    createReferenciaAutomatica,
    referenciaAutomatica,
    removeConfiguracao,
    updateReferenciaAutomatica,
} from "../controller/StockConfiguracao";

export const router = Router();

router.get("/stock-configuracoes", configuracoesStock);
router.get("/stock-configuracoes/one", referenciaAutomatica);
router.get("/stock-configuracoes/one/:id", configuracoesPorId);
router.post("/stock-configuracoes", createReferenciaAutomatica);
router.put("/stock-configuracoes/:id", updateReferenciaAutomatica);
router.delete("/stock-configuracoes/:id", removeConfiguracao);

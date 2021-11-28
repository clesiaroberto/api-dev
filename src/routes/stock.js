import { Router } from "express";
import {
    all,
    create,
    findById,
    remove,
    update,
    excelStock,
    transacoes,
    estados,
    gerarReferenciaAutomatica,
    findByArmazem,
} from "../controller/StockController";
import {
    estoqueCreateValidation,
    estoqueUpdateValidation,
} from "../validation/StockValidation";

export const router = Router();

router.get("/stock", all);
router.post("/stock", estoqueCreateValidation, create);
router.get("/stock/:id", findById);
router.get("/stock-excel", excelStock);
router.delete("/stock/:id", remove);
router.put("/stock/:id", estoqueUpdateValidation, update);
router.get("/stock/:id/transacoes", transacoes);
router.get("/stock/:id/estados", estados);
router.get("/referencia-stock/gerar-referencia", gerarReferenciaAutomatica);
router.get("/estado-stock/:armazem", findByArmazem);

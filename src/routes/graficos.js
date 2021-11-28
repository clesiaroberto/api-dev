import { Router } from "express";
import {
    vendas,
    compras,
    cliente,
    fornecedor
} from "../controller/GraficoController";

export const router = Router();

router.get("/grafico/vendas", vendas);
router.get("/grafico/compras", compras);
router.get("/grafico/cliente", cliente);
router.get("/grafico/fornecedor", fornecedor);
import { Router } from "express";
import {
    relaorioStock,
    relaorioStockById,
    relaorioExtratoClienteByDate,
    relaorioExtratoCliente,
    relaorioExtratoFornecedor,
    relaorioExtratoFornecedorByDate,
    transacoesById,
    transacoesByDate
} from "../controller/ExcelController";

export const router = Router();

router.get("/excel/relatorio/stock", relaorioStock);
router.get("/excel/relatorio/stock/:id", relaorioStockById);

router.get("/excel/relatorio/extrato/cliente/:id", relaorioExtratoCliente);
router.get("/excel/relatorio/extrato/cliente/:firstdate/:seconddate/:id", relaorioExtratoClienteByDate);

router.get("/excel/relatorios-print/fornecedores/extratos/:id", relaorioExtratoFornecedor);
router.get("/excel/relatorios-print/fornecedores/extratos/:firstdate/:seconddate/:id", relaorioExtratoFornecedorByDate);

router.get("/excel/conta-bancaria/transacoes/:id", transacoesById);
router.get("/excel/conta-bancaria/transacoes/:firstdate/:seconddate/:id", transacoesByDate);

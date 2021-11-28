import { Router } from "express";
import {
    getClientesPendentes,
    getExtratoClienteById,
    getExtratoFornecedorById,
    getFornecedoresPendentes,
    getPendentesClienteById,
    getPendentesFornecedorById,
    getRelatorioStock,
    getRelatorioStockId,
    getRelatorioDespesas,
    getMovimentoStock,
    getExtratoClienteByDate,
    getExtratoFornecedorByDate
} from "../controller/RelatorioPrintController";

export const router = Router();

router.get("/relatorios-print/clientes/pendentes", getClientesPendentes);
router.get("/relatorios-print/clientes/pendentes/:id", getPendentesClienteById);
router.get("/relatorios-print/clientes/extratos/:id", getExtratoClienteById);
router.get(
    "/relatorios-print/fornecedores/pendentes",
    getFornecedoresPendentes
);
router.get(
    "/relatorios-print/fornecedores/pendentes/:id",
    getPendentesFornecedorById
);
router.get(
    "/relatorios-print/fornecedores/extratos/:id",
    getExtratoFornecedorById
);

//print relatorio stock
router.get("/relatorios-print/stock", getRelatorioStock);
router.get("/relatorios-print/stock/:id", getRelatorioStockId);
router.get("/relatorios-print/despesas/:ano", getRelatorioDespesas);

router.post("/relatorios-print/movimentos-stock/:id", getMovimentoStock);

router.get("/relatorios-print/clientes/extratos/:firstdate/:seconddate/:id", getExtratoClienteByDate);
router.get("/relatorios-print/fornecedores/extratos/:firstdate/:seconddate/:id", getExtratoFornecedorByDate);
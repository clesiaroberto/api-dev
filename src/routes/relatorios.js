import { Router } from "express";
import {
    getClientePendentesById,
    getFornecedorExtratoID,
    getFornecedorPendentesById,
    getPendenteClientes,
    getPendenteFornecedores,
    getRelatorioStock,
    getRelatorioStockByArmazem,
    getRelatorioDespesas
} from "../controller/RelatorioController";

export const router = Router();

router.get("/relatorios/clientes/pendentes", getPendenteClientes);
router.get("/relatorios/clientes/pendentes/:id", getClientePendentesById);
router.get("/relatorios/fornecedores/pendentes", getPendenteFornecedores);
router.get(
    "/relatorios/fornecedores/pendentes/:id",
    getFornecedorPendentesById
);
router.get("/relatorios/fornecedores/extratos/:id", getFornecedorExtratoID);
//stock relatorios
router.get('/relatorios/stock', getRelatorioStock);
router.get('/relatorios/stock/:id', getRelatorioStockByArmazem);
router.get("/relatorios/despesas/:ano", getRelatorioDespesas);

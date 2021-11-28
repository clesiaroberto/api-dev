import { Router } from "express";

import {
    addCliente,
    updateCliente,
    getCliente,
    deleteCliente,
    getClientebyId,
    excelCliente,
    getLastInsertedId,
    getTipoDoc,
    getClienteExtratoID,
    clienteTemDocumentoAssociado,
} from "../controller/clienteController";
import {
    clientCreateValidation,
    clientUpdateValidation,
} from "../validation/ClientValidation";

export const router = Router();

router.post("/clientes", clientCreateValidation, addCliente);
router.put("/clientes/:id", clientUpdateValidation, updateCliente);
router.get("/clientes", getCliente);
router.get("/clientes/:id", getClientebyId);
router.delete("/clientes/:id", deleteCliente);
router.get("/clientesExcel", excelCliente);
router.get("/cliente-extrato/:cliente", getClienteExtratoID);
router.get("/cliente/last-inserted", getLastInsertedId);
router.get("/documentos-cliente/:cliente/:tipo_doc", getTipoDoc);
router.get("/clientes/:id/documento-existe", clienteTemDocumentoAssociado);

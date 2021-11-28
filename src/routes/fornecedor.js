import { Router } from "express";
import {
    all,
    AllRemoved,
    create,
    excelFornecedor,
    findById,
    getLastInsertedId,
    remove,
    update,
    getTipoDoc,
} from "../controller/FornecedorController";
import {
    createValidation,
    updateValidation,
} from "../validation/fornecedorValidation";

export const router = Router();

router.get("/fornecedores", all);
router.get("/fornecedores/:id", findById);
router.get("/fornecedores-excel", excelFornecedor);
router.get("/fornecedores/removidos/find", AllRemoved);
router.post("/fornecedores", createValidation, create);
router.put("/fornecedores/:id", updateValidation, update);
router.delete("/fornecedores/:id", remove);
router.get("/fornecedor/last-inserted", getLastInsertedId);
router.get("/documentos-fornecedor/:fornecedor/:tipo_doc", getTipoDoc);

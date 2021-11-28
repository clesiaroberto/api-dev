import { Router } from "express";
import {
    all,
    update,
    create,
    findById,
    remove,
    findByFornecedor,
    getLastInsertedReferencia,
} from "../controller/PagamentofornecedorController";
import { createValidation } from "../validation/PagamentoFornecedorValidation";

export const router = Router();

router.post("/pagamento-fornecedor", [createValidation], create);
router.put("/pagamento-fornecedor/:id", update);
router.delete("/pagamento-fornecedor/:id", remove);
router.get("/pagamento-fornecedor", all);
router.get("/pagamento-fornecedor/:id", findById);
router.get("/pagamentos-fornecedor/:fornecedor", findByFornecedor);
router.get("/pagamento-fornecedores/last-inserted", getLastInsertedReferencia);

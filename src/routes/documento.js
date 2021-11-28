import { Router } from "express";
import {
    all,
    create,
    documentoRegularizar,
    findById,
    getLastInsertedDocNumber,
    documentoRegularizarPagamento,
    remove,
    update,
    updateDocumentConfig,
    cancelarDocumento,
    documentoImpressaoEstado,
} from "../controller/DocumentoController";
import {
    documentoCreateValidation,
    documentoUpdateValidation,
} from "../validation/DocumentoValidation";

export const router = Router();
router.get("/documentos", all);
router.get("/documentos/:id", findById);
router.post("/documentos", documentoCreateValidation, create);
router.delete("/documentos/:id", remove);
router.put("/documentos/:id", [documentoUpdateValidation], update);
router.get("/documentos/last-inserted/:tipo_doc", getLastInsertedDocNumber);
router.get("/documentos/regularizar/:cliente/recibo", documentoRegularizar);
router.get(
    "/documentos/regularizar/pagamento/:fornecedor/",
    documentoRegularizarPagamento
);
router.put("/documento-config/:id", updateDocumentConfig);
router.get("/documentos/cancelar/:id", cancelarDocumento);
router.get("/documento-impressao-estado/:id", documentoImpressaoEstado);

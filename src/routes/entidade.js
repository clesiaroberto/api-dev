import { Router } from "express";
import {
    all,
    AllRemoved,
    create,
    findById,
    findByName,
    remove,
    update,
    excelEntidade,
    getLastInsertedId,
    getTipoDoc,
} from "../controller/EntidadeController";
import {
    createValidation,
    updateValidation,
} from "../validation/EntidadeValidation";

export const router = Router();

router.get("/entidades", all);
router.get("/entidades/:id", findById);
router.get("/entidades/nome/:name", findByName);
router.get("/entidades-excel", excelEntidade);
router.get("/entidades/removidos/find", AllRemoved);
router.post("/entidades", createValidation, create);
router.put("/entidades/:id", updateValidation, update);
router.delete("/entidades/:id", remove);
router.get("/entidade/last-inserted", getLastInsertedId);
router.get("/documentos-entidade/:entidade/:tipo_doc", getTipoDoc);

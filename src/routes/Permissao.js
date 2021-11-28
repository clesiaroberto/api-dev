import { Router } from "express";
import {
    all,
    create,
    findByGroupId,
    findById,
} from "../controller/PermissaoController";
import { createValidation } from "../validation/Permissao";
import onlyAdminAccess from "../middleware/onlyAdminAccessMiddleware";

export const router = Router();

router.post("/permissoes", [onlyAdminAccess, createValidation], create);
router.get("/permissoes", all);
router.get("/permissoes/por_grupo/:id", findByGroupId);
router.get("/permissoes/:id", findById);

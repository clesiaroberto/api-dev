import { Router } from "express";
import {
    all,
    create,
    findById,
    findByName,
} from "../controller/PermissaoGrupoController";
import { createValidation } from "../validation/PermissiaoGrupoValidation";
import onlyAdminAccess from "../middleware/onlyAdminAccessMiddleware";

export const router = Router();

router.post("/grupo/permissoes", [onlyAdminAccess, createValidation], create);
router.get("/grupo/permissoes/:id", findById);
router.get("/grupo/permissoes/nome/:nome", findByName);
router.get("/grupo/permissoes", all);

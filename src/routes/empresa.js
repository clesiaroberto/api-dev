import { Router } from "express";
import {
    all,
    create,
    findOne,
    findOneById,
    getStoreUsers,
    update,
    moedaPadrao
} from "../controller/EmpresaController";
import {
    empresaCreateValidation,
    empresaUpdateValidation,
} from "../validation/EmpresaValidation";
import onlyAdminAccess from "../middleware/onlyAdminAccessMiddleware";

export const router = Router();

router.get("/empresas", onlyAdminAccess, all);
router.get("/empresas/one", findOne);
router.get("/empresas/one/:id", onlyAdminAccess, findOneById);
router.post("/empresas", [onlyAdminAccess, empresaCreateValidation], create);
router.put("/empresas/:id", [onlyAdminAccess, empresaUpdateValidation], update);
router.get("/empresas/usuarios/:id", onlyAdminAccess, getStoreUsers);
router.get("/empresa/moeda/padrao", moedaPadrao);

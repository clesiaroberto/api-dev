import { Router } from "express";
import {
    addOnePermission,
    addPermissions,
    deletePermissions,
    getUserPermissionsbyId,
} from "../controller/UsuarioPermissaoController";

export const router = Router();

router.get("/permissoes-usuario/:id", getUserPermissionsbyId);
router.post("/permissoes-usuario", addOnePermission);
router.post("/permissoes-usuario/lista", addPermissions);
router.post("/deletePermissoes/:idU/:idP", deletePermissions);

import { Router } from "express";
import {
    all,
    create,
    findById,
    remove,
    trashed,
    update,
} from "../controller/PacoteController";
import {
    pacoteCreateValidation,
    pacoteUpdateValidation,
} from "../validation/PacoteValidation";
import onlyAdminAccess from "../middleware/onlyAdminAccessMiddleware";

export const router = Router();

router.get("/pacotes", onlyAdminAccess, all);
router.post("/pacotes", [onlyAdminAccess, pacoteCreateValidation], create);
router.get("/pacotes/:id", onlyAdminAccess, findById);
router.put("/pacotes/:id", [onlyAdminAccess, pacoteUpdateValidation], update);
router.delete("/pacotes/:id", onlyAdminAccess, remove);
router.get("/pacotes/all/trashed", onlyAdminAccess, trashed);

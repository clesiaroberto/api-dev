import { Router } from "express";
import userAuthenticatedData, {
    all,
    confirmPassword,
    findById,
    getUserAvatar,
    listUserByStatus,
    myProfile,
    register,
    update,
    updateMe,
    updatePasswordAdmin,
    updateStatus,
    userPassUpdate,
} from "../controller/UsuarioController";
import {
    createValidation,
    updatePasswordValidation,
    updateValidation,
} from "../validation/UserValidation";
import onlyAdminAccess from "../middleware/onlyAdminAccessMiddleware";

export const router = Router();

router.get("/usuarios/", onlyAdminAccess, all);
router.get("/usuarios/:id", onlyAdminAccess, findById);
router.get("/usuarios/estado/:estado", onlyAdminAccess, listUserByStatus);
router.get("/me", myProfile);
router.put("/me", [updateValidation], updateMe);
router.put("/usuarios/:id", [onlyAdminAccess, updateValidation], update);
router.post("/usuarios", [onlyAdminAccess, createValidation], register);
router.post("/usuarios/:id/atualizar-estado", onlyAdminAccess, updateStatus);
router.post("/me/confirm-password", confirmPassword);
router.patch("/update-password/:id", onlyAdminAccess, updatePasswordAdmin);
router.post(
    "/usuarios/password-update",
    [updatePasswordValidation],
    userPassUpdate
);

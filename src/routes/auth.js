import { Router } from "express";
import {
    authenticate,
    logout,
    refreshToken,
    verifyToken,
} from "../controller/AuthController";

export const router = Router();

router.post("/auth", authenticate);
router.post("/auth/refresh-token", refreshToken);
router.post("/auth/verify-token", verifyToken);
router.post("/auth/logout", logout);

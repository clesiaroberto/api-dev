import { Router } from "express";
import { all, convert } from "../controller/ConverteDocController";

export const router = Router();

router.get("/converte-docs", all);
router.post("/converte-docs", convert);

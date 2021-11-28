import { Router } from "express";
import { getAll, getById } from "../controller/precoCompraController";

export const router = Router();

router.get("/preco-compra", getAll);
router.get("/preco-compra/:id", getById);

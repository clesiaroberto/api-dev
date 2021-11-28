import { Router } from "express";
import { getAll, getById } from "../controller/preco_vendaController";

export const router = Router();

router.get("/preco-venda", getAll);
router.get("/preco-venda/:id", getById);

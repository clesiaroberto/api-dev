import { Router } from "express";
import {
    all,
    create,
    findById,
    remove,
    update,
    getLastInsertedCategoria,
} from "../controller/CategoriaEstoqueController";
import {
    categoriaCreateValidation,
    categoriaUpdateValidation,
} from "../validation/CategoriaEstoqueValidation";

export const router = Router();

router.get("/categorias-stock", all);
router.get("/categorias-stock/:id", findById);
router.post("/categorias-stock", categoriaCreateValidation, create);
router.put("/categorias-stock/:id", categoriaUpdateValidation, update);
router.delete("/categorias-stock/:id", remove);
router.get("/categoria-stock/last-inserted", getLastInsertedCategoria);

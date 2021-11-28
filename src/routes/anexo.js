import { Router } from "express";
import {
    getLogotipoById,
    uploadSingleFile,
} from "../controller/AnexoController";
import {
    addSlide,
    updateSlide,
    getById,
    deleteSlide,
    getLastInsertedId,
    multipleSlides,
} from "../controller/slidesUpload";

export const router = Router();

router.post("/anexo", uploadSingleFile);
router.get("/anexo/:id", getLogotipoById);
router.post("/slides", addSlide);
router.post("/multiple-slides", multipleSlides);
router.put("/slides/:id", updateSlide);

router.get("/slides/:id", getById);
router.delete("/slides/:id", deleteSlide);
router.get("/slide/last-inserted", getLastInsertedId);

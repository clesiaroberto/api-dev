import { Router } from "express"
import {
    getActividades,
    getAllActividades
} from "../controller/ActividadeController";
export const router = Router();

router.get("/actividades", getActividades);
router.get("/actividades/all", getAllActividades);

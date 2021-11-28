import { Router } from "express";
import {
    all,
    create,
    findById,
    remove,
    update,
    getLastInsertedContaBancaria,
    getTransacoes,
} from "../controller/ContaBancaria";
import {
    contaBancariaCreateValidation,
    contaBancariaUpdateValidation,
} from "../validation/ContaBancariaValidation";

export const router = Router();

router.get("/contas-bancarias", all);
router.post("/contas-bancarias", contaBancariaCreateValidation, create);
router.get("/contas-bancarias/:id", findById);
router.put("/contas-bancarias/:id", contaBancariaUpdateValidation, update);
router.delete("/contas-bancarias/:id", remove);
router.get("/conta-bancaria/last-inserted", getLastInsertedContaBancaria);
router.get("/view-transacoes/:conta_bancaria", getTransacoes);

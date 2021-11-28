import { Router } from "express";
import authorization from "../middleware/authMiddleware";

import { router as auth } from "./auth";
import { router as empresa } from "./empresa";
import { router as usuario } from "./usuario";
import { router as anexo } from "./anexo";
import { router as cliente } from "./cliente";
import { router as grupoPermissoes } from "./PermissaoGrupo";
import { router as permissoes } from "./Permissao";
import { router as userPermission } from "./usuarioPermissao";
import { router as fornecedor } from "./fornecedor";
import { router as entidade } from "./entidade";
import { router as categoriaEstoque } from "./categoriaEstoque";
import { router as stock } from "./stock";
import { router as tipodoc } from "./tipodoc";
import { router as taxa } from "./taxa";
import { router as tipo_doc_config } from "./tipo_doc_config";
import { router as precoVenda } from "./precoVenda";
import { router as precoCompra } from "./precoCompra";
import { router as pacote } from "./pacote";
import { router as contaBancaria } from "./contaBancaria";
import { router as moeda } from "./moeda";
import { router as documento } from "./documento";
import { router as cambio } from "./cambio";
import { router as moedaCambio } from "./moedaCambioEmpresa";
import { router as traducao } from "./traducao";
import { router as traducaoChave } from "./traducaoChave";
import { router as lingua } from "./lingua";
import { router as converteDoc } from "./converteDoc";
import { router as reciboAd } from "./reciboAd";
import { router as modeloImpressao } from "./modeloImpressao";
import { router as armazem } from "./armazem";
import { router as Pdf } from "./Pdf";
import { router as recibo } from "./recibo";
import { router as fornecedorAd } from "./fornecedorAd";
import { router as pagamentoFornecedor } from "./pagamentoFornecedor";
import { router as relatorios } from "./relatorios";
import { router as relatorioPrint } from "./relatorioPrint";
import { router as deposito } from "./deposito";
import { router as transferencia } from "./transferencia";
import { getAll } from "../controller/slidesUpload";
import { router as despesa } from "./despesa";
import { router as categoriaDespesa } from "./categoriaDespesa";
import { router as stockConfig } from "./stockConfiguracao";
import { router as actividades } from "./actividade";
import { router as graficos } from "./graficos";
import { router as excel } from "./excel";

import { router as tipoCliente } from "./tipoCliente";
import { router as tipoEntidade } from "./tipoEntidade";
import { router as tipoFornecedor } from "./tipoFornecedor";
import { getAllTranslations } from "../controller/traducaoController";
const router = Router();

router.get("/", (req, res) => {
    return res.send({
        title: "Welcome to NC API",
        documentação: {
            url: `${process.env.API_ADDRESS}/docs`,
            desc: "Acesse a URL para verificar a documentação da API",
        },
    });
});

router.use(auth);
router.get("/slides", getAll);
router.get("/traducoes/:idioma", getAllTranslations);

router.use(authorization, cliente);
router.use(authorization, entidade);
router.use(authorization, stock);
router.use(authorization, usuario);
router.use(authorization, Pdf);
router.use(authorization, empresa);
router.use(authorization, anexo);
router.use(authorization, grupoPermissoes);
router.use(authorization, permissoes);
router.use(authorization, userPermission);
router.use(authorization, fornecedor);
router.use(authorization, entidade);
router.use(authorization, categoriaEstoque);
router.use(authorization, cliente);
router.use(authorization, tipodoc);
router.use(authorization, taxa);
router.use(authorization, tipo_doc_config);
router.use(authorization, precoVenda);
router.use(authorization, precoCompra);
router.use(authorization, pacote);
router.use(authorization, contaBancaria);
router.use(authorization, moeda);
router.use(authorization, documento);
router.use(authorization, cambio);
router.use(authorization, moedaCambio);
router.use(authorization, traducao);
router.use(authorization, traducaoChave);
router.use(authorization, lingua);
router.use(authorization, converteDoc);
router.use(authorization, reciboAd);
router.use(authorization, modeloImpressao);
router.use(authorization, armazem);
router.use(authorization, recibo);
router.use(authorization, fornecedorAd);
router.use(authorization, pagamentoFornecedor);
router.use(authorization, relatorios);
router.use(authorization, relatorioPrint);
router.use(authorization, deposito);
router.use(authorization, transferencia);
router.use(authorization, despesa);
router.use(authorization, categoriaDespesa);
router.use(authorization, stockConfig);
router.use(authorization, actividades);
router.use(authorization, graficos);
router.use(authorization, excel);

router.use(authorization, tipoCliente);
router.use(authorization, tipoEntidade);
router.use(authorization, tipoFornecedor);
export default router;

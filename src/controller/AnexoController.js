import path from "path";
import knex from "../database";
import { upload } from "../helper/UploadFile";

const uploadSingleFile = async (req, res) => {
    const authenticatedUserId = req.userId;

    try {
        if (!req.files) {
            res.send({
                status: false,
                message: "Nenhum anexo enviado",
            });
        } else {
            let anexo = req.files.anexo;
            if (!anexo) {
                return res
                    .status(400)
                    .send({ message: "O anexo é obrigatório", field: "anexo" });
            }

            const { name, folder, mimetype } = upload(anexo, "anexos");

            const attach = await knex("anexo").insert({
                nome_original: name,
                nome_ficheiro: folder,
                mime_type: mimetype,
                extensao: path.extname(anexo.name),
                usuario_added: authenticatedUserId,
                usuario_updated: authenticatedUserId,
            });

            const attached = await knex("anexo").where("id", attach).first();
            return res.send({
                message: "Anexo enviado com sucesso.",
                attached,
            });
        }
    } catch (err) {
        return res.status(500).send(err);
    }
};

const getLogotipoById = async (req, res) => {
    const { id } = req.params;
    const anexo = await knex("anexo").where({ id }).first();

    if (!anexo) {
        return res.status(404).send({
            message: "Logotipo não encontrado",
        });
    }

    return res.redirect(`/static${anexo.nome_ficheiro}`);
};

export { uploadSingleFile, getLogotipoById };

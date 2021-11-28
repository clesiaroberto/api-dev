import knex from "../database";
import { handleResponse } from "../utils/handleResponse";
import { userCanAccess } from "../middleware/userCanAccess";

const permissionGroup = "Actividades";
const tableName = "actividade";

const timeConversion = (s) => {
    // 07:05:45PM
    const timeInAmPmArray = s.split(/(AM|PM)/); // ['07:05:45', 'PM', '']
    const hour = Number(timeInAmPmArray[0].split(":")[0]); // 7
    const amOrPm = timeInAmPmArray[1]; // PM
    let timeIn24Hour = "";
    if (amOrPm === "AM") {
        timeIn24Hour =
            hour === 12
                ? `00:${timeInAmPmArray[0].split(":").slice(1).join(":")}`
                : timeInAmPmArray[0];
    } else {
        timeIn24Hour =
            hour === 12
                ? timeInAmPmArray[0]
                : `${hour + 12}:${timeInAmPmArray[0]
                      .split(":")
                      .slice(1)
                      .join(":")}`;
        // timeIn24Hour = 19:05:45
    }
    return timeIn24Hour;
};

const type = ["Adicionado por", "Editado por", "Removido por"];

export const getActividades = async (req, res) => {
    const { empresa, userId } = req.user;
    const data = [];

    if (!(await userCanAccess(permissionGroup, "Mostrar Actividade", userId))) {
        const message = "Sem permissão para visualizar as Actividades.";
        return handleResponse(req, res, 403, [], message);
    }

    try {
        const actividades = await knex(tableName)
            .where({ empresa })
            .orderBy("id", "DESC")
            .limit(4);

        for (let i = 0; i < actividades.length; i++) {
            let color = "warning";
            let actionTxt = "";
            let date = new Date(actividades[i].data_added)
                .toLocaleString()
                .split(",");

            if (actividades[i].tipo == 3) {
                color = "danger";
            } else if (actividades[i].tipo == 1) {
                color = "primary";
            }

            const userInAction = await knex(tableName)
                .select(["empresa.*"])
                .leftJoin("empresa", "empresa.id", "actividade.empresa")
                .where("actividade.empresa", actividades[i].empresa)
                .first();

            switch (actividades[i].tipo) {
                case 1:
                    actionTxt = `${type[0]} @${userInAction.nome}`;
                    break;
                case 2:
                    actionTxt = `${type[1]} @${userInAction.nome}`;
                    break;
                case 3:
                    actionTxt = `${type[2]} @${userInAction.nome}`;
                    break;

                default:
                    break;
            }

            let obj = {
                title: `${actividades[i].descricao}`,
                content: actionTxt,
                meta: `${date[0]}, ${timeConversion(date[1])}`,
                metaClassName: "mr-1",
                color,
            };

            data.push(obj);
        }

        return handleResponse(req, res, 200, data);
    } catch (err) {
        return handleResponse(req, res, 500, err);
    }
};

export const getAllActividades = async (req, res) => {
    const { empresa, userId } = req.user;
    const data = [];

    if (!(await userCanAccess(permissionGroup, "Mostrar Actividade", userId))) {
        const message = "Sem permissão para visualizar as Actividades.";
        return handleResponse(req, res, 403, [], message);
    }

    try {
        const actividades = await knex(tableName)
            .where({ empresa })
            .orderBy("id", "DESC");

        for (let i = 0; i < actividades.length; i++) {
            let color = "warning";
            let actionTxt = "";
            let date = new Date(actividades[i].data_added)
                .toLocaleString()
                .split(",");

            if (actividades[i].tipo == 3) {
                color = "danger";
            } else if (actividades[i].tipo == 1) {
                color = "primary";
            }

            const userInAction = await knex(tableName)
                .select(["empresa.*"])
                .leftJoin("empresa", "empresa.id", "actividade.empresa")
                .where("actividade.empresa", actividades[i].empresa)
                .first();

            switch (actividades[i].tipo) {
                case 1:
                    actionTxt = `${type[0]} @${userInAction.nome}`;
                    break;
                case 2:
                    actionTxt = `${type[1]} @${userInAction.nome}`;
                    break;
                case 3:
                    actionTxt = `${type[2]} @${userInAction.nome}`;
                    break;

                default:
                    break;
            }

            let obj = {
                id: actividades[i].id,
                title: `${actividades[i].descricao}`,
                content: actionTxt,
                meta: `${date[0]}, ${timeConversion(date[1])}`,
                metaClassName: "mr-1",
                color,
            };

            data.push(obj);
        }

        return handleResponse(req, res, 200, data);
    } catch (err) {
        return handleResponse(req, res, 500, err);
    }
};

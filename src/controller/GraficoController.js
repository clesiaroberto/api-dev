import knex from "../database";
import { handleResponse } from "../utils/handleResponse";
import { userCanAccess } from "../middleware/userCanAccess";

const daysInMonth = (month, year) => {
    return new Date(year, month, 0).getDate();
};

export const vendas = async (req, res) => {
    const { empresa } = req.user;

    try{

        let dynamic_month = 1;
        const year = new Date().getFullYear();
        const data_by_month = [];

        while(dynamic_month <= 12) {
            let date_start;
            let date_end
        if(dynamic_month > 9){
            date_start = year + "-" + dynamic_month + "-01";
            date_end = year + "-" + dynamic_month + "-" + daysInMonth(dynamic_month, year);
        }else{
            date_start = year + "-0" + dynamic_month + "-01";
            date_end = year + "-0" + dynamic_month + "-" + daysInMonth(dynamic_month, year);
        }

        let query = `SELECT IF((debito - credito) != 0, (debito - credito), 0) as total 
        FROM (
          SELECT
          SUM(credito) as credito, SUM(debito) as debito
          FROM extrato_cliente where DATE(data_added) BETWEEN '${date_start}' AND '${date_end}' AND empresa = ${empresa}
        ) T1
        `;

        let data = await knex.raw(query);

        data_by_month.push(data[0][0].total);

        dynamic_month++; 

        }

        let query2 = `SELECT (debito - credito) as total 
        FROM (
          SELECT
          SUM(credito) as credito, SUM(debito) as debito
          FROM extrato_cliente where DATE(data_added) BETWEEN '${year + "-01-" + daysInMonth('01', year)}' AND '${year + "-12-" + daysInMonth('12', year)}' AND empresa = ${empresa}
        ) T1
        `;

        const total = await knex.raw(query2);

        return handleResponse(req, res, 200, {
            data: data_by_month,
            total: total[0][0].total.toFixed(2)
        });

    }catch(err){
        return handleResponse(req, res, 500, err);
    }
}

export const compras = async (req, res) => {
    const { empresa } = req.user;

    try{
        const year = new Date().getFullYear();
        //const month = new Date().getMonth()+1;
        //const days = daysInMonth(month,year);
        const data_by_month = [];

        let dynamic_month = 1;

        const categories = [];

        while(dynamic_month <= 12) {
            let date_start;
            let date_end
        if(dynamic_month > 9){
            date_start = year + "-" + dynamic_month + "-01";
            date_end = year + "-" + dynamic_month + "-" + daysInMonth(dynamic_month, year);
        }else{
            date_start = year + "-0" + dynamic_month + "-01";
            date_end = year + "-0" + dynamic_month + "-" + daysInMonth(dynamic_month, year);
        }

        let query = `SELECT IF((debito - credito) != 0, (debito - credito), 0) as total
        FROM (
        SELECT
        SUM(credito) as credito, SUM(debito) as debito
        FROM extrato_fornecedor where DATE(data_added) BETWEEN '${date_start}' AND '${date_end}' AND empresa = ${empresa}
        ) T1`;

        let data = await knex.raw(query);
        categories.push(dynamic_month);

        data_by_month.push(data[0][0].total.toFixed(2));

        dynamic_month++; 

        }

        let query2 = `SELECT (debito - credito) as total 
        FROM (
          SELECT
          SUM(credito) as credito, SUM(debito) as debito
          FROM extrato_fornecedor where DATE(data_added) BETWEEN '${year + "-01-" + daysInMonth('01', year)}' AND '${year + "-12-" + daysInMonth('12', year)}' AND empresa = ${empresa}
        )T1
        `;

        const total = await knex.raw(query2);

        return handleResponse(req, res, 200, {
            categories,
            data: data_by_month,
            total: total[0][0].total,
        });

    }catch(err){
        return handleResponse(req, res, 500, err);
    }
}

export const cliente = async (req, res) => {
    const { empresa } = req.user;
    const clientes = [];
    const data = [];
    const chartInfo = [];
    let moeda = '';
    try{

        let query = `
        SELECT
            tipo_cliente,
            tc.nome,
            SUM(saldo) as totalSum,
            tabela2.codigo as moeda,
            CONCAT(SUM(saldo), ' ', tabela2.codigo) as total
            FROM (
                SELECT cs.tipo_cliente as tipo_cliente, cs.nome as nome, cs.saldo as saldo
                FROM cliente_saldo as cs WHERE cs.tipo_cliente IS NOT NULL AND cs.removido != 1
            ) tabela1
        INNER JOIN tipo_cliente as tc ON tc.id = tipo_cliente
        INNER JOIN (
            SELECT moeda.*, empresa.id as empresa FROM empresa INNER JOIN moeda ON moeda.id = empresa.moeda_padrao
        )tabela2 ON tabela2.empresa = tc.empresa
        WHERE tc.empresa = ?
        GROUP BY tipo_cliente`;

        const response = await knex.raw(query, [empresa]);

        for(let i = 0; i < response[0].length; i++){

            chartInfo.push(
                {
                    icon: "Circle",
                    iconColor: "warning",
                    name: response[0][i].nome,
                    //usage: "30",
                    upDown: response[0][i].total,
                    ttl: response[0][i].totalSum,
                },
            )

            moeda = response[0][i].moeda

            clientes.push(response[0][i].nome);
            data.push(response[0][i].totalSum);
        }

        return handleResponse(req, res, 200, {
            clientes,
            dados: data,
            chartInfo,
            moeda_padrao: moeda
        });
    }catch(err){
        return handleResponse(req, res, 500, err);
    }
}

export const fornecedor = async (req, res) => {
    const { empresa } = req.user;
    const clientes = [];
    const data = [];
    const listData = [];
    let moeda = '';
    try{

        let query = `
        SELECT
            tipo_fornecedor,
            tf.nome,
            SUM(saldo) as totalSum,
            tabela2.codigo as moeda,
            CONCAT(SUM(tabela1.saldo), ' ', tabela2.codigo) as total
            FROM (
                SELECT fs.tipo_fornecedor as tipo_fornecedor, fs.nome as nome, fs.saldo as saldo
                FROM fornecedor_saldo as fs WHERE fs.tipo_fornecedor IS NOT NULL AND fs.removido != 1
            ) tabela1
        INNER JOIN tipo_fornecedor as tf ON tf.id = tipo_fornecedor
        INNER JOIN (
            SELECT moeda.*, empresa.id as empresa FROM empresa INNER JOIN moeda ON moeda.id = empresa.moeda_padrao
        )tabela2 ON tabela2.empresa = tf.empresa
        WHERE tf.empresa = ?
        GROUP BY tipo_fornecedor`;

        const response = await knex.raw(query, [empresa]);

        for(let i = 0; i < response[0].length; i++){

            listData.push(
                {
                    icon: "Circle",
                    iconColor: "secondary",
                    text: response[0][i].nome,
                    result: response[0][i].total,
                    ttl: response[0][i].totalSum
                }
            )

            moeda = response[0][i].moeda

            clientes.push(response[0][i].nome);
            data.push(Math.abs(response[0][i].totalSum));
        }

        return handleResponse(req, res, 200, {
            clientes,
            dados: data,
            listData,
            moeda_padrao: moeda
        });
    }catch(err){
        return handleResponse(req, res, 500, err);
    }
}
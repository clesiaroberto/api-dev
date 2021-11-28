import { assert as _assert, should as _should, expect } from "chai";
import { agent as _agent } from "superagent";
import "babel-polyfill"; //Precisamos para o beforeEach e afterEach (rollback) funcionar
import { loginUser } from "./auth.test";
import knex from "../src/database/index";

const API_SERVER = "http://localhost:3000";

describe("Teste de Câmbio", () => {
    describe("/cambio", function () {
        const agent = _agent();

        before(loginUser(agent));
        beforeEach(async () => {
            await knex("cambio").insert(cambioData);
        });
        // afterEach(async () => {
        //   await knex("tipo_doc").delete();
        //   await knex("tipo_doc_config").delete();
        // });

        it("Deve retornar status 404 se a moeda não estiver cadastrada!", function (done) {
            agent
                .post(`${API_SERVER}/cambio`)
                .send(cambioData1)
                .end(function (err, res) {
                    expect(res.status).equal(404);
                    return done();
                });
        });
        it("Deve retornar status 400 se a moeda Padrão for igual a moeda de conversão`", function (done) {
            agent
                .post(`${API_SERVER}/cambio`)
                .send(cambioData2)
                .end(function (err, res) {
                    expect(res.status).equal(400);
                    return done();
                });
        });

        it("Deve retornar status 200 se o cambio for registado com sucesso", function (done) {
            agent
                .post(`${API_SERVER}/campio`)
                .send(cambioData)
                .end(function (err, res) {
                    expect(res.status).equal(200);
                    return done();
                });
        });

        it("Deve retornar 404 Se o ID não for encontrado!", function (done) {
            agent
                .delete(`${API_SERVER}/cambio/300`)
                .send()
                .end(function (err, res) {
                    expect(res.status).equal(404);
                    return done();
                });
        });

        it("Deve retornar status 200 e listar o cambio por Id", function (done) {
            agent
                .get(`${API_SERVER}/cambio/1`)
                .send()
                .end(function (err, res) {
                    expect(res.status).equal(200);
                    return done();
                });
        });

        it("Deve retornar status 200 e listar os cambios", function (done) {
            agent
                .get(`${API_SERVER}/cambio`)
                .send()
                .end(function (err, res) {
                    expect(res.status).equal(200);
                    return done();
                });
        });

        it("Deve retornar status 404 se o ID não for encontrado", function (done) {
            agent
                .put(`${API_SERVER}/cambio/280`)
                .send(cambioData)
                .end(function (err, res) {
                    expect(res.status).equal(404);
                    return done();
                });
        });

        it("Deve retornar status 404 se a Moeda Padrão não está cadastrada", function (done) {
            agent
                .put(`${API_SERVER}/cambio/2`)
                .send(cambioData3)
                .end(function (err, res) {
                    expect(res.status).equal(404);
                    return done();
                });
        });

        it("Deve retornar status 404 se a Moeda de conversão não está cadastrada", function (done) {
            agent
                .put(`${API_SERVER}/cambio/2`)
                .send(cambioData3)
                .end(function (err, res) {
                    expect(res.status).equal(404);
                    return done();
                });
        });

        it("Deve retornar status 404 se a moeda for igual a moeda de conversão", function (done) {
            agent
                .put(`${API_SERVER}/cambio/2`)
                .send(cambioData3)
                .end(function (err, res) {
                    expect(res.status).equal(200);
                    return done();
                });
        });
    });
});

const cambioData = {
    moeda_padrao: 1,
    moeda_conversao: 2,
    preco_compra: "100",
    preco_venda: "90",
    usuario_added: 1,
    usuario_updated: 1,
};

const cambioData1 = {
    moeda_padrao: 400,
    moeda_conversao: 300,
    preco_compra: "100",
    preco_venda: "90",
    usuario_added: 1,
    usuario_updated: 1,
};

const cambioData2 = {
    moeda_padrao: 400,
    moeda_conversao: 400,
    preco_compra: "100",
    preco_venda: "90",
    usuario_added: 1,
    usuario_updated: 1,
};
const cambioData3 = {
    moeda_padrao: 1000,
    moeda_conversao: 2000,
};

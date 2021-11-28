import { assert as _assert, should as _should, expect } from "chai";
import { agent as _agent } from "superagent";
import "babel-polyfill"; //Precisamos para o beforeEach e afterEach (rollback) funcionar
import { loginUser } from "./auth.test";
import knex from "../src/database/index";

const API_SERVER = "http://localhost:3000";

describe("Teste de Stock", () => {
    describe("/stock", function () {
        const agent = _agent();

        before(loginUser(agent));
        // beforeEach(async () => {
        //   await knex("stock").insert(stockData);

        // });
        // afterEach(async () => {
        //   await knex("stock").delete();
        // });

        it("Deve retornar status 422 se algum campo estiver vazio! ", function (done) {
            agent
                .post(`${API_SERVER}/stock`)
                .send({})
                .end(function (err, res) {
                    expect(res.status).equal(422);
                    return done();
                });
        });

        it("Deve retornar status 200 se os dados forem listados! ", function (done) {
            agent
                .get(`${API_SERVER}/stock`)
                .send()
                .end(function (err, res) {
                    expect(res.status).equal(200);
                    return done();
                });
        });

        it("Deve retornar status 404 se a categoria não estiver cadastrada! ", function (done) {
            agent
                .post(`${API_SERVER}/stock`)
                .send(stockData)
                .end(function (err, res) {
                    expect(res.status).equal(404);
                    return done();
                });
        });

        it("Deve retornar status 404 se o Id não for encontrado! ", function (done) {
            agent
                .get(`${API_SERVER}/stock/200`)
                .send()
                .end(function (err, res) {
                    expect(res.status).equal(404);
                    return done();
                });
        });

        it("Deve retornar status 200 se o Id do stock for encontrado! ", function (done) {
            agent
                .get(`${API_SERVER}/stock/310`)
                .send()
                .end(function (err, res) {
                    expect(res.status).equal(200);
                    return done();
                });
        });

        it("Deve retornar status 200 se a referencia do stock for encontrado! ", function (done) {
            agent
                .get(`${API_SERVER}/stock/ref/st1`)
                .send()
                .end(function (err, res) {
                    expect(res.status).equal(200);
                    return done();
                });
        });

        it("Deve retornar status 404 se a categoria não for encontrada", function (done) {
            agent
                .get(`${API_SERVER}/stock/categoria/500`)
                .send()
                .end(function (err, res) {
                    expect(res.status).equal(404);
                    return done();
                });
        });

        it("Deve retornar status 200 se a categoria for encontrada", function (done) {
            agent
                .get(`${API_SERVER}/stock/categoria/6`)
                .send()
                .end(function (err, res) {
                    expect(res.status).equal(200);
                    return done();
                });
        });

        it("Deve retornar status 404 se o Id não for encontrado", function (done) {
            agent
                .put(`${API_SERVER}/stock/500`)
                .send(stockData)
                .end(function (err, res) {
                    expect(res.status).equal(404);
                    return done();
                });
        });

        it("Deve retornar status 404 se o Id não for encontrado", function (done) {
            agent
                .put(`${API_SERVER}/stock/150`)
                .send(stockData1)
                .end(function (err, res) {
                    expect(res.status).equal(404);
                    return done();
                });
        });

        it("Deve retornar 200 se o ID for encontrado e os dados forem actualizados!", function (done) {
            agent
                .put(`${API_SERVER}/stock/314`)
                .send(stockData1)
                .end(function (err, res) {
                    expect(res.status).equal(200);
                    return done();
                    s;
                });
        });

        // it("Deve retornar 404 Se o ID não for encontrado!", function (done) {
        //   agent
        //   .delete(`${API_SERVER}/stock/300`)
        //   .send()
        //   .end(function (err, res) {
        //     expect(res.status).equal(404);
        //     return done();
        //   });
        // });

        // it("Deve retornar 404 Se o ID for encontrado e os dados forem apagados!", function (done) {
        //     agent
        //     .delete(`${API_SERVER}/stock/121`)
        //     .send()
        //     .end(function (err, res) {
        //       expect(res.status).equal(200);
        //       return done();
        //     });
        //   });

        it("Deve retornar 200 se os dados forem listados!", function (done) {
            agent
                .get(`${API_SERVER}/stock/removed/all`)
                .send()
                .end(function (err, res) {
                    expect(res.status).equal(200);
                    return done();
                });
        });
    });
});

const stockData = {
    nome: "stock",
    referencia: "st1",
    categoria: 1,
    anexo: 1,
    tipo: 1,
    descricao: "kkk",
    empresa: 1,
    usuario_added: 1,
    usuario_updated: 1,
};

const stockData1 = {
    nome: "stock",
    referencia: "st1",
    categoria: 6,
    anexo: 1,
    tipo: 1,
    descricao: "kkk",
    empresa: 1,
    usuario_added: 1,
    usuario_updated: 1,
};

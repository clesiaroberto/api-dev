import { assert as _assert, should as _should, expect } from "chai";
import { agent as _agent } from "superagent";
import "babel-polyfill"; //Precisamos para o beforeEach e afterEach (rollback) funcionar
import { loginUser } from "./auth.test";
import knex from "../src/database/index";

const API_SERVER = "http://localhost:3000";

describe("Teste de Taxa", () => {
    describe("/taxas", function () {
        const agent = _agent();

        before(loginUser(agent));
        beforeEach(async () => {
            await knex("taxa").insert(taxaData);
        });
        // afterEach(async () => {
        //   await knex("taxa").delete();
        // });

        it("Deve retornar status 422 se algum campo estiver vazio! ", function (done) {
            agent
                .post(`${API_SERVER}/taxas`)
                .send({})
                .end(function (err, res) {
                    expect(res.status).equal(422);
                    return done();
                });
        });

        it("Deve retornar status 200 se os dados forem listados! ", function (done) {
            agent
                .post(`${API_SERVER}/taxas`)
                .send(taxaData)
                .end(function (err, res) {
                    expect(res.status).equal(200);
                    return done();
                });
        });

        it("Deve retornar status 404 se o Id não for encontrado!", function (done) {
            agent
                .delete(`${API_SERVER}/taxas/250`)
                .send()
                .end(function (err, res) {
                    expect(res.status).equal(404);
                    return done();
                });
        });

        // it("Deve retornar status 404 se o Id não for encontrado!", function (done) {
        //     agent
        //       .delete(`${API_SERVER}/taxas/2`)
        //       .send()
        //       .end(function (err, res){
        //         expect(res.status).equal(200);
        //         return done();
        //       });
        //   });

        it("Deve retornar status 404 se o Id não for encontrado!", function (done) {
            agent
                .put(`${API_SERVER}/taxas/250`)
                .send(taxaData)
                .end(function (err, res) {
                    expect(res.status).equal(404);
                    return done();
                });
        });

        it("Deve retornar status 200 se o Id for encontrado e os dados forem actualizados!", function (done) {
            agent
                .put(`${API_SERVER}/taxas/2`)
                .send(taxaData)
                .end(function (err, res) {
                    expect(res.status).equal(200);
                    return done();
                });
        });

        it("Deve retornar status 200 se o Id for encontrado e a taxa for listada!", function (done) {
            agent
                .get(`${API_SERVER}/taxas`)
                .send()
                .end(function (err, res) {
                    expect(res.status).equal(200);
                    return done();
                });
        });

        it("Deve retornar status 404 se o Id não for encontrado!", function (done) {
            agent
                .get(`${API_SERVER}/taxas/250`)
                .send()
                .end(function (err, res) {
                    expect(res.status).equal(404);
                    return done();
                });
        });

        it("Deve retornar status 200 se o Id for encontrado e a taxa for listada!", function (done) {
            agent
                .get(`${API_SERVER}/taxas/4`)
                .send()
                .end(function (err, res) {
                    expect(res.status).equal(200);
                    return done();
                });
        });
    });
});

const taxaData = {
    nome: "IVA",
    valor: 1,
    percentual: 1,
    empresa: 1,
    usuario_added: 1,
    usuario_updated: 1,
};

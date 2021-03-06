import { assert as _assert, should as _should, expect } from "chai";
import { agent as _agent } from "superagent";
import "babel-polyfill"; //Precisamos para o beforeEach e afterEach (rollback) funcionar
import { loginUser } from "./auth.test";
import knex from "../src/database/index";

const API_SERVER = "http://localhost:3000";

describe("Teste de Entidades", () => {
    describe("/entidades", function () {
        const agent = _agent();

        before(loginUser(agent));
        beforeEach(async () => {
            await knex("entidade").insert(entidadeData);
        });
        afterEach(async () => {
            await knex("entidade").delete();
        });

        it("Deve retornar erro 422 se algum campo estiver vazio", function (done) {
            agent
                .post(`${API_SERVER}/entidades`)
                .send({})
                .end(function (err, res) {
                    expect(res.status).equal(422);
                    return done();
                });
        });

        it("Deve retornar 404 se o Id passado pelo parâmetro não for encontrado", function (done) {
            agent
                .get(`${API_SERVER}/entidades/100`)
                .send()
                .end(function (err, res) {
                    expect(res.status).equal(404);
                    return done();
                });
        });

        it("Deve retornar 404 se o nome passado pelo parâmetro não existe!", function (done) {
            agent
                .get(`${API_SERVER}/entidades/nome/Entidade`)
                .send()
                .end(function (err, res) {
                    expect(res.status).equal(404);
                    return done();
                });
        });

        it("Deve retornar 200 Se o houver dados por listar!", function (done) {
            agent
                .get(`${API_SERVER}/entidades/removidos/find`)
                .send()
                .end(function (err, res) {
                    expect(res.status).equal(200);
                    return done();
                });
        });

        it("Deve retornar 422 se aplgum campo estiver vazio", function (done) {
            agent
                .put(`${API_SERVER}/entidades/1`)
                .send(entidadeData)
                .end(function (err, res) {
                    expect(res.status).equal(422);
                    return done();
                });
        });

        it("Deve retornar 404 se o Id encontrado não for encontrado!", function (done) {
            agent
                .put(`${API_SERVER}/entidades/5`)
                .send(entidadeData1)
                .end(function (err, res) {
                    expect(res.status).equal(404);
                    return done();
                });
        });

        it("Deve retornar 200 se o Id for encontrado e os dados forem listados!", function (done) {
            agent
                .put(`${API_SERVER}/entidades/1`)
                .send(entidadeData1)
                .end(function (err, res) {
                    expect(res.status).equal(200);
                    return done();
                });
        });

        it("Deve retornar 404 se o Id encontrado não for encontrado!", function (done) {
            agent
                .delete(`${API_SERVER}/entidades/5`)
                .send()
                .end(function (err, res) {
                    expect(res.status).equal(404);
                    return done();
                });
        });

        it("Deve retornar 200 se o Id for encontrado e o registro for apagado!", function (done) {
            agent
                .delete(`${API_SERVER}/entidades/1`)
                .send()
                .end(function (err, res) {
                    expect(res.status).equal(200);
                    return done();
                });
        });

        // it("Deve retornar 404 porque o Id passado no parâmetro existe e os dados forem apagados!", function (done) {
        //   agent
        //     .delete(`${API_SERVER}/e/2`)
        //     .send()
        //     .end(function (err, res) {
        //       expect(res.status).equal(200);
        //       return done();
        //     });
        // });
    });
});

const entidadeData = {
    id: 1,
    nome: "Nc",
    email: "nc@yahoo.co.mz",
    contacto1: "842585445",
    contacto2: "123456789",
    endereco: "Matola",
    endereco2: "Maputo",
    empresa: 1,
    nuit: "123456789",
    usuario_added: 1,
    usuario_updated: 1,
    removido: 0,
};

const entidadeData1 = {
    nome: "Nc1",
    email: "nc@yahoo.com.mz",
    contacto1: "842585445",
    contacto2: "123456789",
    endereco: "Matola",
    endereco2: "Maputo",
    empresa: 1,
    nuit: "123456789",
    usuario_added: 1,
    usuario_updated: 1,
    removido: 0,
};

import { assert as _assert, should as _should, expect } from "chai";
import { agent as _agent } from "superagent";
import "babel-polyfill"; //Precisamos para o beforeEach e afterEach (rollback) funcionar
import { loginUser } from "./auth.test";
import knex from "../src/database/index";

const API_SERVER = "http://localhost:3000";

describe("Teste de Clientes", () => {
    describe("/clientes", function () {
        const agent = _agent();

        before(loginUser(agent));
        beforeEach(async () => {
            await knex("cliente").insert(clienteData);
        });
        afterEach(async () => {
            await knex("cliente").delete();
        });

        it("Deve retornar erro 422 se algum campo estiver vazio", function (done) {
            agent
                .post(`${API_SERVER}/clientes`)
                .send({})
                .end(function (err, res) {
                    expect(res.status).equal(422);
                    return done();
                });
        });

        it("Deve retornar 409 se o e-mail informado já existe!", function (done) {
            agent
                .post(`${API_SERVER}/clientes`)
                .send({
                    nome: "Clesia",
                    email: "clesia@yahoo.com",
                    contacto1: "844024855",
                })
                .end(function (err, res) {
                    expect(res.status).equal(409);
                    return done();
                });
        });

        it("Deve retornar 404 porque o Id passado no parâmetro não existe!", function (done) {
            agent
                .put(`${API_SERVER}/clientes/100`)
                .send(clienteData)
                .end(function (err, res) {
                    expect(res.status).equal(404);
                    return done();
                });
        });

        it("Deve retornar 200 Se o Id passado por parâmetro existe e os dados forem actualizados", function (done) {
            agent
                .put(`${API_SERVER}/clientes/2`)
                .send(clienteData)
                .end(function (err, res) {
                    expect(res.status).equal(200);
                    return done();
                });
        });

        it("Deve retornar 404 porque o Id passado no parâmetro não existe!", function (done) {
            agent
                .get(`${API_SERVER}/clientes/100`)
                .send()
                .end(function (err, res) {
                    expect(res.status).equal(404);
                    return done();
                });
        });

        it("Deve retornar 200 Se o Id passado por parâmetro existe e os dados forem listados", function (done) {
            agent
                .get(`${API_SERVER}/clientes/2`)
                .send()
                .end(function (err, res) {
                    expect(res.status).equal(200);
                    return done();
                });
        });

        it("Deve retornar 404 porque o Id passado no parâmetro não existe!", function (done) {
            agent
                .delete(`${API_SERVER}/clientes/100`)
                .send()
                .end(function (err, res) {
                    expect(res.status).equal(404);
                    return done();
                });
        });

        it("Deve retornar 404 porque o Id passado no parâmetro existe e os dados forem apagados!", function (done) {
            agent
                .delete(`${API_SERVER}/clientes/2`)
                .send()
                .end(function (err, res) {
                    expect(res.status).equal(200);
                    return done();
                });
        });
    });
});

const clienteData = {
    id: 2,
    nome: "Clesia",
    email: "clesia@yahoo.com",
    contacto1: "852147896",
    contacto2: "854825523",
    nuit: "147856998",
    endereco: "dddd",
    empresa: 1,
    usuario_added: 1,
    usuario_updated: 1,
};

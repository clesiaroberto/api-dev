import { assert as _assert, should as _should, expect } from "chai";
import { agent as _agent } from "superagent";
import "babel-polyfill"; //Precisamos para o beforeEach e afterEach (rollback) funcionar
import { loginUser } from "./auth.test";
import knex from "../src/database/index";

const API_SERVER = "http://localhost:3000";

describe("Teste de Tipo de Documento", () => {
    describe("/tipo-doc", function () {
        const agent = _agent();

        before(loginUser(agent));
        beforeEach(async () => {
            await knex("tipo_doc").insert(tipodocData);
            await knex("tipo_doc_config").insert(tipodocConfigData);
        });
        // afterEach(async () => {
        //   await knex("tipo_doc").delete();
        //   await knex("tipo_doc_config").delete();
        // });

        it("Deve retornar status 422 se algum campo estiver vazio! ", function (done) {
            agent
                .post(`${API_SERVER}/tipo-doc`)
                .send({})
                .end(function (err, res) {
                    expect(res.status).equal(422);
                    return done();
                });
        });

        it("Deve retornar status 409 se o tipo de documento já existe! ", function (done) {
            agent
                .post(`${API_SERVER}/tipo-doc`)
                .send(tipodocData)
                .end(function (err, res) {
                    expect(res.status).equal(409);
                    return done();
                });
        });
        +it("Deve retornar status 404 se o ID não for encontrado!", function (done) {
            agent
                .put(`${API_SERVER}/tipo-doc/120`)
                .send(tipodocData, tipodocConfigData)
                .end(function (err, res) {
                    expect(res.status).equal(404);
                    return done();
                });
        });

        it("Deve retornar status 200 se o Id for encontrado e os dados forem actualizados! ", function (done) {
            agent
                .put(`${API_SERVER}/tipo-doc/8`)
                .send(tipodocData, tipodocConfigData)
                .end(function (err, res) {
                    expect(res.status).equal(200);
                    return done();
                });
        });

        it("Deve retornar 404 Se o ID não for encontrado!", function (done) {
            agent
                .delete(`${API_SERVER}/tipo-doc/300`)
                .send()
                .end(function (err, res) {
                    expect(res.status).equal(404);
                    return done();
                });
        });

        // it("Deve retornar 404 Se o ID for encontrado e o os dados forem removidos!", function (done) {
        //     agent
        //     .delete(`${API_SERVER}/tipo-doc/5`)
        //     .send()
        //     .end(function (err, res) {
        //       expect(res.status).equal(200);
        //       return done();
        //     });
        //   });

        it("Deve retornar status 200 e listar os tipos de documento", function (done) {
            agent
                .get(`${API_SERVER}/tipo-doc`)
                .send()
                .end(function (err, res) {
                    expect(res.status).equal(200);
                    return done();
                });
        });

        it("Deve retornar status 404 se o Id não for encontrado", function (done) {
            agent
                .get(`${API_SERVER}/tipo-doc/500`)
                .send()
                .end(function (err, res) {
                    expect(res.status).equal(404);
                    return done();
                });
        });

        it("Deve retornar status 200 se o Id for encontrado e os dados forem listados", function (done) {
            agent
                .get(`${API_SERVER}/tipo-doc/8`)
                .send()
                .end(function (err, res) {
                    expect(res.status).equal(200);
                    return done();
                });
        });
    });
});

const tipodocData = {
    nome: "Factura",
    prefixo: "FT",
    categoria: 6,
    descricao: "kkk",
    empresa: 1,
    usuario_added: 1,
    usuario_updated: 1,
    removido: 0,
};

const tipodocConfigData = {
    move_estoque: 1,
    move_conta_corrente: 1,
    move_a_credito: 1,
    requer_recibo: 1,
    tipo_doc: 1,
    empresa: 1,
    usuario_added: 1,
    usuario_updated: 1,
};

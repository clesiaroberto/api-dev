import { assert as _assert, should as _should, expect } from "chai";
import { agent as _agent } from "superagent";
import "babel-polyfill"; //Precisamos para o beforeEach e afterEach (rollback) funcionar
import { loginUser } from "./auth.test";
import knex from "../src/database/index";
import { describe } from "mocha";

const API_SERVER = "http://localhost:3000";

describe("Teste de Categoria de Estoque", () => {
    describe("/categorias-estoque", function () {
        const agent = _agent();

        before(loginUser(agent));
        // beforeEach(async () => {
        //   await knex("categoria_estoque").insert(categoriaData);
        // });
        // // afterEach(async () => {
        //   await knex("categoria_estoque").delete();
        // });

        it("Deve retornar 409 Se o nome da categoria Já existe!", function (done) {
            agent
                .post(`${API_SERVER}/categorias-estoque`)
                .send({ nome: "Caixas" })
                .end(function (err, res) {
                    expect(res.status).equal(409);
                    return done();
                });
        });

        it("Deve retornar 404 se o Id não for encontrado!", function (done) {
            agent
                .put(`${API_SERVER}/categorias-estoque/1`)
                .send(categoriaData)
                .end(function (err, res) {
                    expect(res.status).equal(404);
                    return done();
                });
        });

        it("Deve retornar 200 se o Id for encontrado e for feita a actualização!", function (done) {
            agent
                .put(`${API_SERVER}/categorias-estoque/9`)
                .send(categoriaData)
                .end(function (err, res) {
                    expect(res.status).equal(200);
                    return done();
                });
        });

        it("Deve retornar 404 porque o Id passado no parâmetro não existe!", function (done) {
            agent
                .delete(`${API_SERVER}/categorias-estoque/1`)
                .send()
                .end(function (err, res) {
                    expect(res.status).equal(404);
                    return done();
                });
        });

        // it("Deve retornar 200 Se o Id existe e os dados forem apagados com sucesso!", function (done) {
        //     agent
        //       .delete(`${API_SERVER}/categorias-estoque/64`)
        //       .send()
        //       .end(function (err, res) {
        //         expect(res.status).equal(200);
        //         return done();
        //       });
        //   });
        it("Deve retornar 404 porque o Id passado no parâmetro não existe!", function (done) {
            agent
                .get(`${API_SERVER}/categorias-estoque/2`)
                .send()
                .end(function (err, res) {
                    expect(res.status).equal(404);
                    return done();
                });
        });

        it("Deve retornar 200 porque o Id existe e os dados foram listados!", function (done) {
            agent
                .get(`${API_SERVER}/categorias-estoque/276`)
                .send()
                .end(function (err, res) {
                    expect(res.status).equal(200);
                    return done();
                });
        });

        it("Deve retornar 404 se o Nome da categoria passada pelo parâmetro não exite", function (done) {
            agent
                .get(`${API_SERVER}/categorias-estoque/nome/Loja`)
                .send()
                .end(function (err, res) {
                    expect(res.status).equal(404);
                    return done();
                });
        });

        it("Deve retornar 200 se o Nome da categoria passada pelo parâmetro existe e dados foram listados!", function (done) {
            agent
                .get(`${API_SERVER}/categorias-estoque/nome/Caixas`)
                .send()
                .end(function (err, res) {
                    expect(res.status).equal(200);
                    return done();
                });
        });
    });
});

const categoriaData = {
    nome: "Caixas",
    descricao: "kkkk",
    empresa: 1,
    usuario_added: 1,
    usuario_updated: 1,
    removido: 0,
};

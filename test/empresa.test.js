import { assert as _assert, should as _should, expect } from "chai";
import { agent as _agent } from "superagent";
import knex from "../src/database/index";
import "babel-polyfill"; //Precisamos para o beforeEach e afterEach (rollback) funcionar
import { loginUser } from "./auth.test";

const API_SERVER = "http://localhost:3000";

describe("Empresa controller", () => {
    describe("/empresas", () => {
        const agent = _agent();

        before(loginUser(agent));
        beforeEach(async () => {
            await knex("empresa").insert(empresaData);
        });
        afterEach(async () => {
            await knex("empresa").delete().where("id", "!=", 1);
        });

        it("Deve retornar sucesso ao listar as empresas", (done) => {
            agent.get(`${API_SERVER}/empresas`).end((err, res) => {
                expect(res.status).equal(200);
                expect(res.body).to.have.a("object");
                return done();
            });
        });

        it("Deve falhar ao tentar criar empresa sem passar os parâmetros", (done) => {
            agent.post(`${API_SERVER}/empresas`).end((err, res) => {
                expect(res.status).equal(422);
                return done();
            });
        });

        it("Deve retornar status 409 se a empresa com mesmo email já estiver cadastrada", (done) => {
            empresaData.nome = "Different";
            agent
                .post(`${API_SERVER}/empresas`)
                .send(empresaData)
                .end((err, res) => {
                    expect(res.status).equal(409);
                    expect(res.body).to.have.a("object");
                    expect(res.body).to.have.property("message");
                    return done();
                });
        });

        it("Deve retornar status 422 se o email não estiver no formato correto", (done) => {
            empresaData.email = "invalid";
            agent
                .post(`${API_SERVER}/empresas`)
                .send(empresaData)
                .end((err, res) => {
                    expect(res.status).equal(422);
                    expect(res.body).to.have.a("object");
                    expect(res.body)
                        .to.have.a("object")
                        .property("isError")
                        .equal(true);
                    return done();
                });
        });

        it("Deve retornar status 200 ao registar empresa com dados corretos", (done) => {
            empresaData.email = "valid@mail.com";
            empresaData.nome = "Valid name";
            agent
                .post(`${API_SERVER}/empresas`)
                .send(empresaData)
                .end((err, res) => {
                    expect(res.status).equal(200);
                    expect(res.body).to.have.a("object");
                    expect(res.body).to.have.a("object").property("data");
                    return done();
                });
        });

        it("Deve retornar status 404 se o Id passado pelo parâmetro não for encontrado", (done) => {
            agent
                .get(`${API_SERVER}/empresas/one/6`)
                .send()
                .end((err, res) => {
                    expect(res.status).equal(404);
                    return done();
                });
        });

        it("Deve retornar status 200 se o Id passado pelo parâmetro for encontrado e os dados forem listados", (done) => {
            agent
                .get(`${API_SERVER}/empresas/one/1`)
                .send()
                .end((err, res) => {
                    expect(res.status).equal(200);
                    return done();
                });
        });

        it("Deve retornar status 404 se o Id passado pelo parâmetro não for encontrado", (done) => {
            agent
                .put(`${API_SERVER}/empresas/10`)
                .send(empresaData)
                .end((err, res) => {
                    expect(res.status).equal(404);
                    return done();
                });
        });

        it("Deve retornar status 400 se uma empresa com  o email informado Já existe", (done) => {
            agent
                .put(`${API_SERVER}/empresas/1`)
                .send(empresaData)
                .end((err, res) => {
                    expect(res.status).equal(400);
                    return done();
                });
        });

        it("Deve retornar status 400 se uma empresa com  o nome informado Já existe", (done) => {
            agent
                .put(`${API_SERVER}/empresas/1`)
                .send(empresaData)
                .end((err, res) => {
                    expect(res.status).equal(400);
                    return done();
                });
        });

        // it("Deve retornar status 200 se os dados forem actualizados com sucesso!", (done) => {
        //   agent
        //     .put(`${API_SERVER}/empresas/1`)
        //     .send(empresaData1)
        //     .end((err, res) => {
        //       expect(res.status).equal(200);
        //       return done();
        //     });
        // });
    });
});

const empresaData = {
    nome: "Teste",
    slogan: "TST",
    nuit: "000000000",
    email: "test@email.com",
    contacto1: "000000000",
    contacto2: "000000001",
    endereco1: "Teste",
    endereco2: "Teste1",
    logotipo: 1,
    usuario_added: 1,
    usuario_updated: 1,
    estado: true,
};

const empresaData1 = {
    nome: "Mozal",
    slogan: "TST",
    nuit: "000000000",
};

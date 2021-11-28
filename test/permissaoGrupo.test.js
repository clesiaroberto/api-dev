import { assert as _assert, should as _should, expect } from "chai";
import { agent as _agent } from "superagent";
import "babel-polyfill"; //Precisamos para o beforeEach e afterEach (rollback) funcionar
import { loginUser } from "./auth.test";
import knex from "../src/database/index";

const API_SERVER = "http://localhost:3000";

describe("Teste de Grupo de Permissoes", () => {
    describe("/grupo/permissoes", function () {
        const agent = _agent();

        before(loginUser(agent));
        beforeEach(async () => {
            await knex("permissao_grupo").insert(permissaoData);
        });
        // afterEach(async () => {
        //   await knex("permissao").delete();
        // });

        it("Deve retornar status 422 se algum campo estiver vazio! ", function (done) {
            agent
                .post(`${API_SERVER}/grupo/permissoes`)
                .send({})
                .end(function (err, res) {
                    expect(res.status).equal(422);
                    return done();
                });
        });

        it("Deve retornar status 200 se os dados forem listados! ", function (done) {
            agent
                .get(`${API_SERVER}/grupo/permissoes`)
                .send({})
                .end(function (err, res) {
                    expect(res.status).equal(200);
                    return done();
                });
        });

        // it("Deve retornar status 400 se o Id não for encontrado! ", function (done) {
        //   agent
        //     .get(`${API_SERVER}/grupo/permissoes/200`)
        //     .send()
        //     .end(function (err, res){
        //       expect(res.status).equal(400);
        //       return done();
        //     });
        // });

        it("Deve retornar status 200 se o Id for encontrado e os dados forem listados! ", function (done) {
            agent
                .get(`${API_SERVER}/grupo/permissoes/1`)
                .send()
                .end(function (err, res) {
                    expect(res.status).equal(200);
                    return done();
                });
        });

        it("Deve retornar 404 se o nome da permissao passado pelo parâmetro não for encontrado", function (done) {
            agent
                .get(`${API_SERVER}/grupo/permissoes/nome/Permissao`)
                .send()
                .end(function (err, res) {
                    expect(res.status).equal(400);
                    return done();
                });
        });

        it("Deve retornar status 200 se o nome da permissao for encontrada!", function (done) {
            agent
                .get(`${API_SERVER}/grupo/permissoes/nome/Nc`)
                .send()
                .end(function (err, res) {
                    expect(res.status).equal(200);
                    return done();
                });
        });
    });
});

const permissaoData = {
    nome: "Nc",
    usuario_added: 1,
    usuario_updated: 1,
};

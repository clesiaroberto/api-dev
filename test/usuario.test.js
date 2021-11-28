import { assert as _assert, should as _should, expect } from "chai";
import { agent as _agent } from "superagent";
import "babel-polyfill"; //Precisamos para o beforeEach e afterEach (rollback) funcionar
import { loginUser } from "./auth.test";
import knex from "../src/database/index";

const API_SERVER = "http://localhost:3000";

describe("Teste de Usuarios", () => {
    describe("/usuarios", function () {
        const agent = _agent();

        before(loginUser(agent));
        beforeEach(async () => {
            await knex("usuario").insert(usuarioData);
        });
        // afterEach(async () => {
        //   await knex("usuario").delete();
        // });

        it("Deve retornar status 422 se algum campo estiver vazio! ", function (done) {
            agent
                .post(`${API_SERVER}/usuarios`)
                .send({})
                .end(function (err, res) {
                    expect(res.status).equal(422);
                    return done();
                });
        });

        it("Deve retornar status 200 se Usuarios forem listados! ", function (done) {
            agent
                .get(`${API_SERVER}/usuarios/`)
                .send()
                .end(function (err, res) {
                    expect(res.status).equal(200);
                    return done();
                });
        });

        it("Deve retornar status 404 se a empresa informada não existe!", function (done) {
            agent
                .post(`${API_SERVER}/usuarios`)
                .send(usuarioData)
                .end(function (err, res) {
                    expect(res.status).equal(404);
                    return done();
                });
        });

        it("Deve retornar status 400 se o e-mail já está cadastrado!", function (done) {
            agent
                .post(`${API_SERVER}/usuarios`)
                .send(usuarioData)
                .end(function (err, res) {
                    expect(res.status).equal(400);
                    return done();
                });
        });

        it("Deve retornar status 404 se o ID não for encontrado!", function (done) {
            agent
                .put(`${API_SERVER}/usuarios/1000`)
                .send(usuarioData1)
                .end(function (err, res) {
                    expect(res.status).equal(404);
                    return done();
                });
        });

        it("Deve retornar status 200 se o ID for encontrado e os dados do usuario for actualizado!", function (done) {
            agent
                .put(`${API_SERVER}/usuarios/20`)
                .send(usuarioData)
                .end(function (err, res) {
                    expect(res.status).equal(200);
                    return done();
                });
        });

        it("Deve retornar status 404 se a empresa nao existe!", function (done) {
            agent
                .post(`${API_SERVER}/usuarios`)
                .send(usuarioData1)
                .end(function (err, res) {
                    expect(res.status).equal(404);
                    return done();
                });
        });

        it("Deve retornar status 400 se o e-mail informado ja existe!", function (done) {
            agent
                .post(`${API_SERVER}/usuarios`)
                .send(usuarioData)
                .end(function (err, res) {
                    expect(res.status).equal(400);
                    return done();
                });
        });

        it("Deve retornar status 400 se o usuario nao for encontrado!", function (done) {
            agent
                .get(`${API_SERVER}/usuarios/avatar/500`)
                .send()
                .end(function (err, res) {
                    expect(res.status).equal(404);
                    return done();
                });
        });

        it("Deve retornar status 400 se Id for do proprio Usuario!", function (done) {
            agent
                .post(`${API_SERVER}/usuarios/1/atualizar-estado`)
                .send({ estado: 1 })
                .end(function (err, res) {
                    expect(res.status).equal(400);
                    return done();
                });
        });

        it("Deve retornar status 404 se Id nao for encontrado!", function (done) {
            agent
                .post(`${API_SERVER}/usuarios/500/atualizar-estado`)
                .send({ estado: 1 })
                .end(function (err, res) {
                    expect(res.status).equal(404);
                    return done();
                });
        });

        it("Deve retornar status 200 se o Usuario for habilitado ou desabilitado com sucesso!", function (done) {
            agent
                .post(`${API_SERVER}/usuarios/25/atualizar-estado`)
                .send({ estado: 1 })
                .end(function (err, res) {
                    expect(res.status).equal(200);
                    return done();
                });
        });

        it("Deve retornar status 200 e listar todos os usuarios com Status 1!", function (done) {
            agent
                .get(`${API_SERVER}/usuarios/estado/1`)
                .send()
                .end(function (err, res) {
                    expect(res.status).equal(200);
                    return done();
                });
        });

        it("Deve retornar status 404 se o Id do Usuário não for encontrado!", function (done) {
            agent
                .post(`${API_SERVER}/usuarios/password-update/500`)
                .send(userPass)
                .end(function (err, res) {
                    expect(res.status).equal(404);
                    return done();
                });
        });

        it("Deve retornar status 400 se a senha actual não está correcta!", function (done) {
            agent
                .post(`${API_SERVER}/usuarios/password-update/22`)
                .send(userPass)
                .end(function (err, res) {
                    expect(res.status).equal(400);
                    return done();
                });
        });

        it("Deve retornar status 400 se a nova senha for igual a senha actual!", function (done) {
            agent
                .post(`${API_SERVER}/usuarios/password-update/30`)
                .send(userPass1)
                .end(function (err, res) {
                    expect(res.status).equal(400);
                    return done();
                });
        });

        // it("Deve retornar status 200 se a senha for alterada com sucesso!", function (done) {
        //   agent
        //     .post(`${API_SERVER}/usuarios/password-update/21`)
        //     .send(userPass2)
        //     .end(function (err, res){
        //       expect(res.status).equal(200);
        //       return done();
        //     });
        // });

        it("Deve retornar status 404 se o Id do Usuário não for encontrado!", function (done) {
            agent
                .patch(`${API_SERVER}/update-password/500`)
                .send()
                .end(function (err, res) {
                    expect(res.status).equal(404);
                    return done();
                });
        });

        it("Deve retornar status 404 se o Id for do Administrador!", function (done) {
            agent
                .patch(`${API_SERVER}/update-password/1`)
                .send()
                .end(function (err, res) {
                    expect(res.status).equal(400);
                    return done();
                });
        });

        // it("Deve retornar status 200 se A senha for alterada com sucesso!", function (done) {
        //   agent
        //     .patch(`${API_SERVER}/update-password/29`)
        //     .send({password: '123456789'})
        //     .end(function (err, res){
        //       expect(res.status).equal(200);
        //       return done();
        //     });
        // });

        it("Deve retornar status 200 se houver sucesso!", function (done) {
            agent
                .get(`${API_SERVER}/me`)
                .send()
                .end(function (err, res) {
                    expect(res.status).equal(200);
                    return done();
                });
        });
    });
});

const usuarioData = {
    nome: "Clesia",
    apelido: "Roberto",
    email: "clesia@yahoo.com",
    contacto1: "123456789",
    contacto2: "147853699",
    imagem: 1,
    password: "12345678",
    empresa: 1,
    usuario_added: 1,
    usuario_updated: 1,
};

const usuarioData1 = {
    nome: "Carla",
    apelido: "Roberto",
    email: "carla@yahoo.com",
    contacto1: "123456789",
    contacto2: "147853699",
    imagem: 1,
    password: "12345678",
    empresa: 6,
    usuario_added: 1,
    usuario_updated: 1,
};

const userPass = {
    senha_actual: "1234567",
    nova_senha: "123456789",
};

const userPass1 = {
    senha_actual: "12345678",
    nova_senha: "12345678",
};

const userPass2 = {
    senha_actual: "12345678",
    nova_senha: "123456",
};

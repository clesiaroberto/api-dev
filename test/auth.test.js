import {
    assert as _assert,
    should as _should,
    use,
    request,
    expect,
} from "chai";
import { agent as _agent } from "superagent";

const API_SERVER = "http://localhost:3000";

describe("Auth controller", () => {
    describe("/auth", () => {
        describe("Com credencias corretas", function () {
            const agent = _agent();
            it("Deve criar a sessão do usuário", loginUser(agent));
        });

        describe("Com credencias erradas", function () {
            const agent = _agent();
            it("Deve ser recusada a criação da sessão", function (done) {
                agent
                    .post(`${API_SERVER}/auth`)
                    .send({ email: "test@dummy.com", password: "wrong" })
                    .end(onResponse);

                function onResponse(err, res) {
                    expect(res.status).to.equal(401);
                    expect(res.body)
                        .to.have.property("message")
                        .equal("Email ou Password incorreto.");
                    expect(res.body).to.have.property("isError").equal(true);
                    return done();
                }
            });
        });
    });
});

export function loginUser(agent) {
    return function (done) {
        agent
            .post(`${API_SERVER}/auth`)
            .send({ email: "admin@ncsoftware.co.mz", password: "12345678" })
            .end(onResponse);

        function onResponse(err, res) {
            expect(res.status).to.equal(200);
            // expect(res.body).to.have.a("object");
            // expect(res.body).to.have.property("data").a("object");
            // expect(res.body).to.have.property("data").property("userId");
            // expect(res.body).to.have.property("data").property("token");
            // expect(res.body).to.have.property("data").property("expiredAt");

            return done();
        }
    };
}

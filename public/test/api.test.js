const request = require("supertest");
const app = require("../../servidor");

describe("API - Login de Aluno", () => {
  test("API001 - Deve fazer login com aluno válido", async () => {
    const resposta = await request(app)
      .post("/api/login/aluno")
      .send({ email: "teste@usp.br", senha: "123456" });

    expect(resposta.status).toBe(200);
    expect(resposta.body.sucesso).toBe(true);
    expect(resposta.body.usuario).toHaveProperty("tipo", "aluno");
  });
});

const crypto = require("crypto");

function md5Hash(senha) {
  return crypto.createHash("md5").update(senha).digest("hex");
}

describe("Função md5Hash", () => {
  test("TU001 - Hash de senha com MD5", () => {
    const resultado = md5Hash("123456");
    expect(resultado).toBe("e10adc3949ba59abbe56e057f20f883e");
  });
});

const express = require("express");
const path = require("path");
const multer = require("multer");
const sqlite3 = require("sqlite3").verbose();
const crypto = require("crypto");
const axios = require("axios");

function md5Hash(senha) {
  return crypto.createHash("md5").update(senha).digest("hex");
}

const dbPath = path.resolve(__dirname, "hubies.db");
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error("Erro ao conectar ao banco de dados:", err.message);
  else console.log("Conectado ao banco de dados SQLite.");
});

db.serialize(() => {
  db.run(
    `CREATE TABLE IF NOT EXISTS alunos (id INTEGER PRIMARY KEY, nome TEXT NOT NULL, email TEXT NOT NULL UNIQUE, senha TEXT NOT NULL, curso TEXT, universidade TEXT, cidade TEXT, uf TEXT, foto_perfil_path TEXT)`
  );
  db.run(
    `CREATE TABLE IF NOT EXISTS empresas (id INTEGER PRIMARY KEY, nome_empresa TEXT NOT NULL, email_corporativo TEXT NOT NULL UNIQUE, senha TEXT NOT NULL, ramo TEXT, logo_path TEXT)`
  );
  db.run(
    `CREATE TABLE IF NOT EXISTS projetos (id INTEGER PRIMARY KEY, texto TEXT NOT NULL, imagem_path TEXT, curso_projeto TEXT, data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP, aluno_id INTEGER, FOREIGN KEY (aluno_id) REFERENCES alunos (id))`
  );
  db.run(
    `CREATE TABLE IF NOT EXISTS avaliacoes (id INTEGER PRIMARY KEY, aluno_id INTEGER, empresa_id INTEGER, projeto_id INTEGER NOT NULL, nota INTEGER NOT NULL CHECK(nota >= 1 AND nota <= 5), comentario TEXT, data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (aluno_id) REFERENCES alunos (id), FOREIGN KEY (empresa_id) REFERENCES empresas (id), FOREIGN KEY (projeto_id) REFERENCES projetos (id), UNIQUE(aluno_id, projeto_id), UNIQUE(empresa_id, projeto_id))`
  );
  db.run(
    `CREATE TABLE IF NOT EXISTS conversas (id INTEGER PRIMARY KEY, aluno_id INTEGER NOT NULL, empresa_id INTEGER NOT NULL, ultimo_update DATETIME DEFAULT CURRENT_TIMESTAMP, UNIQUE(aluno_id, empresa_id), FOREIGN KEY(aluno_id) REFERENCES alunos(id), FOREIGN KEY(empresa_id) REFERENCES empresas(id))`
  );
  db.run(
    `CREATE TABLE IF NOT EXISTS mensagens (id INTEGER PRIMARY KEY, conversa_id INTEGER NOT NULL, remetente_tipo TEXT NOT NULL, remetente_id INTEGER NOT NULL, corpo_mensagem TEXT NOT NULL, data_envio DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY(conversa_id) REFERENCES conversas(id))`
  );
});

const app = express();
const porta = process.env.PORT || 3000;
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "public/uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage: storage });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Servir Arquivos Estáticos ---
// Define a pasta 'public' como o local dos arquivos estáticos (HTML, CSS, JS, Imagens)
app.use(express.static(path.join(__dirname, "public")));

// ----- ROTAS DE API -----
app.get("/api/pesquisa/alunos", (req, res) => {
  const termo = req.query.termo;
  if (!termo || termo.length < 2) return res.json([]);
  const sql = `SELECT id, nome, foto_perfil_path, curso FROM alunos WHERE LOWER(nome) LIKE ? LIMIT 10`;
  db.all(sql, [`%${termo.toLowerCase()}%`], (err, alunos) => {
    if (err) {
      console.error("Erro na busca de alunos:", err.message);
      return res
        .status(500)
        .json({ sucesso: false, mensagem: "Erro ao realizar busca." });
    }
    res.json(alunos);
  });
});

app.post("/api/login/aluno", (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha)
    return res
      .status(400)
      .json({ sucesso: false, mensagem: "E-mail e senha são obrigatórios." });

  const sql = `SELECT * FROM alunos WHERE email = ?`;
  db.get(sql, [email], (err, aluno) => {
    if (err) {
      console.error("DB Error:", err.message);
      return res
        .status(500)
        .json({ sucesso: false, mensagem: "Erro interno do servidor." });
    }
    if (!aluno || aluno.senha !== md5Hash(req.body.senha))
      return res
        .status(401)
        .json({ sucesso: false, mensagem: "E-mail ou senha inválidos." });

    const { senha, ...dadosUsuario } = aluno;
    res.status(200).json({
      sucesso: true,
      mensagem: "Login realizado com sucesso!",
      usuario: { ...dadosUsuario, tipo: "aluno" },
    });
  });
});

app.post("/api/login/empresa", (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha)
    return res
      .status(400)
      .json({ sucesso: false, mensagem: "E-mail e senha são obrigatórios." });

  const sql = `SELECT * FROM empresas WHERE email_corporativo = ?`;
  db.get(sql, [email], (err, empresa) => {
    if (err) {
      console.error("DB Error:", err.message);
      return res
        .status(500)
        .json({ sucesso: false, mensagem: "Erro interno do servidor." });
    }
    if (!empresa || empresa.senha !== md5Hash(senha))
      return res
        .status(401)
        .json({ sucesso: false, mensagem: "E-mail ou senha inválidos." });

    const { senha: senhaEmpresa, ...dadosEmpresa } = empresa;
    res.status(200).json({
      sucesso: true,
      mensagem: "Login de empresa realizado com sucesso!",
      usuario: {
        id: dadosEmpresa.id,
        nome: dadosEmpresa.nome_empresa,
        foto_perfil_path: dadosEmpresa.logo_path,
        tipo: "empresa",
      },
    });
  });
});

app.post("/api/cadastro/aluno", upload.single("fotoPerfil"), (req, res) => {
  const { nome, email, curso, universidade, senha, cidade, uf } = req.body;
  const fotoPath = req.file ? `/uploads/${req.file.filename}` : null;
  const senhaHash = md5Hash(senha);

  const sql = `INSERT INTO alunos (nome, email, senha, curso, universidade, foto_perfil_path, cidade, uf) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
  db.run(
    sql,
    [nome, email, senhaHash, curso, universidade, fotoPath, cidade, uf],
    (err) => {
      if (err)
        return res.status(err.message.includes("UNIQUE") ? 409 : 500).json({
          sucesso: false,
          mensagem: err.message.includes("UNIQUE")
            ? "Este e-mail já está em uso."
            : "Erro ao cadastrar usuário.",
        });
      res.status(201).json({
        sucesso: true,
        mensagem: "Cadastro de aluno realizado com sucesso!",
      });
    }
  );
});

app.post("/api/cadastro/empresa", upload.single("logoEmpresa"), (req, res) => {
  const { nome_empresa, email_corporativo, ramo, senha } = req.body;
  const logoPath = req.file ? `/uploads/${req.file.filename}` : null;
  const senhaHash = md5Hash(senha);
  const sql = `INSERT INTO empresas (nome_empresa, email_corporativo, senha, ramo, logo_path) VALUES (?, ?, ?, ?, ?)`;
  db.run(
    sql,
    [nome_empresa, email_corporativo, senhaHash, ramo, logoPath],
    (err) => {
      if (err)
        return res.status(err.message.includes("UNIQUE") ? 409 : 500).json({
          sucesso: false,
          mensagem: err.message.includes("UNIQUE")
            ? "Este e-mail já está em uso."
            : "Erro ao cadastrar empresa.",
        });
      res.status(201).json({
        sucesso: true,
        mensagem: "Cadastro de empresa realizado com sucesso!",
      });
    }
  );
});

const PROJETOS_QUERY = `
    SELECT p.id, p.texto, p.imagem_path, p.curso_projeto, p.aluno_id as autor_id, 
           a.nome as autor_nome, a.curso as autor_curso, a.foto_perfil_path as autor_foto,
           COALESCE((SELECT AVG(nota) FROM avaliacoes WHERE projeto_id = p.id), 0) as media_avaliacoes,
           COALESCE((SELECT COUNT(id) FROM avaliacoes WHERE projeto_id = p.id), 0) as contagem_avaliacoes,
           COALESCE((SELECT COUNT(id) FROM avaliacoes WHERE projeto_id = p.id AND comentario IS NOT NULL AND comentario != ''), 0) as contagem_comentarios
    FROM projetos p
    LEFT JOIN alunos a ON p.aluno_id = a.id
`;

app.get("/api/projetos", (req, res) => {
  const sql = `${PROJETOS_QUERY} GROUP BY p.id ORDER BY p.data_criacao DESC`;
  db.all(sql, [], (err, projetos) => {
    if (err) {
      console.error("DB Error:", err.message);
      return res
        .status(500)
        .json({ sucesso: false, mensagem: "Erro ao buscar projetos." });
    }
    res.json(projetos);
  });
});

app.post("/api/projetos", upload.single("imagemProjeto"), (req, res) => {
  const { texto, alunoId, curso_projeto } = req.body;
  if (!alunoId)
    return res.status(403).json({
      sucesso: false,
      mensagem: "Usuário não autenticado. Faça o login novamente.",
    });
  if (!texto || !curso_projeto)
    return res.status(400).json({
      sucesso: false,
      mensagem: "O texto e o curso do projeto são campos obrigatórios.",
    });
  const imagemPath = req.file ? `/uploads/${req.file.filename}` : null;
  const sql = `INSERT INTO projetos (texto, imagem_path, aluno_id, curso_projeto) VALUES (?, ?, ?, ?)`;
  db.run(sql, [texto, imagemPath, alunoId, curso_projeto], function (err) {
    if (err) {
      console.error("Erro ao inserir projeto no banco de dados:", err.message);
      return res
        .status(500)
        .json({ sucesso: false, mensagem: "Erro ao criar projeto." });
    }
    res
      .status(201)
      .json({ sucesso: true, mensagem: "Projeto publicado com sucesso!" });
  });
});

app.get("/api/ranking", (req, res) => {
  const cursoFiltro = req.query.curso;
  let sql = `${PROJETOS_QUERY} WHERE p.id IN (SELECT projeto_id FROM avaliacoes)`;
  const params = [];
  if (cursoFiltro && cursoFiltro !== "Todos") {
    sql += " AND p.curso_projeto = ?";
    params.push(cursoFiltro);
  }
  sql +=
    " GROUP BY p.id ORDER BY media_avaliacoes DESC, contagem_avaliacoes DESC LIMIT 20";
  db.all(sql, params, (err, projetos) => {
    if (err) {
      console.error("DB Error:", err.message);
      return res
        .status(500)
        .json({ sucesso: false, mensagem: "Erro ao buscar ranking." });
    }
    res.json(projetos);
  });
});

app.get("/api/alunos/:id", (req, res) => {
  const alunoId = req.params.id;
  const sqlAluno = `SELECT id, nome, curso, universidade, foto_perfil_path, cidade, uf FROM alunos WHERE id = ?`;
  db.get(sqlAluno, [alunoId], (err, aluno) => {
    if (err || !aluno)
      return res
        .status(404)
        .json({ sucesso: false, mensagem: "Aluno não encontrado." });
    const sqlProjetos = `${PROJETOS_QUERY} WHERE p.aluno_id = ? GROUP BY p.id ORDER BY p.data_criacao DESC`;
    db.all(sqlProjetos, [alunoId], (err, projetos) => {
      if (err)
        return res.status(500).json({
          sucesso: false,
          mensagem: "Erro ao buscar projetos do aluno.",
        });
      res.json({ sucesso: true, aluno: aluno, projetos: projetos });
    });
  });
});

app.post("/api/projetos/:id/avaliar", (req, res) => {
  const projetoId = req.params.id;
  const { nota, comentario, usuarioId, tipoUsuario } = req.body;
  if (!usuarioId || !tipoUsuario)
    return res
      .status(403)
      .json({ sucesso: false, mensagem: "Usuário não autenticado." });
  if (!nota || nota < 1 || nota > 5)
    return res.status(400).json({
      sucesso: false,
      mensagem: "A nota deve ser um número entre 1 e 5.",
    });
  const idCampo = tipoUsuario === "aluno" ? "aluno_id" : "empresa_id";
  const deleteSql = `DELETE FROM avaliacoes WHERE projeto_id = ? AND ${idCampo} = ?`;
  db.run(deleteSql, [projetoId, usuarioId], (err) => {
    if (err) {
      console.error("DB Error:", err.message);
      return res
        .status(500)
        .json({ sucesso: false, mensagem: "Erro ao atualizar avaliação." });
    }
    const insertSql = `INSERT INTO avaliacoes (projeto_id, ${idCampo}, nota, comentario) VALUES (?, ?, ?, ?)`;
    db.run(
      insertSql,
      [projetoId, usuarioId, nota, comentario || null],
      (err) => {
        if (err) {
          console.error("DB Error:", err.message);
          return res
            .status(500)
            .json({ sucesso: false, mensagem: "Erro ao salvar avaliação." });
        }
        res
          .status(201)
          .json({ sucesso: true, mensagem: "Avaliação salva com sucesso!" });
      }
    );
  });
});

app.get("/api/projetos/:id/comentarios", (req, res) => {
  const sql = `SELECT av.comentario, av.nota, av.data_criacao, COALESCE(a.nome, e.nome_empresa) as autor_nome, COALESCE(a.foto_perfil_path, e.logo_path) as autor_foto FROM avaliacoes av LEFT JOIN alunos a ON av.aluno_id = a.id LEFT JOIN empresas e ON av.empresa_id = e.id WHERE av.projeto_id = ? AND av.comentario IS NOT NULL AND av.comentario != '' ORDER BY av.data_criacao DESC`;
  db.all(sql, [req.params.id], (err, comentarios) => {
    if (err) {
      console.error("DB Error:", err.message);
      return res
        .status(500)
        .json({ sucesso: false, mensagem: "Erro ao buscar comentários." });
    }
    res.json(comentarios);
  });
});

app.post("/api/chat/iniciar", (req, res) => {
  const { empresaId, alunoId } = req.body;
  if (!empresaId || !alunoId)
    return res.status(400).json({
      sucesso: false,
      mensagem: "IDs de empresa e aluno são necessários.",
    });
  const sql = `INSERT INTO conversas (aluno_id, empresa_id) VALUES (?, ?) ON CONFLICT(aluno_id, empresa_id) DO NOTHING`;
  db.run(sql, [alunoId, empresaId], (err) => {
    if (err)
      return res
        .status(500)
        .json({ sucesso: false, mensagem: "Erro ao iniciar conversa." });
    db.get(
      `SELECT id FROM conversas WHERE aluno_id = ? AND empresa_id = ?`,
      [alunoId, empresaId],
      (err, row) => {
        if (err || !row)
          return res.status(500).json({
            sucesso: false,
            mensagem: "Não foi possível encontrar a conversa.",
          });
        res.status(201).json({ sucesso: true, conversaId: row.id });
      }
    );
  });
});

app.get("/api/chat/conversas", (req, res) => {
  const { usuarioId, tipo } = req.query;
  if (!usuarioId || !tipo)
    return res
      .status(400)
      .json({ sucesso: false, mensagem: "Usuário não autenticado." });
  const sql =
    tipo === "aluno"
      ? `SELECT c.id, c.ultimo_update, e.id as outro_id, e.nome_empresa as outro_nome, e.logo_path as outra_foto FROM conversas c JOIN empresas e ON c.empresa_id = e.id WHERE c.aluno_id = ? ORDER BY c.ultimo_update DESC`
      : `SELECT c.id, c.ultimo_update, a.id as outro_id, a.nome as outro_nome, a.foto_perfil_path as outra_foto FROM conversas c JOIN alunos a ON c.aluno_id = a.id WHERE c.empresa_id = ? ORDER BY c.ultimo_update DESC`;
  db.all(sql, [usuarioId], (err, rows) => {
    if (err)
      return res
        .status(500)
        .json({ sucesso: false, mensagem: "Erro ao buscar conversas." });
    res.json(rows);
  });
});

app.get("/api/chat/conversas/:id", (req, res) => {
  db.all(
    `SELECT * FROM mensagens WHERE conversa_id = ? ORDER BY data_envio ASC`,
    [req.params.id],
    (err, rows) => {
      if (err)
        return res
          .status(500)
          .json({ sucesso: false, mensagem: "Erro ao buscar mensagens." });
      res.json(rows);
    }
  );
});

app.post("/api/chat/conversas/:id/mensagem", (req, res) => {
  const { remetente_tipo, remetente_id, corpo_mensagem } = req.body;
  if (!corpo_mensagem)
    return res
      .status(400)
      .json({ sucesso: false, mensagem: "A mensagem não pode estar vazia." });
  const sql = `INSERT INTO mensagens (conversa_id, remetente_tipo, remetente_id, corpo_mensagem) VALUES (?, ?, ?, ?)`;
  db.run(
    sql,
    [req.params.id, remetente_tipo, remetente_id, corpo_mensagem],
    (err) => {
      if (err)
        return res
          .status(500)
          .json({ sucesso: false, mensagem: "Erro ao enviar mensagem." });
      db.run(
        `UPDATE conversas SET ultimo_update = CURRENT_TIMESTAMP WHERE id = ?`,
        [req.params.id]
      );
      res.status(201).json({ sucesso: true, mensagem: "Mensagem enviada." });
    }
  );
});

app.get("/api/ufs", async (req, res) => {
  try {
    const resp = await axios.get("https://brasilapi.com.br/api/ibge/uf/v1");
    res.json({ sucesso: true, ufs: resp.data });
  } catch (erro) {
    console.error("Erro ao buscar UFs:", erro.message);
    res.status(500).json({ sucesso: false, mensagem: "Erro ao buscar UFs." });
  }
});

app.get("/api/cidades", async (req, res) => {
  const { uf } = req.query;
  if (!uf)
    return res
      .status(400)
      .json({ sucesso: false, mensagem: "UF obrigatória." });

  try {
    const resp = await axios.get(
      `https://brasilapi.com.br/api/ibge/municipios/v1/${uf}`
    );
    res.json({ sucesso: true, cidades: resp.data });
  } catch (erro) {
    console.error("Erro ao buscar cidades:", erro.message);
    res
      .status(500)
      .json({ sucesso: false, mensagem: "Erro ao buscar cidades." });
  }
});

app.get("/", (req, res) => {
  res.redirect("/login.html");
});

app.listen(porta, () => {
  console.log(`Servidor do Hubies rodando em http://localhost:${porta}`);
});

module.exports = app;

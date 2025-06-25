document.addEventListener("DOMContentLoaded", () => {
  const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
  const currentPage = window.location.pathname.split("/").pop() || "login.html";

  const CURSOS_DISPONIVEIS = [
    "Engenharia de Software",
    "Ciência da Computação",
    "Sistemas de Informação",
    "Engenharia da Computação",
    "Design Gráfico",
    "Design Digital",
    "Publicidade e Propaganda",
    "Arquitetura e Urbanismo",
    "Engenharia Civil",
    "Engenharia Mecânica",
    "Engenharia Elétrica",
    "Outro",
  ];

  if (
    !usuarioLogado &&
    !["login.html", "cadastro.html", "cadastro_empresa.html"].includes(
      currentPage
    )
  ) {
    window.location.href = "login.html";
    return;
  }

  if (usuarioLogado) {
    document.querySelectorAll(".foto-perfil").forEach((img) => {
      if (img) img.src = usuarioLogado.foto_perfil_path || "/imagens/logo.png";
    });
    const meuPerfilLinks = document.querySelectorAll(
      "#link-meu-perfil, #link-meu-perfil-nav"
    );
    if (usuarioLogado.tipo === "aluno") {
      meuPerfilLinks.forEach((link) => {
        if (link) link.href = `perfil.html?id=${usuarioLogado.id}`;
      });
    } else {
      meuPerfilLinks.forEach((link) => {
        if (link) link.style.display = "none";
      });
    }
    const botaoLogout = document.getElementById("botao-logout");
    if (botaoLogout) {
      botaoLogout.addEventListener("click", (e) => {
        e.preventDefault();
        localStorage.removeItem("usuarioLogado");
        window.location.href = "login.html";
      });
    }
  }

  const searchInput = document.getElementById("barra-pesquisa-input");
  const searchResultsContainer = document.getElementById("resultados-pesquisa");
  if (searchInput && searchResultsContainer) {
    searchInput.addEventListener("input", async (e) => {
      const termo = e.target.value;
      if (termo.length < 2) {
        searchResultsContainer.classList.remove("visivel");
        return;
      }
      try {
        const res = await fetch(
          `/api/pesquisa/alunos?termo=${encodeURIComponent(termo)}`
        );
        const alunos = await res.json();
        searchResultsContainer.innerHTML = "";
        if (alunos.length > 0) {
          alunos.forEach((aluno) => {
            searchResultsContainer.innerHTML += `<a href="perfil.html?id=${
              aluno.id
            }" class="item-resultado"><img src="${
              aluno.foto_perfil_path || "/imagens/logo.png"
            }" alt="Foto de ${aluno.nome}"><div class="info"><h4>${
              aluno.nome
            }</h4><p>${aluno.curso || ""}</p></div></a>`;
          });
        } else {
          searchResultsContainer.innerHTML =
            '<p style="padding: 10px;" class="texto-secundario">Nenhum aluno encontrado.</p>';
        }
        searchResultsContainer.classList.add("visivel");
      } catch (err) {
        console.error("Erro na busca:", err);
      }
    });
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".caixa-busca-container")) {
        searchResultsContainer.classList.remove("visivel");
      }
    });
  }

  if (currentPage === "login.html") setupLoginPage();
  else if (
    currentPage === "cadastro.html" ||
    currentPage === "cadastro_empresa.html"
  )
    setupCadastroPage(currentPage);
  else if (currentPage === "feed.html") setupFeedPage();
  else if (currentPage === "ranking.html") setupRankingPage();
  else if (currentPage === "perfil.html") setupPerfilPage();
  else if (currentPage === "chat.html") setupChatPage();

  function setupLoginPage() {
    const formAluno = document.getElementById("form-aluno"),
      abaAluno = document.querySelector(".aba-aluno");
    const formEmpresa = document.getElementById("form-empresa"),
      abaEmpresa = document.querySelector(".aba-empresa");
    const mostrarFormulario = (tipo) => {
      formAluno.classList.toggle("visivel", tipo === "aluno");
      formEmpresa.classList.toggle("visivel", tipo === "empresa");
      abaAluno.classList.toggle("ativa", tipo === "aluno");
      abaEmpresa.classList.toggle("ativa", tipo === "empresa");
    };
    abaAluno.addEventListener("click", () => mostrarFormulario("aluno"));
    abaEmpresa.addEventListener("click", () => mostrarFormulario("empresa"));
    const handleLogin = async (endpoint, form) => {
      const data = Object.fromEntries(new FormData(form).entries());
      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const dados = await res.json();
        if (!res.ok) throw new Error(dados.mensagem);
        localStorage.setItem("usuarioLogado", JSON.stringify(dados.usuario));
        window.location.href = "feed.html";
      } catch (err) {
        console.error("Falha no login:", err);
        alert(err.message || "Erro na comunicação com o servidor.");
      }
    };
    formAluno.addEventListener("submit", (e) => {
      e.preventDefault();
      handleLogin("/api/login/aluno", e.target);
    });
    formEmpresa.addEventListener("submit", (e) => {
      e.preventDefault();
      handleLogin("/api/login/empresa", e.target);
    });
  }

  function setupCadastroPage(page) {
    const form = document.querySelector(
      page === "cadastro.html"
        ? "#form-cadastro-aluno"
        : "#form-cadastro-empresa"
    );
    const endpoint =
      page === "cadastro.html"
        ? "/api/cadastro/aluno"
        : "/api/cadastro/empresa";
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (form.senha.value !== form.senha_confirma.value)
        return alert("As senhas não coincidem.");
      try {
        const res = await fetch(endpoint, {
          method: "POST",
          body: new FormData(form),
        });
        const dados = await res.json();
        alert(dados.mensagem);
        if (res.ok) window.location.href = "login.html";
      } catch (err) {
        alert("Ocorreu um erro na comunicação com o servidor.");
      }
    });
  }

  function setupFeedPage() {
    const colunaCentral = document.querySelector(".coluna-central");
    const criarPostCard = document.querySelector(".cartao-criar-post");
    if (usuarioLogado.tipo === "empresa") {
      if (criarPostCard) criarPostCard.style.display = "none";
    } else if (criarPostCard) {
      const selectCurso = document.getElementById("curso-projeto-select");
      CURSOS_DISPONIVEIS.forEach((curso) =>
        selectCurso.add(new Option(curso, curso))
      );
      criarPostCard
        .querySelector(".botao-publicar")
        .addEventListener("click", () => criarNovaPostagem(criarPostCard));
      criarPostCard
        .querySelector("#botaoEscolherImagem")
        .addEventListener("click", (e) => {
          e.preventDefault();
          criarPostCard.querySelector("#inputImagem").click();
        });
    }
    const cardPerfilRapido = document.querySelector(".cartao-perfil-rapido");
    if (cardPerfilRapido) {
      cardPerfilRapido.querySelector("h3").textContent = usuarioLogado.nome;
      cardPerfilRapido.querySelector(".foto-perfil-grande").src =
        usuarioLogado.foto_perfil_path || "/imagens/logo.png";
      if (usuarioLogado.tipo === "aluno")
        cardPerfilRapido.querySelector(".texto-secundario").textContent =
          usuarioLogado.curso;
    }
    const carregarProjetos = async () => {
      try {
        const res = await fetch("/api/projetos");
        if (!res.ok) throw new Error("Não foi possível carregar os projetos.");
        const projetos = await res.json();
        document
          .querySelectorAll(".cartao-postagem")
          .forEach((p) => p.remove());
        projetos.forEach((p) =>
          colunaCentral.appendChild(criarElementoPostagem(p))
        );
      } catch (err) {
        console.error("Erro ao carregar projetos:", err);
      }
    };
    const carregarConversasRecentes = async () => {
      const container = document.getElementById("lista-conversas-feed");
      if (!container) return;
      try {
        const res = await fetch(
          `/api/chat/conversas?usuarioId=${usuarioLogado.id}&tipo=${usuarioLogado.tipo}`
        );
        const conversas = await res.json();
        container.innerHTML = "";
        if (conversas.length > 0) {
          conversas.slice(0, 5).forEach((c) => {
            container.innerHTML += `<a href="chat.html" class="item-conversa"><img src="${
              c.outra_foto || "/imagens/logo.png"
            }" alt="foto"><div><h4>${c.outro_nome}</h4></div></a>`;
          });
        } else {
          container.innerHTML =
            '<p class="texto-secundario" style="padding:10px;">Nenhuma conversa recente.</p>';
        }
      } catch (err) {
        console.error("Erro ao carregar conversas recentes:", err);
      }
    };
    carregarProjetos();
    carregarConversasRecentes();
  }

  async function criarNovaPostagem(card) {
    const areaTexto = card.querySelector("textarea");
    const inputImagem = card.querySelector("#inputImagem");
    const selectCurso = card.querySelector("#curso-projeto-select");
    if (areaTexto.value.trim() === "")
      return alert("O texto do projeto não pode estar vazio.");
    if (selectCurso.value === "")
      return alert("Por favor, selecione o curso relacionado ao projeto.");
    const formData = new FormData();
    formData.append("texto", areaTexto.value);
    formData.append("alunoId", usuarioLogado.id);
    formData.append("curso_projeto", selectCurso.value);
    if (inputImagem.files[0])
      formData.append("imagemProjeto", inputImagem.files[0]);
    try {
      const res = await fetch("/api/projetos", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error((await res.json()).mensagem);
      document.location.reload();
    } catch (err) {
      alert(`Erro ao publicar: ${err.message}`);
    }
  }

  function setupRankingPage() {
    const container = document.getElementById("container-ranking");
    const filtroSelect = document.getElementById("ranking-curso-filtro");
    CURSOS_DISPONIVEIS.forEach((curso) =>
      filtroSelect.add(new Option(curso, curso))
    );
    const carregarRanking = async (curso = "Todos") => {
      container
        .querySelectorAll(".cartao-postagem, .feedback")
        .forEach((el) => el.remove());
      try {
        const res = await fetch(
          `/api/ranking?curso=${encodeURIComponent(curso)}`
        );
        const projetos = await res.json();
        if (projetos.length === 0)
          container.insertAdjacentHTML(
            "beforeend",
            '<p class="texto-secundario feedback cartao-conteudo">Nenhum projeto encontrado para este filtro.</p>'
          );
        else
          projetos.forEach((p, i) =>
            container.appendChild(criarElementoPostagem(p, i + 1))
          );
      } catch (err) {
        console.error("Erro ao carregar ranking:", err);
      }
    };
    filtroSelect.addEventListener("change", () =>
      carregarRanking(filtroSelect.value)
    );
    carregarRanking();
  }

  function setupPerfilPage() {
    const urlId = new URLSearchParams(window.location.search).get("id");
    const alunoId =
      urlId || (usuarioLogado.tipo === "aluno" ? usuarioLogado.id : null);
    if (!alunoId) {
      window.location.href = "feed.html";
      return;
    }
    const carregarPerfil = async () => {
      try {
        const res = await fetch(`/api/alunos/${alunoId}`);
        if (!res.ok) throw new Error("Usuário não encontrado");
        const { aluno, projetos } = await res.json();
        document.title = `Perfil de ${aluno.nome} - Hubies`;
        let botaoChat = "";

        if (usuarioLogado.tipo === "empresa") {
          botaoChat = `<button class="botao-login" id="botao-iniciar-conversa" data-aluno-id="${aluno.id}" style="margin-top: 20px;">Iniciar Conversa</button>`;
        }

        const infoLocal =
          aluno.cidade && aluno.uf
            ? `<p class="texto-secundario" style="font-size: 1rem; margin-top: 5px;"><i class="fas fa-map-marker-alt"></i> ${aluno.cidade} - ${aluno.uf}</p>`
            : "";

        document.getElementById(
          "cabecalho-perfil-usuario"
        ).innerHTML = `<img src="${
          aluno.foto_perfil_path || "/imagens/logo.png"
        }" class="foto-perfil" style="width: 150px; height: 150px; border-radius: 50%;"><h1 style="margin: 15px 0 5px 0;">${
          aluno.nome
        }</h1><p class="texto-secundario" style="font-size: 1.2rem;">${
          aluno.curso
        } - ${aluno.universidade}</p>${infoLocal}${botaoChat}`;

        const listaProjetosDiv = document.getElementById(
          "lista-projetos-perfil"
        );
        listaProjetosDiv.innerHTML = "";
        if (projetos.length > 0)
          projetos.forEach((p) =>
            listaProjetosDiv.appendChild(criarElementoPostagem(p))
          );
        else
          listaProjetosDiv.innerHTML =
            '<p class="texto-secundario" style="padding: 20px 0;">Este usuário ainda não publicou nenhum projeto.</p>';
      } catch (err) {
        document.getElementById("container-perfil").innerHTML =
          "<h1>Usuário não encontrado</h1>";
      }
    };
    carregarPerfil();
  }

  function setupChatPage() {
    const listaConversasDiv = document.getElementById("lista-de-conversas");
    const chatPlaceholder = document.getElementById("chat-placeholder"),
      chatAtivoDiv = document.getElementById("chat-ativo");
    const corpoMensagensDiv = document.getElementById("corpo-mensagens"),
      formEnviarMensagem = document.getElementById("form-enviar-mensagem");
    let conversaAtivaId = null;

    const carregarConversas = async () => {
      try {
        const res = await fetch(
          `/api/chat/conversas?usuarioId=${usuarioLogado.id}&tipo=${usuarioLogado.tipo}`
        );
        const conversas = await res.json();
        listaConversasDiv.innerHTML = "";
        if (conversas.length === 0) {
          listaConversasDiv.innerHTML =
            '<p class="texto-secundario" style="padding: 15px;">Nenhuma conversa encontrada.</p>';
          return;
        }
        conversas.forEach((c) => {
          const div = document.createElement("div");
          div.className = "item-conversa";
          div.dataset.conversaId = c.id;
          div.innerHTML = `<img src="${
            c.outra_foto || "/imagens/logo.png"
          }" alt="foto"><div><h4>${c.outro_nome}</h4></div>`;
          div.addEventListener("click", () =>
            carregarMensagens(c.id, c.outro_nome, c.outra_foto)
          );
          listaConversasDiv.appendChild(div);
        });
      } catch (err) {
        console.error(err);
      }
    };

    const carregarMensagens = async (conversaId, nome, foto) => {
      conversaAtivaId = conversaId;
      document
        .querySelectorAll(".item-conversa.ativa")
        .forEach((el) => el.classList.remove("ativa"));
      document
        .querySelector(`.item-conversa[data-conversa-id='${conversaId}']`)
        .classList.add("ativa");
      chatPlaceholder.style.display = "none";
      chatAtivoDiv.style.display = "flex";
      document.getElementById("chat-ativo-nome").textContent = nome;
      document.getElementById("chat-ativo-foto").src =
        foto || "/imagens/logo.png";
      corpoMensagensDiv.innerHTML =
        '<p class="texto-secundario">Carregando...</p>';
      try {
        const res = await fetch(`/api/chat/conversas/${conversaId}`);
        const mensagens = await res.json();
        corpoMensagensDiv.innerHTML = "";
        mensagens.forEach((m) => {
          const classe =
            m.remetente_id == usuarioLogado.id &&
            m.remetente_tipo == usuarioLogado.tipo
              ? "enviada"
              : "recebida";
          corpoMensagensDiv.innerHTML += `<div class="bolha-mensagem ${classe}">${m.corpo_mensagem}</div>`;
        });
        corpoMensagensDiv.scrollTop = corpoMensagensDiv.scrollHeight;
      } catch (err) {
        console.error(err);
      }
    };

    formEnviarMensagem.addEventListener("submit", async (e) => {
      e.preventDefault();
      const input = document.getElementById("input-mensagem");
      if (!input.value.trim() || !conversaAtivaId) return;
      const corpo_mensagem = input.value;
      input.value = "";

      const div = document.createElement("div");
      div.className = "bolha-mensagem enviada";
      div.textContent = corpo_mensagem;
      corpoMensagensDiv.appendChild(div);
      corpoMensagensDiv.scrollTop = corpoMensagensDiv.scrollHeight;

      try {
        const res = await fetch(
          `/api/chat/conversas/${conversaAtivaId}/mensagem`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              corpo_mensagem,
              remetente_id: usuarioLogado.id,
              remetente_tipo: usuarioLogado.tipo,
            }),
          }
        );
        if (!res.ok) throw new Error("Falha ao enviar mensagem");
      } catch (err) {
        console.error(err);
        div.style.backgroundColor = "#d9534f";
      }
    });

    carregarConversas();
  }

  const modalComentario = document.getElementById("modalComentario");
  if (modalComentario) {
    let projetoIdAtual, notaAtual;
    document.body.addEventListener("click", async (e) => {
      const target = e.target;
      const estrela = target.closest(".estrela");
      const botaoComentar = target.closest(".botao-comentar");
      const botaoIniciarConversa = target.closest("#botao-iniciar-conversa");

      if (estrela) {
        if (!usuarioLogado)
          return alert("Você precisa estar logado para avaliar.");
        if (usuarioLogado.tipo !== "empresa") {
          return alert("Apenas empresas podem avaliar projetos.");
        }
        projetoIdAtual = estrela.closest(".rating-estrelas").dataset.projetoId;
        notaAtual = estrela.dataset.valor;
        document.getElementById("notaModal").textContent = notaAtual;
        modalComentario.showModal();
      } else if (botaoComentar) {
        const cartaoPost = botaoComentar.closest(".cartao-postagem");
        let areaComentarios = cartaoPost.querySelector(".area-comentarios");
        if (!areaComentarios) {
          areaComentarios = document.createElement("div");
          areaComentarios.className = "area-comentarios";
          cartaoPost
            .querySelector(".cartao-conteudo")
            .appendChild(areaComentarios);
        }
        const isOpen = areaComentarios.classList.contains("aberta");
        if (isOpen) {
          areaComentarios.classList.remove("aberta");
        } else {
          areaComentarios.classList.add("aberta");
          if (
            areaComentarios.innerHTML === "" ||
            areaComentarios.children.length === 0
          ) {
            areaComentarios.innerHTML =
              '<p class="texto-secundario">Carregando...</p>';
            try {
              const res = await fetch(
                `/api/projetos/${cartaoPost.dataset.id}/comentarios`
              );
              const comentarios = await res.json();
              areaComentarios.innerHTML = "";
              if (comentarios.length > 0)
                comentarios.forEach(
                  (com) =>
                    (areaComentarios.innerHTML += `<div class="comentario"><img src="${
                      com.autor_foto || "/imagens/logo.png"
                    }" class="foto-perfil-comentario"><div class="comentario-corpo"><strong>${
                      com.autor_nome
                    }</strong><p>${com.comentario}</p></div></div>`)
                );
              else
                areaComentarios.innerHTML =
                  '<p class="texto-secundario">Nenhum comentário ainda.</p>';
            } catch (err) {
              areaComentarios.innerHTML =
                '<p class="texto-secundario">Erro ao carregar comentários.</p>';
            }
          }
        }
      } else if (botaoIniciarConversa) {
        if (!usuarioLogado || usuarioLogado.tipo !== "empresa") return;
        try {
          const res = await fetch("/api/chat/iniciar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              alunoId: botaoIniciarConversa.dataset.alunoId,
              empresaId: usuarioLogado.id,
            }),
          });
          if (!res.ok) throw new Error("Não foi possível iniciar a conversa");
          window.location.href = "chat.html";
        } catch (err) {
          alert(err.message);
        }
      }
    });

    document
      .getElementById("botaoCancelarModal")
      .addEventListener("click", () => modalComentario.close());
    document
      .getElementById("formComentario")
      .addEventListener("submit", async (e) => {
        e.preventDefault();
        try {
          const res = await fetch(`/api/projetos/${projetoIdAtual}/avaliar`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              nota: notaAtual,
              comentario: document.getElementById("textoComentario").value,
              usuarioId: usuarioLogado.id,
              tipoUsuario: usuarioLogado.tipo,
            }),
          });
          if (!res.ok) throw new Error((await res.json()).mensagem);
          alert("Avaliação enviada com sucesso!");
          modalComentario.close();
          document.location.reload();
        } catch (err) {
          alert(`Erro: ${err.message}`);
        }
      });
  }
});

function criarElementoPostagem(projeto, ranking = null) {
  const cartaoPost = document.createElement("div");
  cartaoPost.className = "cartao cartao-postagem";
  cartaoPost.dataset.id = projeto.id;
  const mediaFormatada = parseFloat(projeto.media_avaliacoes).toFixed(1);
  cartaoPost.innerHTML = `
        ${ranking ? `<div class="ranking-posicao">#${ranking}</div>` : ""}
        <div class="cartao-conteudo">
            <div class="autor-post">
                <a href="perfil.html?id=${projeto.autor_id}"><img src="${
    projeto.autor_foto || "/imagens/logo.png"
  }" alt="Foto do Autor" class="foto-perfil"></a>
                <div>
                    <a href="perfil.html?id=${
                      projeto.autor_id
                    }" class="link-autor"><h4>${
    projeto.autor_nome || "Usuário"
  }</h4></a>
                    <p>${
                      projeto.curso_projeto || ""
                    } <span class="texto-secundario">· Postado por ${
    projeto.autor_curso || ""
  }</span></p>
                </div>
            </div>
            <div class="conteudo-post">
                <p>${projeto.texto}</p>
                ${
                  projeto.imagem_path
                    ? `<img src="${projeto.imagem_path}" alt="Imagem do Projeto" class="imagem-post">`
                    : ""
                }
            </div>
            <div class="acoes-postagem">
                <div class="interacoes-post"><i class="fas fa-star"></i><strong>${mediaFormatada}</strong><span class="texto-secundario">(${
    projeto.contagem_avaliacoes
  } avaliações)</span></div>
                <div class="rating-estrelas" data-projeto-id="${projeto.id}">
                    ${[1, 2, 3, 4, 5]
                      .map(
                        (v) =>
                          `<i class="far fa-star estrela" data-valor="${v}"></i>`
                      )
                      .join("")}
                </div>
                <button class="botao-comentar"><i class="far fa-comment"></i> ${
                  projeto.contagem_comentarios
                } Comentar</button>
            </div>
        </div>`;
  return cartaoPost;
}

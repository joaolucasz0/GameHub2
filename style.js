
const formulario = document.getElementById("form-jogo");
const listaJogos = document.getElementById("lista-jogos");
const campoBusca = document.getElementById("busca");
const filtroGenero = document.getElementById("filtro-genero");
const filtroStatus = document.getElementById("filtro-status");
const ordenacao = document.getElementById("ordenacao");
const quantidade = document.getElementById("quantidade");

let jogos = JSON.parse(localStorage.getItem("gamehub-jogos")) || [];
let editandoId = null;

function salvarJogos() {
    localStorage.setItem("gamehub-jogos", JSON.stringify(jogos));
}

function escaparHTML(texto) {
    return String(texto).replace(/[&<>"']/g, caractere => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[caractere]);
}

function renderizarJogos() {
    const busca = campoBusca.value.toLowerCase().trim();
    const genero = filtroGenero.value;
    const status = filtroStatus.value;

    let filtrados = jogos.filter(jogo =>
        jogo.nome.toLowerCase().includes(busca) &&
        (!genero || jogo.genero === genero) &&
        (!status || jogo.status === status)
    );

    filtrados.sort((a, b) => {
        if (ordenacao.value === "ano") return a.ano - b.ano;
        if (ordenacao.value === "nota") return b.nota - a.nota;
        return a.nome.localeCompare(b.nome);
    });

    listaJogos.innerHTML = "";

    filtrados.forEach(jogo => {
        const item = document.createElement("li");

        item.innerHTML = `
            <article>
                <h3>${escaparHTML(jogo.nome)}</h3>
                <p><strong>Gênero:</strong> ${escaparHTML(jogo.genero)}</p>
                <p><strong>Plataforma:</strong> ${escaparHTML(jogo.plataforma)}</p>
                <p><strong>Ano:</strong> ${jogo.ano}</p>
                <p><strong>Minha nota:</strong> ${jogo.nota}/10</p>
                <p><strong>Status:</strong> ${escaparHTML(jogo.status)}</p>
                <details>
                    <summary>Ver descrição</summary>
                    <p>${escaparHTML(jogo.descricao)}</p>
                </details>
                <button type="button" data-acao="editar" data-id="${jogo.id}">
                    Editar
                </button>
                <button type="button" data-acao="excluir" data-id="${jogo.id}">
                    Excluir
                </button>
            </article>
        `;

        listaJogos.appendChild(item);
    });

    quantidade.textContent = jogos.length;

    if (filtrados.length === 0) {
        listaJogos.innerHTML = "<li>Nenhum jogo encontrado.</li>";
    }
}

formulario.addEventListener("submit", evento => {
    evento.preventDefault();

    const dados = new FormData(formulario);

    const jogo = {
        id: editandoId ?? Date.now(),
        nome: dados.get("nome").trim(),
        genero: dados.get("genero"),
        plataforma: dados.get("plataforma"),
        ano: Number(dados.get("ano")),
        nota: Number(dados.get("nota")),
        status: dados.get("status"),
        descricao: dados.get("descricao").trim()
    };

    if (!jogo.nome || !jogo.descricao) {
        alert("Preencha o nome e a descrição do jogo.");
        return;
    }

    if (editandoId !== null) {
        jogos = jogos.map(item => item.id === editandoId ? jogo : item);
        editandoId = null;
        formulario.querySelector('button[type="submit"]').textContent =
            "Cadastrar jogo";
    } else {
        jogos.push(jogo);
    }

    salvarJogos();
    renderizarJogos();
    formulario.reset();
});

listaJogos.addEventListener("click", evento => {
    const botao = evento.target.closest("button[data-acao]");
    if (!botao) return;

    const id = Number(botao.dataset.id);
    const jogo = jogos.find(item => item.id === id);

    if (!jogo) return;

    if (botao.dataset.acao === "excluir") {
        if (confirm(`Deseja excluir "${jogo.nome}"?`)) {
            jogos = jogos.filter(item => item.id !== id);

            if (editandoId === id) {
                editandoId = null;
                formulario.reset();
                formulario.querySelector('button[type="submit"]').textContent =
                    "Cadastrar jogo";
            }

            salvarJogos();
            renderizarJogos();
        }
    }

    if (botao.dataset.acao === "editar") {
        editandoId = id;

        Object.keys(jogo).forEach(campo => {
            const entrada = formulario.elements.namedItem(campo);
            if (entrada) entrada.value = jogo[campo];
        });

        formulario.querySelector('button[type="submit"]').textContent =
            "Salvar alterações";

        document.getElementById("cadastro").scrollIntoView({
            behavior: "smooth"
        });
    }
});

campoBusca.addEventListener("input", renderizarJogos);
filtroGenero.addEventListener("change", renderizarJogos);
filtroStatus.addEventListener("change", renderizarJogos);
ordenacao.addEventListener("change", renderizarJogos);

renderizarJogos();

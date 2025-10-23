const API_BASE_URL = "https://entrevista-front-end-xm3k.onrender.com";
const token = localStorage.getItem("auth_token");

if (!token) {
  alert("Sessão expirada. Faça login novamente.");
  window.location.href = "./index.html";
}

const getHeaders = {
  Authorization: `Bearer ${token}`,
};
const postHeaders = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
};

const ativosTable = document.querySelector("#ativosContatosTable tbody");
const inativosTable = document.querySelector("#inativosContatosTable tbody");
const form = document.querySelector("#contatoForm");
const msg = document.querySelector("#contatoMsg");
const logoutBtn = document.querySelector("#logoutBtn");

// ----------------------------------------------------------------
// Utilitários
// ----------------------------------------------------------------
async function getJSON(url, opts = {}) {
  const res = await fetch(url, opts);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

function renderTableRows(contatos, table, active = true) {
  table.innerHTML = "";
  if (!contatos.length) {
    table.innerHTML = `<tr><td colspan="5" class="text-center text-muted p-2">Nenhum contato ${active ? "ativo" : "inativo"} encontrado</td></tr>`;
    return;
  }
  contatos.forEach((c) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="align-middle">${c.id}</td>
      <td class="align-middle">${c.nome ?? c.name ?? "(sem nome)"}</td>
      <td class="align-middle">${c.email ?? ""}</td>
      <td class="align-middle">${c.telefone ?? c.phone ?? ""}</td>
      <td class="align-middle">
        <button data-id="${c.id}" data-active="${active}" class="toggle-btn btn btn-sm ${active ? "btn-danger" : "btn-success"}">
          ${active ? "Desativar" : "Ativar"}
        </button>
      </td>
    `;
    table.appendChild(tr);
  });
}

// ----------------------------------------------------------------
// Requisições
// ----------------------------------------------------------------
async function getContatosAtivos() {
  try {
    return await getJSON(`${API_BASE_URL}/contatos/ativos`, { headers: getHeaders, cache: "no-store" });
  } catch (err) {
    try {
      return await getJSON(`${API_BASE_URL}/contatos/ativos/`, { headers: getHeaders, cache: "no-store" });
    } catch (err2) {
      throw err2;
    }
  }
}

async function getContatosInativos() {
  try {
    return await getJSON(`${API_BASE_URL}/contatos/inativos`, { headers: getHeaders, cache: "no-store" });
  } catch (err) {
    try {
      return await getJSON(`${API_BASE_URL}/contatos/inativos/`, { headers: getHeaders, cache: "no-store" });
    } catch (err2) {
      // fallback caso o backend esteja com rota /contatos/inaltivos/
      try {
        return await getJSON(`${API_BASE_URL}/contatos/inaltivos/`, { headers: getHeaders, cache: "no-store" });
      } catch (err3) {
        throw err3;
      }
    }
  }
}

async function getContatosTodos() {
  try {
    return await getJSON(`${API_BASE_URL}/contatos`, { headers: getHeaders, cache: "no-store" });
  } catch (err) {
    return await getJSON(`${API_BASE_URL}/contatos/`, { headers: getHeaders, cache: "no-store" });
  }
}

async function carregarContatos() {
  try {
    const ativos = await getContatosAtivos();
    const inativos = await getContatosInativos();
    renderTableRows(ativos, ativosTable, true);
    renderTableRows(inativos, inativosTable, false);
  } catch (err) {
    console.error("Erro ao carregar contatos (rotas específicas):", err);
    // Fallback: tenta carregar todos e filtrar por status
    try {
      const todos = await getContatosTodos();
      const ativos = (todos || []).filter((c) => c?.ativo === true || String(c?.status).toUpperCase() === "ATIVO");
      const inativos = (todos || []).filter((c) => c?.ativo === false || String(c?.status).toUpperCase() === "INATIVO");
      renderTableRows(ativos, ativosTable, true);
      renderTableRows(inativos, inativosTable, false);
      msg.textContent = "Algumas rotas falharam; listagem carregada via fallback.";
      msg.className = "alert alert-warning mt-2";
      msg.classList.remove("d-none");
    } catch (err2) {
      console.error("Erro no fallback de contatos:", err2);
      msg.textContent = `Erro ao carregar contatos: ${err?.message || err}`;
      msg.className = "alert alert-danger mt-2";
      msg.classList.remove("d-none");
    }
  }
}

async function cadastrarContato(e) {
  e.preventDefault();
  msg.textContent = "Cadastrando...";
  msg.className = "alert alert-info mt-2";
  msg.classList.remove("d-none");

  const nome = document.querySelector("#contatoNome").value;
  const email = document.querySelector("#contatoEmail").value;
  const telefone = document.querySelector("#contatoTelefone").value;

  try {
    const res = await fetch(`${API_BASE_URL}/contato/`, {
      method: "POST",
      headers: postHeaders,
      body: JSON.stringify({ nome, email, telefone }),
    });
    if (!res.ok) throw new Error(await res.text());
    msg.textContent = "Contato cadastrado com sucesso!";
    msg.className = "alert alert-success mt-2";
    form.reset();
    await carregarContatos();
  } catch (err) {
    msg.textContent = "Erro ao cadastrar contato";
    msg.className = "alert alert-danger mt-2";
  }
}

async function alterarStatusContato(id, ativo) {
  try {
    const res = await fetch(`${API_BASE_URL}/contato/${id}/status/`, {
      method: "PUT",
      headers: postHeaders,
      body: JSON.stringify({ ativo: !ativo }),
    });
    if (!res.ok) throw new Error(await res.text());
    await carregarContatos();
  } catch (err) {
    alert("Erro ao alterar status do contato");
  }
}

// ----------------------------------------------------------------
// Eventos
// ----------------------------------------------------------------
form?.addEventListener("submit", cadastrarContato);

document.body.addEventListener("click", (e) => {
  if (e.target.classList.contains("toggle-btn")) {
    const id = e.target.dataset.id;
    const ativo = e.target.dataset.active === "true";
    alterarStatusContato(id, ativo);
  }
});

logoutBtn?.addEventListener("click", () => {
  localStorage.removeItem("auth_token");
  window.location.href = "./index.html";
});

// ----------------------------------------------------------------
// Inicialização
// ----------------------------------------------------------------
carregarContatos();
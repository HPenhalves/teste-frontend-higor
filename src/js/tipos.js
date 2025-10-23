const API_BASE_URL = "https://entrevista-front-end-xm3k.onrender.com";
const token = localStorage.getItem("auth_token");

if (!token) {
  alert("Sessão expirada. Faça login novamente.");
  window.location.href = "./index.html";
}

const headers = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
};

const ativosTable = document.querySelector("#ativosTiposTable tbody");
const inativosTable = document.querySelector("#inativosTiposTable tbody");
const form = document.querySelector("#tipoForm");
const msg = document.querySelector("#tipoMsg");
const logoutBtn = document.querySelector("#logoutBtn");

// ----------------------------------------------------------------
// Utilitários
// ----------------------------------------------------------------
async function getJSON(url, opts = {}) {
  const res = await fetch(url, opts);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    const err = new Error(text || `${res.status} ${res.statusText}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

function renderTableRows(tipos, table, active = true) {
  table.innerHTML = "";
  if (!tipos.length) {
    table.innerHTML = `<tr><td colspan="3" class="text-center text-muted p-2">Nenhum tipo ${active ? "ativo" : "inativo"} encontrado</td></tr>`;
    return;
  }
  tipos.forEach((t) => {
    const display = (t.nome ?? t.name ?? t.titulo ?? t.titulo_tipo ?? t.descricao ?? "").toString().trim();
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="align-middle">${t.id}</td>
      <td class="align-middle">${display || "(sem nome)"}</td>
      <td class="align-middle">
        <button data-id="${t.id}" data-active="${active}" class="toggle-btn btn btn-sm ${active ? "btn-danger" : "btn-success"}">
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
async function carregarTipos() {
  try {
    const ativos = await getJSON(`${API_BASE_URL}/tipos/ativos/`, { headers, cache: "no-store" });
    const inativos = await getJSON(`${API_BASE_URL}/tipos/inativos/`, { headers, cache: "no-store" });
    renderTableRows(ativos, ativosTable, true);
    renderTableRows(inativos, inativosTable, false);
  } catch (err) {
    console.error("Erro ao carregar tipos:", err);
    if (err && err.status === 401) {
      alert("Sessão expirada. Faça login novamente.");
      localStorage.removeItem("auth_token");
      window.location.href = "./index.html";
      return;
    }
    renderTableRows([], ativosTable, true);
    renderTableRows([], inativosTable, false);
    if (msg) {
      msg.textContent = "Não foi possível carregar os tipos. Verifique sua conexão ou faça login novamente.";
      msg.className = "alert alert-warning mt-2";
      msg.classList.remove("d-none");
    }
  }
}

async function cadastrarTipo(e) {
  e.preventDefault();
  msg.textContent = "Cadastrando...";
  msg.className = "alert alert-info mt-2";
  msg.classList.remove("d-none");

  const nome = document.querySelector("#tipoNome").value.trim();
  const descricaoEl = document.querySelector("#tipoDescricao");
  const descricao = descricaoEl ? descricaoEl.value.trim() : nome;

  try {
    const res = await fetch(`${API_BASE_URL}/tipo/`, {
      method: "POST",
      headers,
      body: JSON.stringify({ name: nome, descricao, ativo: true }),
    });
    if (!res.ok) throw new Error(await res.text());

    let created = null;
    try {
      created = await res.json();
    } catch {}

    msg.textContent = "Tipo cadastrado com sucesso!";
    msg.className = "alert alert-success mt-2";

    // Se o backend criar como inativo por padrão, ativa aqui
    if (created && typeof created.id !== "undefined" && (created.ativo === false || created.status === "INATIVO")) {
      try {
        await alterarStatusTipo(created.id, false);
      } catch {}
    }

    form.reset();
    await carregarTipos();

    const tabAtivosBtn = document.querySelector('#tab-ativos');
    if (tabAtivosBtn && window.bootstrap?.Tab) {
      new window.bootstrap.Tab(tabAtivosBtn).show();
    } else {
      document.querySelector('#tab-ativos')?.classList.add('active');
      document.querySelector('#tab-cadastrar')?.classList.remove('active');
      document.querySelector('#pane-ativos')?.classList.add('show','active');
      document.querySelector('#pane-cadastrar')?.classList.remove('show','active');
    }
  } catch (err) {
    msg.textContent = `Erro ao cadastrar tipo: ${err.message || err}`;
    msg.className = "alert alert-danger mt-2";
  }
}

async function alterarStatusTipo(id, ativo) {
  try {
    const res = await fetch(`${API_BASE_URL}/tipo/${id}/status/`, {
      method: "PUT",
      headers,
      body: JSON.stringify({ ativo: !ativo }),
    });
    if (!res.ok) throw new Error(await res.text());
    await carregarTipos();
  } catch (err) {
    alert("Erro ao alterar status do tipo");
  }
}

// ----------------------------------------------------------------
// Eventos
// ----------------------------------------------------------------
form?.addEventListener("submit", cadastrarTipo);

document.body.addEventListener("click", (e) => {
  if (e.target.classList.contains("toggle-btn")) {
    const id = e.target.dataset.id;
    const ativo = e.target.dataset.active === "true";
    alterarStatusTipo(id, ativo);
  }
});

logoutBtn?.addEventListener("click", () => {
  localStorage.removeItem("auth_token");
  window.location.href = "./index.html";
});

// ----------------------------------------------------------------
// Inicialização
// ----------------------------------------------------------------
carregarTipos();
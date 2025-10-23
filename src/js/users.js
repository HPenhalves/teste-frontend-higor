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

const ativosTable = document.querySelector("#ativosTable tbody");
const inativosTable = document.querySelector("#inativosTable tbody");
const form = document.querySelector("#userForm");
const msg = document.querySelector("#msg");
const logoutBtn = document.querySelector("#logoutBtn");

// ----------------------------------------------------------------
// Funções utilitárias
// ----------------------------------------------------------------
async function getJSON(url, opts = {}) {
  const res = await fetch(url, opts);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

function renderTableRows(users, table, active = true) {
  table.innerHTML = "";
  if (!users.length) {
    table.innerHTML = `<tr><td colspan="4" class="text-center text-muted p-2">Nenhum usuário ${active ? "ativo" : "inativo"} encontrado</td></tr>`;
    return;
  }
  users.forEach((u) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="align-middle">${u.id}</td>
      <td class="align-middle">${u.nome}</td>
      <td class="align-middle">${u.email}</td>
      <td class="align-middle">
        <button data-id="${u.id}" data-active="${active}" class="toggle-btn btn btn-sm ${active ? "btn-danger" : "btn-success"}">
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
async function carregarUsuarios() {
  try {
    const ativos = await getJSON(`${API_BASE_URL}/usuarios/ativos`, { headers });
    const inativos = await getJSON(`${API_BASE_URL}/usuarios/inativos`, { headers });
    renderTableRows(ativos, ativosTable, true);
    renderTableRows(inativos, inativosTable, false);
  } catch (err) {
    console.error("Erro ao carregar usuários:", err);
  }
}

async function cadastrarUsuario(e) {
  e.preventDefault();
  msg.textContent = "Cadastrando...";
  msg.className = "alert alert-info mt-2";
  msg.classList.remove("d-none");

  const nome = document.querySelector("#nome").value;
  const email = document.querySelector("#email").value;
  const senha = document.querySelector("#senha").value;

  try {
    const res = await fetch(`${API_BASE_URL}/usuario/`, {
      method: "POST",
      headers,
      body: JSON.stringify({ nome, email, senha }),
    });
    if (!res.ok) throw new Error(await res.text());
    msg.textContent = "Usuário cadastrado com sucesso!";
    msg.className = "alert alert-success mt-2";
    form.reset();
    await carregarUsuarios();
  } catch (err) {
    msg.textContent = "Erro ao cadastrar usuário";
    msg.className = "alert alert-danger mt-2";
  }
}

async function alterarStatus(id, ativo) {
  try {
    const res = await fetch(`${API_BASE_URL}/usuario/${id}/status/`, {
      method: "PUT",
      headers,
      body: JSON.stringify({ ativo: !ativo }),
    });
    if (!res.ok) throw new Error(await res.text());
    await carregarUsuarios();
  } catch (err) {
    alert("Erro ao alterar status do usuário");
  }
}

// ----------------------------------------------------------------
// Eventos
// ----------------------------------------------------------------
form?.addEventListener("submit", cadastrarUsuario);

document.body.addEventListener("click", (e) => {
  if (e.target.classList.contains("toggle-btn")) {
    const id = e.target.dataset.id;
    const ativo = e.target.dataset.active === "true";
    alterarStatus(id, ativo);
  }
});

logoutBtn?.addEventListener("click", () => {
  localStorage.removeItem("auth_token");
  window.location.href = "./index.html";
});

// ----------------------------------------------------------------
// Inicialização
// ----------------------------------------------------------------
carregarUsuarios();

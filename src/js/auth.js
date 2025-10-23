import { apiFetch } from "./api.js";

const loginForm = document.querySelector("#loginForm");
const errorMsg = document.querySelector("#errorMsg");

loginForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorMsg?.classList.add("d-none");

  const username = document.querySelector("#username").value;
  const password = document.querySelector("#password").value;

  try {
    const base = (import.meta.env.VITE_API_BASE_URL) || "https://entrevista-front-end-xm3k.onrender.com";
    const body = new URLSearchParams({ username, password }).toString();
    const res = await fetch(`${base}/token/`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });

    const txt = await res.text().catch(() => null);
    let data;
    try { data = txt ? JSON.parse(txt) : null; } catch { data = null; }

    if (!res.ok) {
      const msg = (data && (data.detail || data.message)) || txt || "Usuário ou senha inválidos";
      throw new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
    }

    const token = (data && (data.access_token || data.access || data.token)) || data;

    if (!token) throw new Error("Token não retornado pelo servidor");

    localStorage.setItem("auth_token", token);
    window.location.href = "/dashboard.html";
  } catch (err) {
    errorMsg.textContent = err.message || String(err);
    errorMsg.classList.remove("d-none");
  }
});

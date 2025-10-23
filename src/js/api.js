const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL) || "https://entrevista-front-end-xm3k.onrender.com";

export async function apiFetch(path, opts = {}) {
  const token = localStorage.getItem("auth_token");
  const headers = Object.assign(
    { "Content-Type": "application/json" },
    opts.headers || {}
  );
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...opts,
    headers,
  });

  // opcional: detectar 401 e forçar logout
  if (res.status === 401) {
    localStorage.removeItem("auth_token");
    window.location.href = "/";
    return;
  }

  const text = await res.text().catch(() => null);
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return text;
  }
}

const token = localStorage.getItem("auth_token");
if (token) {
  // Redireciona para o dashboard após 2 segundos na tela inicial
  setTimeout(() => {
    window.location.href = "/dashboard.html";
  }, 2000);
}
Teste Frontend Higor — README (texto)

VISÃO GERAL
- Frontend em Vite/Bootstrap para gerenciamento de Usuários, Tipos e Contatos.
- Inclui página de Relatórios com gráficos.
- Tema visual em verde escuro, hover preto para links e "strong".

REQUISITOS
- Node.js 18+ e npm 9+ (recomendado)
- API acessível e configurável via variável de ambiente VITE_API_BASE_URL

INSTALAÇÃO
1) No terminal, na raiz do projeto:
   npm install

EXECUÇÃO (DESENVOLVIMENTO)
1) Inicie o servidor de desenvolvimento:
   npm run dev
2) Acesse no navegador:
   http://localhost:5173/
3) Páginas principais:
   - index.html (login)
   - dashboard.html
   - usuarios.html
   - tipos.html
   - contatos.html
   - relatorios.html

BUILD E PREVIEW (PRODUÇÃO)
1) Gerar build:
   npm run build
2) Servir o build localmente:
   npm run preview
- O build fica em: dist/

CONFIGURAÇÃO DE AMBIENTE
- Vite lê variáveis com prefixo VITE_.
- Crie um arquivo .env na raiz com:
  VITE_API_BASE_URL=https://entrevista-front-end-xm3k.onrender.com
- Fallback no código (src/js/api.js):
  const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL) || "https://entrevista-front-end-xm3k.onrender.com";

FLUXO DE AUTENTICAÇÃO
- Login em index.html grava token no localStorage (chave: auth_token).
- dashboard.html valida a sessão e direciona para usuarios.html.
- Páginas de gestão verificam token; em caso de 401, limpam token e redirecionam para index.

PÁGINAS E FUNCIONALIDADES
- usuarios.html: cadastro/lista, abas Ativos e Inativos, mudar status.
- tipos.html: cadastro/lista de tipos, abas Ativos e Inativos.
- contatos.html: cadastro/lista de contatos, abas Ativos e Inativos.
- relatorios.html: gráficos (linhas, donut, barras) a partir de dados da API.

ESTILOS E TEMA
- Base em src/styles.css + Bootstrap 5.
- Links padrão: verde escuro (#006400). Hover de links e strong: preto.
- Botões primários em verde escuro com estados de hover/active/focus.
- Tabelas com listras/hover verdes translúcidas e bordas inferiores sutis.

INTEGRAÇÃO COM API
- Base configurável via VITE_API_BASE_URL.
- src/js/*.js realiza fetch para endpoints e popula tabelas/visões.
- Tratamento de 401: redireciona para login e limpa token.

TROUBLESHOOTING
- Lista vazia:
  * Verifique console do navegador e o terminal.
  * Cheque VITE_API_BASE_URL e conexão com a API.
  * Refaça o login para renovar o token.
- Hover com cor errada:
  * Confirme regras de a:hover e strong:hover nas páginas e em src/styles.css.
- Build falhou:
  * Rode npm install novamente.
  * Verifique versão do Node e dependências.

SCRIPTS DISPONÍVEIS
- npm run dev: inicia servidor de desenvolvimento (Vite).
- npm run build: compila para produção (gera dist/).
- npm run preview: serve a pasta dist/ para validação.

ESTRUTURA DE PASTAS
- index.html, usuarios.html, tipos.html, contatos.html, relatorios.html, dashboard.html
- src/styles.css (estilos globais)
- src/js (scripts por página e api.js)
- public/images (imagens de fundo)
- public/data (dados estáticos, se necessário)

CUSTOMIZAÇÃO
- Ajuste cores e hover em src/styles.css e nos blocos <style> das páginas.
- Modifique VITE_API_BASE_URL em .env para apontar para outra API.
- Publique servindo dist/ em qualquer servidor estático.

EXEMPLOS DE .env
- Desenvolvimento local (.env):
  VITE_API_BASE_URL=http://localhost:8000
- Produção (.env.production):
  VITE_API_BASE_URL=https://api.seudominio.com
- Padrão do projeto:
  VITE_API_BASE_URL=https://entrevista-front-end-xm3k.onrender.com
Observações:
- Vite só expõe variáveis prefixadas com VITE_.
- Rotas com ou sem barra final são toleradas pelo frontend.

ENDPOINTS DA API (ESPERADOS)
Autenticação
- POST /token/ (form-urlencoded: username, password)
- Respostas aceitas: {"access_token":"..."}, {"access":"..."}, {"token":"..."}
- Exemplo:
  curl -X POST "$VITE_API_BASE_URL/token/" -H "Content-Type: application/x-www-form-urlencoded" -d "username=admin&password=123456"

Usuários
- GET /usuarios/ativos | /usuarios/ativos/
- GET /usuarios/inativos | /usuarios/inativos/
- POST /usuario/ — body: {nome, email, senha}
- PUT /usuario/{id}/status/ — body: {ativo: true|false}
- Exemplo:
  curl "$VITE_API_BASE_URL/usuarios/ativos" -H "Authorization: Bearer <TOKEN>"
  curl -X POST "$VITE_API_BASE_URL/usuario/" -H "Content-Type: application/json" -H "Authorization: Bearer <TOKEN>" --data '{"nome":"Fulano","email":"fulano@ex.com","senha":"123456"}'

Tipos
- GET /tipos/ativos/
- GET /tipos/inativos/
- POST /tipo/ — body: {name, descricao, ativo}
- PUT /tipo/{id}/status/ — body: {ativo: true|false}
- Exemplo:
  curl "$VITE_API_BASE_URL/tipos/ativos/" -H "Authorization: Bearer <TOKEN>"
  curl -X POST "$VITE_API_BASE_URL/tipo/" -H "Content-Type: application/json" -H "Authorization: Bearer <TOKEN>" --data '{"name":"Cliente","descricao":"...","ativo":true}'

Contatos
- GET /contatos/ativos | /contatos/ativos/
- GET /contatos/inativos | /contatos/inativos/ (fallback: /contatos/inaltivos/)
- GET /contatos | /contatos/
- POST /contato/ — body: {nome, email, telefone}
- PUT /contato/{id}/status/ — body: {ativo: true|false}
- Exemplo:
  curl "$VITE_API_BASE_URL/contatos/ativos" -H "Authorization: Bearer <TOKEN>"
  curl -X POST "$VITE_API_BASE_URL/contato/" -H "Content-Type: application/json" -H "Authorization: Bearer <TOKEN>" --data '{"nome":"Contato","email":"email@ex.com","telefone":"99999-9999"}'

Notas de contrato
- Listagens retornam arrays de objetos com: id, nome/name, email/telefone (contatos), descricao (tipos), ativo (boolean) ou status (ATIVO/INATIVO).
- Em 401, a sessão expira: o frontend limpa auth_token e redireciona para login.


# Teste Frontend Higor — README

Este projeto é um frontend em Vite/Bootstrap para gerenciamento de Usuários, Tipos e Contatos, com página de Relatórios. O tema visual utiliza verde escuro (links e botões) e integra com uma API configurável via variável de ambiente.

## Visão Geral
- Páginas: `index.html` (login), `dashboard.html`, `usuarios.html`, `tipos.html`, `contatos.html`, `relatorios.html`.
- Estilos: `src/styles.css` + ajustes inline em cada página.
- Scripts: `src/js/*` (um arquivo por página) e `src/js/api.js` para base da URL da API.
- Dependências principais: Vite, Bootstrap 5, Chart.js (em Relatórios), TypeScript (para o scaffold padrão do Vite).

## Requisitos
- Node.js 18+ e npm 9+ (recomendado)
- Acesso à API configurada em `VITE_API_BASE_URL`

## Instalação
```bash
npm install
```

## Execução (Desenvolvimento)
```bash
npm run dev
```
- Acesse `http://localhost:5173/`.
- Você pode navegar diretamente para as páginas: `usuarios.html`, `tipos.html`, `contatos.html`, `relatorios.html`. 
- Sem token, algumas páginas redirecionam para `index.html`.

## Build e Preview (Produção)
```bash
npm run build
npm run preview
```
- O build gera a pasta `dist/` com os arquivos estáticos.
- O preview serve o build em um servidor local para validação.

## Configuração de Ambiente
- Variáveis via `import.meta.env` (Vite) usando prefixo `VITE_`.
- Arquivo `.env` na raiz (exemplo):
```
VITE_API_BASE_URL=https://entrevista-front-end-xm3k.onrender.com
```
- Fallback padrão no código: `src/js/api.js`
```
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL) || "https://entrevista-front-end-xm3k.onrender.com";
```

## Fluxo de Autenticação
- Login em `index.html` grava o token no `localStorage` (`auth_token`).
- `dashboard.html` valida a sessão e redireciona para `usuarios.html`.
- Páginas de gestão verificam o token; em caso de `401` (token inválido/expirado), redirecionam para `index.html` e limpam o token.

## Páginas e Funcionalidades
- `usuarios.html`: cadastro, listagem, abas de **Ativos** e **Inativos**, alteração de status.
- `tipos.html`: cadastro de tipos, abas de **Ativos** e **Inativos** com robustez na exibição do nome.
- `contatos.html`: cadastro e listagem com abas de **Ativos** e **Inativos**.
- `relatorios.html`: gráficos com **Chart.js** (linhas, donut, barras empilhadas) a partir dos dados fornecidos pela API.

## Estilos e Tema
- Base em `src/styles.css` + Bootstrap 5.
- Cores:
  - Links padrão: `#006400` (verde escuro).
  - Hover de links e `strong`: preto (`#000`).
  - Botões primários: verde escuro (`#006400`) com variações de hover/active/focus.
- Tabelas: listras e hover com verde translúcido (harmonizadas com o fundo) e bordas leves para separar linhas.
- Imagens de fundo por página estão em `public/images`.

## Integração com API
- Base configurável (`API_BASE_URL`).
- Os arquivos em `src/js/*.js` realizam `fetch` para endpoints da API e populam as tabelas/visões.
- Em caso de erro (ex.: `401`), o fluxo informa o usuário e/ou redireciona para login.

## Troubleshooting
- "Nada aparece na lista":
  - Verifique o console do navegador e o terminal.
  - Cheque se `VITE_API_BASE_URL` está correto e acessível.
  - Faça login novamente para renovar o token.
- "Hover com cor errada":
  - Confirme as regras de `a:hover` e `strong:hover` nas páginas e em `src/styles.css` (tema claro).
- "Build falhou":
  - Rode `npm install` novamente.
  - Verifique versão do Node e compatibilidade das dependências.

## Scripts Disponíveis
- `npm run dev`: inicia o servidor de desenvolvimento (Vite).
- `npm run build`: compila o projeto para produção (gera `dist/`).
- `npm run preview`: serve a pasta `dist/` para validação.

## Estrutura de Pastas
- `index.html`, `usuarios.html`, `tipos.html`, `contatos.html`, `relatorios.html`, `dashboard.html`: páginas principais.
- `src/styles.css`: estilos globais.
- `src/js`: lógicas específicas por página e configuração da API.
- `public/images`: imagens de fundo.
- `public/data`: dados estáticos de apoio (se necessário).

## Customização
- Ajuste cores e comportamento de hover em `src/styles.css` e nos blocos `<style>` das páginas.
- Para alterar a base da API, configure `VITE_API_BASE_URL` em `.env`.
- Para publicar, sirva a pasta `dist/` em qualquer servidor de arquivos estáticos.

## Exemplos de .env
- `.env` (desenvolvimento local):
```
VITE_API_BASE_URL=http://localhost:8000
```
- `.env.production` (produção):
```
VITE_API_BASE_URL=https://api.seudominio.com
```
- Padrão (já incluído no projeto):
```
VITE_API_BASE_URL=https://entrevista-front-end-xm3k.onrender.com
```
Observações:
- Apenas variáveis com prefixo `VITE_` ficam disponíveis no frontend via `import.meta.env`.
- A API pode aceitar rotas com ou sem barra final; o frontend tolera ambos.

## Endpoints da API (esperados)
- Autenticação
  - `POST /token/` (form-urlencoded: `username`, `password`)
  - Respostas aceitas: `{"access_token":"..."}`, `{ "access": "..." }`, `{ "token": "..." }`
  - Exemplo:
```
curl -X POST "$VITE_API_BASE_URL/token/" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin&password=123456"
```
- Usuários
  - `GET /usuarios/ativos` | `GET /usuarios/ativos/`
  - `GET /usuarios/inativos` | `GET /usuarios/inativos/`
  - `POST /usuario/` — body: `{ "nome": "Fulano", "email": "fulano@ex.com", "senha": "123456" }`
  - `PUT /usuario/{id}/status/` — body: `{ "ativo": true | false }`
  - Exemplo:
```
curl "$VITE_API_BASE_URL/usuarios/ativos" -H "Authorization: Bearer <TOKEN>"
curl -X POST "$VITE_API_BASE_URL/usuario/" \
  -H "Content-Type: application/json" -H "Authorization: Bearer <TOKEN>" \
  --data '{"nome":"Fulano","email":"fulano@ex.com","senha":"123456"}'
```
- Tipos
  - `GET /tipos/ativos/`
  - `GET /tipos/inativos/`
  - `POST /tipo/` — body: `{ "name": "Cliente", "descricao": "opcional", "ativo": true }`
  - `PUT /tipo/{id}/status/` — body: `{ "ativo": true | false }`
  - Exemplo:
```
curl "$VITE_API_BASE_URL/tipos/ativos/" -H "Authorization: Bearer <TOKEN>"
curl -X POST "$VITE_API_BASE_URL/tipo/" \
  -H "Content-Type: application/json" -H "Authorization: Bearer <TOKEN>" \
  --data '{"name":"Cliente","descricao":"...","ativo":true}'
```
- Contatos
  - `GET /contatos/ativos` | `GET /contatos/ativos/`
  - `GET /contatos/inativos` | `GET /contatos/inativos/` (fallback aceito: `/contatos/inaltivos/`)
  - `GET /contatos` | `GET /contatos/`
  - `POST /contato/` — body: `{ "nome": "Contato", "email": "email@ex.com", "telefone": "99999-9999" }`
  - `PUT /contato/{id}/status/` — body: `{ "ativo": true | false }`
  - Exemplo:
```
curl "$VITE_API_BASE_URL/contatos/ativos" -H "Authorization: Bearer <TOKEN>"
curl -X POST "$VITE_API_BASE_URL/contato/" \
  -H "Content-Type: application/json" -H "Authorization: Bearer <TOKEN>" \
  --data '{"nome":"Contato","email":"email@ex.com","telefone":"99999-9999"}'
```
Notas de contrato:
- Listagens retornam arrays com objetos contendo `id`, `nome`/`name`, `email`/`telefone` (contatos), `descricao` (tipos), e `ativo` (boolean) ou `status` (`ATIVO`/`INATIVO`).
- Respostas `401` devem ser usadas para expirar sessão; o frontend limpa `auth_token` e redireciona para login.
---
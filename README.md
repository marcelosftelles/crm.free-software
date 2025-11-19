# CRM free OS — Gestão de Ordens de Serviço

Ferramenta gratuita e totalmente open source para assistências técnicas iniciantes gerarem, organizarem e armazenarem OS sem depender de servidor.

## Para quem é
- Assistências técnicas e técnicos autônomos que precisam de um controle simples de OS, histórico e geração de PDF/CSV.

## Funcionalidades
- Cadastro e edição de OS com logo personalizada.
- Filtro, busca e ordenação (mais recentes/mais antigos).
- Impressão da OS em PDF com logo destacada.
- Exportação/importação em CSV.
- Armazenamento local em localStorage (funciona offline).

## Como usar (modo web/offline)
1. Extraia o projeto em uma pasta local.
2. (Opcional) Substitua `assets/print-logo.png` ou carregue sua logo pelo botão “Logo”.
3. Abra `index.html` no navegador.
4. Cadastre/edite OS, filtre, exporte/import CSV e imprima/salve o PDF.

## Como gerar o instalador (.exe)
Pré-requisitos:
- Node.js v18+ e npm.
- Bibliotecas já declaradas: `electron`, `electron-builder` (instaladas via `npm install`).

Passo a passo:
1. Instale dependências: `npm install`.
2. Rodar modo dev (opcional): `npm start`.
3. Gerar o instalador Windows: `npm run dist` (saída em `dist/`).

## Estrutura
- `index.html` — página principal.
- `css/styles.css` — estilos e regras de impressão.
- `js/utils.js` — utilitários (formatação BRL, datas, ID aleatório).
- `js/storage.js` — persistência local + export/import CSV + seed de exemplo.
- `js/print.js` — montagem e impressão/geração de PDF.
- `js/app.js` — lógica de interface e eventos.
- `main.js` / `preload.js` — bootstrap do app Electron.

Tudo funciona offline e sem servidor. Pull requests são bem-vindos.

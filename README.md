# em-quem-votar

Aplicação web de informação eleitoral para as eleições de 2026, apresentando candidatos de forma neutra, clara e comparável. **Todos os dados são fictícios** e marcados como "Dados demonstrativos para o MVP".

> MVP em React + Vite + JavaScript, sem backend. Os dados ficam em arquivos locais em `src/data/`.

## Funcionalidades

- Página inicial com navegação por cargo (Presidente / Governador)
- Lista de candidatos com busca e filtro por ideologia
- Perfil do candidato (Bio, Propostas, Finanças, Histórico)
- Quiz de afinidade que compara suas opiniões às posições dos candidatos (sem recomendar voto)

## Rodando localmente

```bash
npm install
npm run dev      # servidor de desenvolvimento (http://localhost:5173)
npm run build    # build de produção em dist/
npm test         # suíte de testes (Vitest)
```

## Publicação

O deploy para o GitHub Pages é automático via GitHub Actions a cada push na branch `main`
(veja `.github/workflows/deploy.yml`). O app usa `HashRouter`, então as rotas funcionam
no GitHub Pages sem configuração adicional de servidor.

## Aviso

Projeto demonstrativo. Nomes, partidos, números e biografias são inventados e não
representam pessoas ou organizações reais.

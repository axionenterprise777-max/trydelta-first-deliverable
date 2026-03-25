# TODO Prompts

- [ ] 2026-03-05 - Prompt: descobrir motivo do 503 no trydelta.axionenterprise.cloud, corrigir para Passenger e fazer deploy com validacao | Acao: identificar causa, ajustar startup/entrypoint, validar build e publicar.
- [ ] 2026-03-04 - Prompt: versao frontend-only com mocks em pasta separada + deploy e validacao | Acao: preparar mock funcional local, publicar e validar URL.
- [x] 2026-03-04 - Prompt: corrigir erro de rerender com border/borderColor no dashboard e JSON parse no login | Acao: unificar propriedades de borda no menu ativo e tratar body JSON invalido nas rotas de sessao.
- [x] 2026-03-04 - Prompt: dashboard exibindo "Falha ao carregar o dashboard." | Acao: robustecer parse do payload no carregamento do workspace, redirecionar em 401 e ajustar set de cookie na rota /api/workspace.
- [x] 2026-03-04 - Prompt: erro MODULE_NOT_FOUND em .next/server/pages/_document.js (./799.js) com /login e /icon.svg retornando 500 | Acao: reconstruir artefatos Next e orientar reinicio limpo do servidor para eliminar cache/build inconsistente.
- [x] 2026-03-04 - Prompt: rodar testes, deixar preview apresentavel para cliente, reduzir complexidade/backend para mock e alinhar espacamento no topo | Acao: simplificar copy e layout para demo, reduzir padding superior, remover bloqueio server-side no dashboard e adicionar fallback mock no login/dashboard/contato.
- [ ] 2026-03-04 - Prompt: analisar SANDBOX e comparar apps Axion (porta, ambiente, configuracao node) com trydelta, entregar diagnostico | Acao: levantar diferencas de runtime, build e deploy sem alterar codigo.

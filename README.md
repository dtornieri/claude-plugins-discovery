# Claude Discovery

Single-file HTML para Claude Code — plugins, servidores MCP, mapa de conversas. Tudo no navegador.

🔗 https://dtornieri.github.io/claude-plugins-discovery/

## Funcionalidades

- **Marketplace navegável dos 203 plugins do Claude Code**, com sincronização automática via GitHub Actions contra o repositório oficial da Anthropic.

- **Catálogo público dos 30 servidores MCP**, com favoritos persistidos no `localStorage` e deep-link de instalação em um clique.

- **Mapa das conversas do Claude** a partir do export local que cada pessoa carrega: categorização automática por tema, heatmap diário, timeline cronológica, busca textual.

- **Grafo interativo de relações entre conversas**, com clusters por categoria e cross-links que mostram quando temas distintos se tocam.

- **IA semântica (opcional):** um botão baixa um modelo de embeddings multilíngue (~120MB, cache do navegador, uma vez só), calcula o vetor de cada conversa local e troca o critério de cross-link de "palavras compartilhadas" para "similaridade real entre temas". Tudo rodando no navegador.

## Arquitetura

Sem backend, sem banco, sem login. Nada sobe para servidor. Quem quiser hospedar para outras pessoas serve o HTML em qualquer lugar — cada visitante carrega o próprio export.

Versão atual: **2.489 linhas. Um arquivo só.**

## Links

- **Demo:** https://dtornieri.github.io/claude-plugins-discovery/
- **Repositório:** https://github.com/dtornieri/claude-plugins-discovery

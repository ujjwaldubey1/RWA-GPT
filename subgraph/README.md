RWA-GPT Subgraph (Amoy)

Prereqs

- Node.js LTS
- Install CLI: npm i -g @graphprotocol/graph-cli (or use local via npx)
- Authenticate: graph auth --studio <ACCESS_TOKEN>

Update config

- Paste deployed Amoy contract address and deployment block into subgraph.yaml where marked.

Commands

```
# from subgraph/
npm install
npm run codegen
npm run build
npm run deploy
```

Notes

- network: amoy in subgraph.yaml
- After deploy, copy Queries URL → set SUBGRAPH_URL in backend/.env

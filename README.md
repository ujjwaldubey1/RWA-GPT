# RWA-GPT

RWA-GPT is an AI-powered conversational agent for the Real-World Asset (RWA) ecosystem. It aims to let users discover, analyze, and invest in RWAs using natural language, targeting prizes from Fetch.ai (agent), The Graph (indexing), and 1inch (execution) at ETHGlobal New Delhi.

## Monorepo Structure

- `frontend`: Next.js + TypeScript + Tailwind app
- `backend`: Python Fetch.ai uAgents agent
- `subgraph`: The Graph Protocol subgraph

## Frontend

Prereqs: Node 18+.

Setup and run:

```bash
cd frontend
pnpm install
pnpm run dev
```

## Backend

Prereqs: Python 3.11+ and `uv`.

Setup and run:

```bash
cd backend
uv venv
uv pip install uagents

# run the agent
python agent.py
```

## Subgraph

This subgraph targets Polygon Mumbai and indexes events from a hypothetical RWA Private Credit contract.

Files:

- `subgraph/schema.graphql`
- `subgraph/subgraph.yaml`
- `subgraph/src/mapping.ts`
- `subgraph/abis/RWAPrivateCredit.json`

Basic local steps:

```bash
cd subgraph
# Install Graph CLI if needed
npm i -g @graphprotocol/graph-cli
# codegen/build (ABI and handlers already scaffolded)
graph codegen
graph build
```

Update the contract address in `subgraph.yaml` before deploy. For Studio:

```bash
graph auth --studio <DEPLOY_KEY>
graph deploy --studio <SUBGRAPH_NAME>
```

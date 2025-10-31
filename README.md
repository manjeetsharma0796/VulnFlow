# VulnFlow Frontend

AI-assisted smart contract security auditing on Flow EVM Testnet.

## Prerequisites
- Bun (or Node 18+)

## Setup
1. Copy environment:
   - Create `.env` and set:
     - `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id`
     - `AI_API_URL=https://your-ai-api.example.com/analyze`
2. Install deps:
```bash
bun install
```
3. Run dev:
```bash
bun run dev
```

## Contracts
Addresses loaded from `config/contracts.json` and ABIs from `abis/`.

## Pages
- `/` Landing
- `/app` Dashboard (editor, analyze, results, auto-fix)
- `/claim` Daily VFT claim
- `/wallet` Wallet and token balance

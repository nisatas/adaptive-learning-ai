# NeuroAdapt Backend

Node.js + Express + TypeScript API for NeuroAdapt AI.

## Setup

```bash
npm install
cp .env.example .env
# Edit .env with Puq.ai variables when available
```

## Development

```bash
npm run dev
```

Server runs at `http://localhost:4000`.

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/ai/status` | Puq.ai configuration status |

## Environment

See `.env.example` for required variables. Never commit `.env`.

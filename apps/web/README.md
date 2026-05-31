# EcomPilot Web (Phase 4)

Next.js 15 App Router — migration progressive du dashboard marchand.

## Démarrage

```bash
cd apps/web
npm install
npm run dev
```

Ouvrir http://localhost:3002 — login avec le même compte que Vite.

## Routes migrées

| Route | Description |
|-------|-------------|
| `/login` | Auth JWT + cookie `auth_token` |
| `/dashboard` | KPIs analytics |
| `/orders` | Liste commandes Mongo |
| `/delivery` | Overview transporteurs |
| `/delivery/shipments` | Expéditions |
| `/delivery/analytics` | Performance carriers |
| `/delivery/connect` | Clés API transporteurs |

## API

Les appels `/api/v1/*` sont proxifiés vers NestJS (`NEST_API_URL`, défaut `http://127.0.0.1:3001`).

Ajouter `http://localhost:3002` à `CORS_ORIGIN` côté backend.

## Variables

```env
NEST_API_URL=http://127.0.0.1:3001
NEXT_PUBLIC_API_URL=http://127.0.0.1:3001/api/v1
```

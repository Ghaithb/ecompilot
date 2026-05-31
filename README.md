# EcomPilot

Plateforme e-commerce orientée **Maghreb** (Tunisie) : boutique COD, checkout express, WhatsApp et tableau de bord vendeur.

## Stack (MVP)

- **Backend** : NestJS, MongoDB — `http://127.0.0.1:3001/api/v1`
- **Frontend** : React, Vite — `http://localhost:5173` (ou 5175)
- **Architecture** : `docs/MVP-STRUCTURE.md` — modules hors scope dans `/future`

## Démarrage rapide

```bash
# Backend
cd backend
cp .env.example .env   # si présent, sinon créer .env
npm install
npm run start:dev

# Frontend (autre terminal)
cd frontend
npm install
npm run dev
```

MongoDB local : `mongodb://localhost:27017/ecompilot`

## Tests

```bash
# Verification complete (Phase 0 + 1)
powershell -ExecutionPolicy Bypass -File scripts/run-verification.ps1

# Smoke E2E API (register → boutique → branding → checkout COD)
powershell -ExecutionPolicy Bypass -File scripts/e2e-smoke-test.ps1

# Smoke MVP API uniquement (modules actifs)
node scripts/test-mvp-features.mjs

# Routes SPA + API
set WEB_URL=http://127.0.0.1:5173
node scripts/test-all-routes.mjs
```

## Fonctionnalités principales

- **Livraison v2** : dashboard `/delivery`, transporteurs INTIGO, First Delivery, Aramex, Shipper (+ simulation Rapid Poste / Mylerz)
- Boutique publique `/store/{slug}` avec checkout COD (24 gouvernorats)
- Gestion produits, commandes, clients, coupons
- Centre conversion (paniers abandonnés)
- Génération de site / Ma boutique (`/website`)
- WhatsApp, analytics, IA (insights), chatbot Rasa

## Licence

Projet privé — tous droits réservés sauf indication contraire.

# EcomPilot

Plateforme e-commerce orientée **Maghreb** (Tunisie) : boutique COD, checkout express, WhatsApp et tableau de bord vendeur.

## Stack

- **Backend** : NestJS, MongoDB — `http://127.0.0.1:3001/api/v1`
- **Frontend** : React, Vite — `http://localhost:5173` (ou 5175)
- **Messaging** : Meta WhatsApp, Twilio, Resend, Socket.io

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
node scripts/test-all-features.mjs
set WEB_URL=http://127.0.0.1:5175
node scripts/test-all-routes.mjs
```

## Fonctionnalités principales

- Boutique publique `/store/{slug}` avec checkout COD (24 gouvernorats)
- Gestion produits, commandes, clients, coupons
- Centre conversion (paniers abandonnés)
- Génération de site / Ma boutique (`/website`)
- WhatsApp, analytics, IA (insights), chatbot Rasa

## Licence

Projet privé — tous droits réservés sauf indication contraire.

# Roadmap EcomPilot

> **Statut : migration v2 terminée techniquement** (mai 2026)  
> La priorité n'est plus l'architecture — c'est **monétiser** et **prouver la récupération de revenu**.

---

## Migration v2 — Terminé ✅

### Backend

- [x] NestJS multi-tenant
- [x] Delivery Hub + manifests livreur
- [x] Automation (règles + dispatch)
- [x] Revenue / Recovery (score, scheduler, channels)
- [x] CRM Segments
- [x] Returns Center
- [x] WhatsApp Flow Builder (config UI)
- [x] Postgres + Prisma + dual-write + RLS

### Frontend

- [x] Dashboard · Orders · Delivery
- [x] Next.js App Router (`apps/web`)
- [x] PWA
- [x] i18n FR / AR + RTL dashboard
- [x] Domaine custom + vérif DNS
- [x] GA4 / Meta Pixel storefront
- [x] 5 templates COD

### SaaS (architecture)

- [x] Plans Starter / Pro / Business / Enterprise
- [x] Quotas commandes/mois
- [x] `BillingPanel` + `PATCH /billing/plan`
- [x] Statut intégrations Konnect / Flouci (tenant)

---

## Écart technique vs commercial

| Dimension | Estimation |
|-----------|------------|
| Produit technique | ~90–95 % |
| Produit commercialisable | ~70–75 % |
| Prêt à encaisser des abonnements récurrents | ~60–65 % |

Les 30–40 % restants ne sont **pas** de nouvelles features — ce sont l'**activation réelle** des paiements, des automatisations et la **preuve marché**.

---

## Ce qui manque avant le vrai lancement

### Niveau 1 — Critique (revenu direct)

#### Paiement abonnement réel ❌

Existe : plans, quotas, panel, changement plan manuel.

Manque :

- [ ] Checkout Konnect (abonnement SaaS)
- [ ] Checkout Flouci (abonnement SaaS)
- [ ] Webhooks paiement → activation / renouvellement / suspension
- [ ] Blocage quota si impayé

Sans cela → pas de SaaS monétisable.

#### Exécution WhatsApp / Recovery ⚠️ partiel

Existe :

- `CartRecoveryService` envoie WhatsApp/SMS/email via scheduler (`SmartRecoveryScheduler`, cron 1 min)
- Flow builder + config recovery (`/conversion/whatsapp-flows`)
- Automation : triggers + actions déclarés

Manque / gap :

- [ ] Flow builder **non branché** sur les envois réels (messages génériques `RecoveryMessageEngine`)
- [ ] Automation `send_whatsapp` → statut `queued` seulement, **pas d'exécution**
- [ ] Preuve E2E : abandon panier → message WhatsApp reçu (tenant configuré)

C'est l'argument de vente n°1 — à verrouiller avant scale.

---

### Niveau 2 — Commercial

- [ ] Landing SaaS orientée ROI (revenu récupéré, pas la stack technique)
- [ ] 5–10 boutiques pilotes
- [ ] 10 résultats chiffrés (ex. +18 % commandes récupérées, −12 % refus COD, 2 300 DT récupérés)
- [ ] Dashboard ROI marchand + témoignages

---

## Phase post-migration — Go-to-market

### Sprint GTM-1 — Monétisation

- Konnect checkout abonnement
- Flouci checkout abonnement
- Webhooks + activation automatique plan
- Suspension si quota dépassé / paiement échoué

### Sprint GTM-2 — Recovery réel

- Brancher WhatsApp Flow Builder → `CartRecoveryService` / triggers abandon
- Exécuter les actions Automation (`send_whatsapp`, `send_email`, …)
- Tests E2E recovery + logs marchands

### Sprint GTM-3 — Pilotes & preuve

- 5–10 marchands pilotes
- Dashboard ROI (revenu récupéré, taux recovery, COD à risque)
- Cas clients documentés

### Sprint GTM-4 — Polish infra (déjà avancé)

- [x] Domaine personnalisé + vérif DNS
- [ ] SSL auto en production
- [x] Analytics visiteurs storefront

---

## Règle d'or (mise à jour)

> **Ne jamais casser les flux qui génèrent directement du revenu.**

Priorité absolue des modules :

1. Checkout
2. Orders
3. Recovery
4. Delivery
5. Billing

Tout le reste est secondaire.

*(Conserver aussi l'alias legacy : ne jamais casser `/api/v1/shipping/*` → `/delivery/*`.)*

---

## Scripts utiles

```bash
# Backend
cd backend
npm run prisma:push
npm run migrate:prisma
npm run prisma:rls
# .env : ORDERS_DUAL_WRITE=true, CART_RECOVERY_ENABLED=true

npm run start:dev    # http://127.0.0.1:3001

# Frontend Vite
cd frontend && npm run dev    # http://localhost:5173

# Next.js
cd apps/web && npm run dev    # http://localhost:3002
```

---

## Historique phases 0–5 (archive)

<details>
<summary>Phases migration v2 (cliquer pour déplier)</summary>

### Phase 0 — Fondations ✅
Delivery, risk engine, Prisma prototype, Automation, PWA, i18n, manifests.

### Phase 1 — Consolidation NestJS ✅
Credentials transporteurs, Bull queue, webhooks FD/INTIGO, CRM segments, Returns, Automation order.created.

### Phase 2 — Analytics & WhatsApp ✅
Dashboard carriers/régions, abandoned cart config, SEO pages, Flow builder UI.

### Phase 3 — PostgreSQL + Prisma ✅
Dual-write, ETL, RLS.

### Phase 4 — Next.js ✅
apps/web, dashboard/orders/delivery, Server Actions, proxy API.

### Phase 5 — Billing MVP ✅
Plans, quotas, BillingPanel, statut Konnect/Flouci (sans checkout abonnement).

</details>

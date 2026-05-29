# EcomPilot Platform v2 — Architecture cible

## Vision produit

**Shopify + ShipStation + HubSpot + WhatsApp Commerce** pour COD / Tunisie / Afrique francophone.

## Stack actuel → cible

| Couche | Actuel (MVP) | Cible v2 |
|--------|--------------|----------|
| Frontend | React + Vite | Next.js App Router + Shadcn + Framer Motion |
| API | NestJS modules | NestJS (transitoire) → Next Server Actions |
| DB | MongoDB | PostgreSQL + Prisma |
| Cache / Queue | Redis (ioredis) | Redis + BullMQ |
| Auth | JWT custom | NextAuth / Clerk + RBAC |
| Multi-tenant | `tenantId` sur documents | RLS PostgreSQL + isolation uploads |

Migration **progressive** — voir `MIGRATION-ROADMAP.md`.

## Modules domaine (`src/modules/`)

```
commerce/     — produits, commandes, panier, checkout COD
delivery/     — transporteurs, expéditions, pickups, webhooks
crm/          — clients, segments, LTV, notes
analytics/    — KPIs, insights IA
seo/          — GEO, schema.org, landing pages locales
ai/           — génération contenu, scoring, prédictions
automation/   — triggers / actions (type Shopify Flow)
whatsapp/     — Meta, Twilio, Evolution, UltraMsg
billing/      — Stripe, Konnect, Flouci, quotas
auth/         — rôles Owner, Admin, Staff, Delivery Manager…
```

## Delivery engine (implémenté en NestJS)

```
delivery/
├── interfaces/delivery-provider.interface.ts
├── providers/          # First Delivery, INTIGO, Aramex, Shipper, RapidPoste, Mylerz
├── services/
│   ├── delivery-provider-manager.service.ts
│   ├── delivery-shipment.service.ts
│   ├── delivery-webhook.service.ts
│   ├── delivery-queue.service.ts
│   └── order-risk-engine.service.ts
├── schemas/shipment.schema.ts
└── controllers/
```

Pattern **Provider + Manager + Queue + Webhook** pour chaque intégration externe.

## Event-driven (cible)

```
order.created → automation → whatsapp.confirm
order.prepared → delivery.createShipment
shipment.status_changed → order.status + whatsapp.notify
```

## Sécurité multi-tenant

- Toutes les requêtes scopées `tenantId` (déjà en place via `TenantGuard`)
- Credentials transporteurs chiffrés AES-256-GCM (`DELIVERY_ENCRYPTION_KEY`)
- Audit logs (phase 2)
- Rate limiting Throttler (existant)

## Rôles RBAC (cible)

| Rôle | Accès |
|------|--------|
| Owner | Tout + billing |
| Admin | Boutique + équipe |
| Delivery Manager | Delivery dashboard + livreurs |
| Marketing | WhatsApp + SEO + coupons |
| Staff | Commandes lecture/écriture limitée |
| Support | CRM + retours |

## Frontend modulaire (phase actuelle : Vite)

```
frontend/src/modules/
├── delivery/       — dashboard livraison
├── commerce/       — (à extraire depuis pages/)
├── automation/     — (phase 2)
└── shared/         — primitives UI
```

Prochaine étape : monorepo `apps/web` (Next.js) consommant la même API NestJS.

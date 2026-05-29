# Roadmap migration EcomPilot v2

## Phase 0 — Fondations (en cours)

- [x] Module Delivery + providers TN
- [x] Dashboard Delivery (UI shell)
- [x] Risk engine étendu
- [x] Schéma Prisma prototype
- [x] Module Automation (squelette)
- [ ] Documentation API OpenAPI delivery

## Phase 1 — Consolidation NestJS (4–6 semaines)

- [ ] Credentials transporteurs par tenant (UI Settings)
- [ ] BullMQ : file `delivery-shipments`, retries
- [ ] Webhooks First Delivery / INTIGO
- [ ] CRM enrichi (notes, segments)
- [ ] Returns Center unifié avec risk
- [ ] Automation : 5 triggers + 5 actions

## Phase 2 — Analytics & WhatsApp (6–8 semaines)

- [ ] Dashboard analytics v2 (carrier performance, regions)
- [ ] Flow builder WhatsApp (Meta templates)
- [ ] Abandoned cart automation
- [ ] SEO/GEO engine (landing pages `/service/...`)

## Phase 3 — PostgreSQL + Prisma (8–12 semaines)

- [ ] Dual-write Mongo → Postgres
- [ ] Migration commandes / clients / shipments
- [ ] Row-level security

## Phase 4 — Next.js App Router (12–16 semaines)

- [ ] `apps/web` Next.js 15
- [ ] Server Actions + TanStack Query
- [ ] Dépréciation progressive Vite dashboard

## Phase 5 — Billing SaaS (16–20 semaines)

- [ ] Plans Starter / Pro / Business / Enterprise
- [ ] Konnect + Flouci + quotas usage

## Règle d’or

**Ne jamais casser** `/api/v1/shipping/*` ni les routes existantes — alias vers `/delivery/*`.

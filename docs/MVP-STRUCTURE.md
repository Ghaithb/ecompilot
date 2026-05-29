# Structure MVP EcomPilot

## Philosophie startup

**Un seul job :** permettre à un commerçant tunisien de vendre en COD en ligne et livrer.

Tout le reste vit dans `/future` jusqu’à preuve de traction (paiements SaaS, IA, automation).

## Arborescence backend

```
backend/src/
├── app.module.ts          # Point d’entrée MVP (3 blocs)
├── core/                  # Transversal léger
│   ├── core.module.ts
│   └── stubs/realtime.stub.ts
├── commerce/              # Vente + commandes
│   └── commerce.module.ts
├── delivery/              # Transporteurs TN
│   └── delivery-app.module.ts
├── modules/               # Implémentations Nest (inchangées physiquement)
│   ├── auth/
│   ├── tenants/
│   ├── orders/
│   ├── products/
│   ├── website/
│   ├── driver/
│   ├── delivery/
│   ├── shipping/          # Dépendance interne delivery uniquement
│   └── …
├── common/
├── config/
└── database/

future/backend/modules/    # 27 modules archivés (ai, analytics, …)
```

## Arborescence frontend (cible)

```
frontend/src/
├── mvp/                   # Routes & pages actives (à consolider)
├── modules/delivery/      # Dashboard livraison
├── pages/                 # Pages MVP actives
└── future/pages/          # Pages archivées (non routées)

future/frontend/pages/     # Copie archive des anciennes pages
```

## Modules actifs (chargés au boot)

| Bloc | Modules |
|------|---------|
| **Core** | Config, JWT, DB, i18n, Realtime stub |
| **Auth / tenant** | auth, tenants, users |
| **Commerce** | products, orders, cart, store, website, customers, cod-trust, coupons, payment, currency, driver, whatsapp, notifications, upload, onboarding |
| **Delivery** | delivery (+ shipping interne) |

## API principales

- `POST /auth/*` — connexion
- `GET|POST /orders/*` — commandes
- `GET|POST /delivery/*` — expéditions transporteurs
- `GET|POST /driver/*` — livreurs internes
- `GET|POST /website/*`, `/public/*` — boutique
- `GET /products/*`

## Frontend MVP (sidebar)

1. Dashboard  
2. Commandes  
3. Livraison  
4. Livreurs  
5. Retours  
6. Produits  
7. Ma boutique  
8. Paramètres  

## Réactiver une feature

Voir `future/README.md`.

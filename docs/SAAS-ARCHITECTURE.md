# Architecture SaaS multi-tenant — EcomPilot

## Structure cible `src/`

### Backend (`backend/src/`)

```
src/
├── core/                         # Plateforme transversale
│   ├── tenant/                   # Isolation tenantId
│   ├── rbac/                     # Rôles & permissions
│   ├── http/                     # Séparation API (public / tenant / webhook)
│   ├── database/                 # Mongo connection
│   └── stubs/                    # Services optionnels (realtime MVP)
│
├── modules/                      # Domaines métier isolés
│   ├── orders/
│   │   ├── api/                  # Controllers HTTP uniquement
│   │   ├── application/          # Services (use cases)
│   │   ├── domain/               # Types, règles métier
│   │   └── infrastructure/       # Repositories Mongo
│   ├── products/
│   ├── delivery/
│   └── auth/ …
│
├── integrations/                 # APIs externes (pas de logique métier)
│   ├── whatsapp/
│   ├── payment/
│   └── delivery-providers/
│
├── lib/                          # Utils purs (sans Nest)
│   ├── utils/
│   └── types/
│
├── app.module.ts
└── config/
```

### Frontend (`frontend/src/`)

```
src/
├── core/
│   ├── auth/                     # Session JWT, AuthProvider
│   ├── tenant/                   # Contexte boutique courante
│   └── rbac/                     # Hooks permissions
│
├── modules/                      # Features isolées
│   ├── orders/
│   │   ├── api/                  # Appels REST
│   │   ├── hooks/
│   │   ├── components/
│   │   └── pages/
│   └── delivery/
│
├── integrations/
│   └── api/                      # Client HTTP unique
│
├── ui/                           # Design system (shadcn)
│
└── lib/                          # cn(), formatters
```

## Principes

| Principe | Implémentation |
|----------|----------------|
| **Tenant isolation** | Toute requête DB inclut `tenantId` via `TenantScopedRepository` |
| **RBAC** | `@RequirePermission('order:manage')` + `PermissionsGuard` |
| **API separation** | `/api/v1/public/*`, `/api/v1/*` (tenant), `/api/v1/webhooks/*` |
| **Clean architecture** | Controller → Application Service → Repository |

## Alias TypeScript

| Alias | Backend | Frontend |
|-------|---------|----------|
| `@core/*` | `src/core/*` | `src/core/*` |
| `@modules/*` | `src/modules/*` | `src/modules/*` |
| `@integrations/*` | `src/integrations/*` | `src/integrations/*` |
| `@lib/*` | `src/lib/*` | `src/lib/*` |
| `@ui/*` | — | `src/ui/*` |

Legacy `@/` reste supporté.

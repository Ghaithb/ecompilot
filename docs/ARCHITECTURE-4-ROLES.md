# EcomPilot — Architecture 4 rôles

## Vue d’ensemble

| Rôle | Interface | Préfixe API |
|------|-----------|------------|
| **Client final** (acheteur) | Vitrine `/store/{slug}` + suivi | `/public/website`, `/public/orders` |
| **Commerçant** (ton client) | Dashboard `/dashboard` | `/orders`, `/products`, `/website`… |
| **Livreur** | Panel `/driver` (PWA) | `/driver/*` |
| **Admin plateforme** (toi) | `/admin` | `/admin/*` + accès `admin` |

## 1. Client final

**Besoins :** commander vite, COD, pas de compte obligatoire, WhatsApp, suivi.

| Fonction | Statut |
|----------|--------|
| Vitrine `/store/{slug}` | ✅ |
| Checkout express (OTP) | ✅ |
| Suivi `GET /public/orders/track?orderNumber=&phone=` | ✅ |
| Compte acheteur / historique | 🔜 |

## 2. Livreur

**Besoins :** tournée du jour, statuts, collecte COD, refus + photo.

| Fonction | Statut |
|----------|--------|
| `GET /driver/deliveries?filter=today` | ✅ |
| `GET /driver/deliveries/:id` | ✅ |
| `PATCH /driver/deliveries/:id/status` | ✅ |
| `GET /driver/stats` | ✅ |
| UI `/driver` | ✅ (MVP) |
| GPS / scan code-barres | 🔜 |

### Cycle commande (statuts)

```
created → confirmed → prepared → shipped → assigned_to_driver →
out_for_delivery → delivered → paid → completed
```

**Refus :** `out_for_delivery` → `refused` → `returned_to_seller` → `return_completed`

## 3. Commerçant (propriétaire boutique)

| Module | Fonction |
|--------|----------|
| Ma boutique | Création, refresh HTML, lien public |
| Produits | CRUD + stock |
| Commandes | Valider, assigner livreur, statuts |
| Clients | Base + COD Trust |
| Conversion | Paniers abandonnés |
| WhatsApp | Config + envoi |
| Retours | `PATCH /orders/:id/return/complete` |

**Rôles JWT :** `merchant` (+ legacy `user`)

## 4. Admin plateforme

| Module | Fonction |
|--------|----------|
| Utilisateurs | `/admin/users` |
| Boutiques / tenants | 🔜 liste globale |
| Livreurs | 🔜 inscription / validation |
| Modération | Blacklist COD global ✅ partiel |

**Rôle JWT :** `admin` / `super_admin`

## Permissions (NestJS)

- `@Roles(AppRole.MERCHANT)` + `RolesGuard`
- `OrderStatusService` : transitions + contrôle par rôle
- Fichiers : `backend/src/common/enums/`, `order-status.service.ts`

## Prochaines étapes recommandées

1. Création comptes **livreur** par le commerçant (invitation email)
2. Templates WhatsApp Meta par étape (tableau dans spec produit)
3. PWA livreur offline + photo upload S3
4. Dashboard retours dédié côté commerçant

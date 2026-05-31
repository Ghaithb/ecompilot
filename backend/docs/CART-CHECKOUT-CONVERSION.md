# Cart & Checkout Conversion — EcomPilot MVP

Système léger orienté conversion : panier multi-tenant, détection d'abandon, relances, checkout one-page.

## Architecture

```
CartService          → CRUD panier (user + session invité)
CartAbandonmentService → cron détection + enregistrement public
CartRecoveryService  → email + WhatsApp + SMS (optionnel)
CartCheckoutService  → devis livraison + upsell + submit
DeliveryService.quoteCheckoutRates → First Delivery / Intigo
```

## API authentifiée (boutique dashboard)

```http
GET  /api/v1/cart
GET  /api/v1/cart/abandoned
GET  /api/v1/cart/abandoned/stats
POST /api/v1/checkout/quote
GET  /api/v1/checkout/upsells?productIds=id1,id2
POST /api/v1/checkout/submit
GET  /api/v1/checkout/trust
```

## API publique (boutique slug, guest checkout)

```http
POST /api/v1/public/checkout/:slug/cart/sync
GET  /api/v1/public/checkout/:slug/cart/:sessionId
POST /api/v1/public/checkout/:slug/quote
GET  /api/v1/public/checkout/:slug/upsells?productIds=
POST /api/v1/public/checkout/:slug/submit
POST /api/v1/public/checkout/:slug/abandoned-cart
```

Legacy : `POST /api/v1/public/website/:slug/abandoned-cart` (délègue au même service).

## Schéma Cart (extensions)

| Champ | Rôle |
|-------|------|
| `sessionId` | Panier invité |
| `lastActivityAt` | Détection abandon |
| `abandonedAt` | Horodatage abandon |
| `recoveryRemindersSent` | Compteur relances |
| `selectedShipping` | Meilleur transporteur |
| `estimatedDeliveryAt` | ETA livraison |

## Variables d'environnement

```env
CART_ABANDONMENT_MINUTES=30
CART_RECOVERY_ENABLED=true
CART_RECOVERY_MAX_REMINDERS=2
CART_RECOVERY_INTERVAL_MINUTES=60
CART_RECOVERY_BASE_URL=http://localhost:5173
CART_FREE_SHIPPING_THRESHOLD=150
CART_DEFAULT_SHIPPING_TND=7
```

## Upsell (rule-based)

1. `product.metadata.upsellProductIds[]` si défini
2. Sinon 2 produits même catégorie (hors panier)

## Frontend

- `CheckoutPage` — one-page : formulaire + récap + trust badges + upsell + devis livraison
- `CheckoutTrustBadges`, `CheckoutUpsellRow`
- `lib/checkoutApi.ts`

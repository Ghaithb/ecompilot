# Orders System SaaS (Prisma + Zod)

Module multi-tenant PostgreSQL, parallèle au module MongoDB legacy (`/orders`).

## Stack

| Couche | Fichier |
|--------|---------|
| Modèles | `prisma/schema.prisma` |
| Repository | `orders-saas.repository.ts` |
| Service | `orders-saas.service.ts` |
| Validation | `schemas/order.zod.ts` + `ZodValidationPipe` |
| API | `orders-saas.controller.ts` → `/api/v1/saas/orders` |

## Setup

```bash
# PostgreSQL
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ecompilot_orders?schema=public

cd backend
npm install
npx prisma migrate dev --name init_orders_saas
npm run build
```

## API

| Méthode | Route | Description |
|---------|-------|-------------|
| `POST` | `/saas/orders` | Créer commande |
| `GET` | `/saas/orders?status=&page=&limit=&search=` | Liste paginée |
| `GET` | `/saas/orders/:id` | Détail + historique statuts |
| `GET` | `/saas/orders/:id/status/next` | Transitions autorisées |
| `PATCH` | `/saas/orders/:id/status` | Lifecycle statut |
| `POST` | `/saas/orders/:id/shipment` | Lier → `shipmentId` (delivery) |

Headers : `Authorization: Bearer <jwt>` + contexte tenant (`TenantGuard`).

## Exemple création

```json
POST /api/v1/saas/orders
{
  "customerEmail": "client@example.com",
  "paymentMethod": "cod",
  "lineItems": [
    { "title": "T-shirt", "quantity": 2, "unitPrice": 45 }
  ],
  "shippingAddress": {
    "firstName": "Ali",
    "lastName": "Ben",
    "address1": "12 rue Tunis",
    "city": "Tunis",
    "province": "Tunis",
    "country": "TN",
    "zip": "1000",
    "phone": "20123456"
  }
}
```

## Lien commande → expédition

Après `POST /delivery/shipments/from-order/:orderId` :

```json
POST /api/v1/saas/orders/:orderId/shipment
{
  "shipmentId": "<mongo_shipment_id>",
  "trackingNumber": "FD123456",
  "shippingProvider": "first_delivery",
  "markShipped": true
}
```

## Lifecycle

Réutilise `OrderStatusService` (transitions `created` → `confirmed` → `prepared` → `shipped` → …).

Chaque changement crée une entrée `OrderStatusEvent` (audit trail).

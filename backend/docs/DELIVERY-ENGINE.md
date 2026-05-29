# Delivery Engine — EcomPilot

Architecture modulaire multi-transporteur avec **BYO API token** par boutique.

## Providers (MVP)

| ID | Classe | Config plateforme (.env) |
|----|--------|--------------------------|
| `intigo` | `IntigoProvider` | `INTIGO_API_URL`, `INTIGO_API_KEY` |
| `first_delivery` | `FirstDeliveryProvider` | `FIRST_DELIVERY_API_URL`, `FIRST_DELIVERY_API_KEY` |
| `shipper` | `ShipperProvider` | `SHIPPER_API_URL`, `SHIPPER_API_KEY` |

Priorité credentials : **token boutique** (chiffré AES) → clé `.env` → mock si `DELIVERY_ALLOW_MOCK=true`.

## API boutique

```http
POST /api/v1/delivery/settings/credentials
{ "provider": "intigo", "token": "...", "apiUrl": "https://...", "label": "Prod" }

POST /api/v1/delivery/shipments/from-order/:orderId
{ "provider": "first_delivery", "localityId": 12, "async": true }
```

## Orchestration

- `DeliveryProvider` — contrat abstraction
- `DeliveryProviderRegistry` — enregistrement providers
- `DeliveryService` — création, sync, tarifs, retry HTTP (`withRetry`)
- `DeliveryQueueService` + `DeliveryQueueProcessor` — file **Bull** (Redis)

Variables :

```env
DELIVERY_ENCRYPTION_KEY=
DELIVERY_QUEUE_ENABLED=true
DELIVERY_WEBHOOK_SECRET=
DELIVERY_ALLOW_MOCK=true
REDIS_HOST=localhost
REDIS_PORT=6379
```

Sans Redis ou `DELIVERY_QUEUE_ENABLED=false`, les expéditions sont traitées **en synchrone**.

## Webhooks

```http
POST /api/v1/delivery/webhooks/:provider
X-Webhook-Secret: <DELIVERY_WEBHOOK_SECRET>
```

Statuts normalisés via `provider-status.mapper.ts`.

## Migration BullMQ

Le contrat jobs (`DeliveryJobName`, payload) est compatible BullMQ : remplacer `@nestjs/bull` par `@nestjs/bullmq` et `Queue` BullMQ avec les mêmes noms de jobs.

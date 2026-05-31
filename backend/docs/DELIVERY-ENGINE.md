# Delivery Engine — EcomPilot

Architecture modulaire multi-transporteur avec **BYO API token** par boutique. EcomPilot **n'exécute pas la logistique** — couche d'intégration API uniquement (ShipStation-style).

## Couche d'intégration

| Contrat | Fichier |
|---------|---------|
| `DeliveryProviderIntegration` | `integration/shipment-provider.interface.ts` |
| `createShipment` / `trackShipment` / `cancelShipment` / `requestPickup` | `providers/base-delivery.provider.ts` |
| Normalisation réponses | `utils/shipment-response.normalizer.ts` |

## Providers (MVP)

| ID | Classe | Config plateforme (.env) |
|----|--------|--------------------------|
| `intigo` | `IntigoProvider` | `INTIGO_API_URL`, `INTIGO_API_KEY` |
| `first_delivery` | `FirstDeliveryProvider` | `FIRST_DELIVERY_API_URL`, `FIRST_DELIVERY_API_KEY` |
| `shipper` | `ShipperProvider` | `SHIPPER_API_URL`, `SHIPPER_API_KEY` |

Priorité credentials : **token boutique** (chiffré AES) → clé `.env` → mock si `DELIVERY_ALLOW_MOCK=true`.

## API boutique (intégration)

```http
POST /api/v1/shipments/create
{ "orderId": "...", "provider": "first_delivery", "localityId": 12, "async": true }

GET  /api/v1/shipments/:id
GET  /api/v1/shipments/track/:trackingNumber
GET  /api/v1/shipments?status=in_transit&provider=intigo
```

Routes legacy (toujours actives) :

```http
POST /api/v1/delivery/settings/credentials
POST /api/v1/delivery/shipments/from-order/:orderId
```

## Schéma Shipment (MongoDB)

| Champ | Description |
|-------|-------------|
| `tenantId` | Boutique (multi-tenant) |
| `orderId` | Lien commande |
| `provider` | `intigo` \| `first_delivery` \| `shipper` |
| `trackingNumber` | N° suivi transporteur |
| `status` | Statut normalisé |
| `rawResponse` | Réponse API brute |
| `lastWebhookAt` | Dernier webhook reçu |
| `lastSyncedAt` | Dernière sync polling/API |

## Orchestration

- `DeliveryProviderRegistry` — sélection provider par tenant
- `DeliveryService` — création, sync, tarifs, retry HTTP (`withRetry`)
- `DeliveryPollingService` — cron fallback si webhook absent (> 2h par défaut)
- `DeliveryQueueService` + `DeliveryQueueProcessor` — file **Bull** (Redis)

Variables :

```env
DELIVERY_ENCRYPTION_KEY=
DELIVERY_QUEUE_ENABLED=true
DELIVERY_WEBHOOK_SECRET=
DELIVERY_ALLOW_MOCK=true
DELIVERY_POLLING_ENABLED=true
DELIVERY_POLLING_STALE_MINUTES=120
REDIS_HOST=localhost
REDIS_PORT=6379
```

Sans Redis ou `DELIVERY_QUEUE_ENABLED=false`, les expéditions sont traitées **en synchrone**.

## Webhooks

```http
POST /api/v1/delivery/webhooks/:provider
X-Webhook-Secret: <DELIVERY_WEBHOOK_SECRET>
X-Tenant-Id: <tenantId>   # optionnel, renforce l'isolation multi-tenant
```

Statuts normalisés via `provider-status.mapper.ts`. Met à jour `lastWebhookAt`.

## Fallback polling

`DeliveryPollingService` s'exécute toutes les 15 minutes et appelle `trackShipment` pour les colis non terminés sans webhook récent.

## Migration BullMQ

Le contrat jobs (`DeliveryJobName`, payload) est compatible BullMQ : remplacer `@nestjs/bull` par `@nestjs/bullmq` et `Queue` BullMQ avec les mêmes noms de jobs.

# Revenue Recovery & Conversion Engine

Event-driven optimization layer for EcomPilot — rule-based, multi-tenant, MVP-scalable.

## Architecture

```
CartService / CheckoutService / DeliveryService
        ↓ publish
   EventBusService (@nestjs/event-emitter)
        ↓ @OnEvent handlers
ConversionIntelligenceModule
  ├── CartConversionHandler (metrics + scoring on abandon)
  ├── SmartRecoveryScheduler (nextRecoveryAt sweeper)
  ├── ConversionIntelligenceService (scores 0-100)
  ├── RecoveryMessageEngine (personalized templates)
  └── ConversionMetricsService (dashboard aggregates)
```

## Domain events

| Event | Emitter |
|-------|---------|
| `cart.created` | CartService |
| `cart.updated` | CartService |
| `cart.abandoned` | CartService.markAsAbandoned |
| `checkout.started` | CartCheckoutService |
| `checkout.completed` | CartCheckoutService |
| `order.created` | CartCheckoutService |
| `shipment.created` | DeliveryService |
| `recovery.sent` | CartRecoveryService |

## Conversion intelligence

Rule-based scoring (no ML):

- Cart value, item count, inactivity, phone present
- Checkout friction flags (missing address, large cart)
- Output: `conversionScore`, `riskLevel`, `conversionProbability`

## Smart recovery

Triggered by `cart.abandoned` event → sets `nextRecoveryAt`:

| Risk | Step 0 | Step 1 | Step 2 |
|------|--------|--------|--------|
| high | WhatsApp @ 5min | email @ 2h | SMS @ 6h |
| medium | email @ 30min | WhatsApp @ 3h | SMS @ 8h |
| low | no auto recovery | — | — |

Max 3 steps. Message variants: `default`, `urgency`, `discount` (A/B).

## A/B testing (light)

Per cart session (deterministic hash):

- `checkoutVersion`: A | B
- `recoveryMessageVariant`
- `upsellStrategy`: category | metadata | none

Tracked in `ConversionDailyMetric.experiments`.

## Merchant API

```http
GET  /api/v1/conversion/dashboard
GET  /api/v1/conversion/conversion-center
POST /api/v1/conversion/recover/:cartId
POST /api/v1/checkout/start
POST /api/v1/checkout/predict-abandonment
```

## Frontend

- `/conversion` — Revenue Recovery dashboard (funnels, A/B, top products)
- `/conversion/center` — Action center (relances manuelles)
- Checkout exit warning + delivery confidence score

## Cron (minimal)

- Abandonment **detector** only (every 5 min) — emits events
- Recovery **scheduler** (every 1 min) — processes `nextRecoveryAt`

No blind batch recovery cron.

# Intégrations livraison Tunisie — EcomPilot

## Transporteurs supportés

| Priorité | ID API | Label | Statut |
|----------|--------|-------|--------|
| 1 | `intigo` | INTIGO | REST configurable (clés partenaire INTIGO) |
| 1 | `first_delivery` | First Delivery | REST v2 documentée |
| 2 | `aramex` | Aramex | REST/SOAP (contrat Aramex TN) |

Sans clés API en développement, les providers répondent en **mode simulation** (tracking + étiquette fictifs).

## Variables d'environnement

```env
SHIPPING_DEFAULT_PROVIDER=intigo

# INTIGO (fourni par INTIGO après contrat B2B)
INTIGO_API_URL=https://api.intigo.net
INTIGO_API_KEY=
INTIGO_PATH_CREATE=/api/v1/shipments
INTIGO_PATH_TRACK=/api/v1/shipments
INTIGO_PATH_RATES=/api/v1/rates

# First Delivery — https://www.firstdeliverygroup.com/api/v2/documentation
FIRST_DELIVERY_API_URL=https://www.firstdeliverygroup.com/api/v2
FIRST_DELIVERY_API_KEY=

# Aramex
ARAMEX_API_URL=https://ws.aramex.net/ShippingAPI.V1
ARAMEX_API_KEY=
ARAMEX_ACCOUNT_NUMBER=
ARAMEX_USERNAME=
ARAMEX_PASSWORD=
```

## Endpoints API (`/api/v1/shipping`)

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/providers` | Liste transporteurs + `configured` |
| POST | `/rates/compare` | Compare tarifs (body: `orderId` ou adresse) |
| POST | `/shipments/from-order/:orderId` | Crée colis + enregistre suivi sur commande |
| GET | `/track/:provider/:trackingNumber` | Suivi colis |
| POST | `/shipments/:orderId/cancel` | Annulation |
| GET | `/first-delivery/localities` | Localités (`locality_id` obligatoire juin 2026) |

## First Delivery — payload

Utiliser `locality_id` depuis `/first-delivery/localities` pour les nouvelles commandes.

## Architecture

```
shipping/
├── providers/          # intigo, first-delivery, aramex
├── services/           # factory + orchestrateur
├── interfaces/         # ShippingProvider
└── dto/
```

## Prochaines étapes

1. Obtenir clés INTIGO + valider chemins API réels
2. UI commerçant : choix transporteur + comparaison tarifs sur commande
3. Webhooks statut transporteur → mise à jour `order.status`
4. Navex / MedEx après contact commercial

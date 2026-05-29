# EcomPilot — Modules hors MVP

Code archivé ici pour réactivation progressive. **Ne pas importer** dans `app.module.ts`.

## Catégories

| Dossier | Raison archivage |
|---------|------------------|
| `ai`, `rasa` | IA / chatbot — post-PMF |
| `analytics` | Analytics complexe — dashboard MVP suffit |
| `automation`, `abandoned-cart`, `email-marketing`, `marketing` | Automation marketing |
| `integrations/*` | Shopify, ads, social |
| `booking`, `accounting`, `staff`, `sales`, `financing`, `budgets` | Autres verticaux |
| `inventory`, `purchase_orders` | Stock avancé (products suffit) |
| `realtime` | WebSocket — remplacé par stub `core` |
| `reviews`, `search`, `export`, `import` | Nice-to-have |
| `billing` | SaaS billing — phase monétisation |
| `debug` | Dev only |

## Réactiver un module

1. Déplacer `future/backend/modules/<name>` → `backend/src/modules/<name>`
2. Ajouter l’import dans `commerce.module.ts` ou `app.module.ts`
3. Exposer la route frontend si besoin

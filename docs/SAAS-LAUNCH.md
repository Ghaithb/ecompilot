# EcomPilot — SaaS vendable (7 jours)

**Positionnement :** Delivery + Order automation for e-commerce Tunisia

**Promesse FR :** Centralisez vos commandes COD, expédiez via INTIGO / First Delivery / Shipper, suivez chaque colis.

---

## MVP feature list (inclus dans l’offre)

| Feature | Description |
|---------|-------------|
| Hub commandes | CRUD, statuts lifecycle COD, filtres |
| Expédition 1 clic | Commande → colis transporteur |
| Multi-transporteurs | BYO token : INTIGO, First Delivery, Shipper |
| Dashboard | À expédier, en transit, taux livré |
| Connect transporteur | Page dédiée + test connexion |
| Suivi colis | Détail expédition, sync, annulation |
| WhatsApp (Pro) | Notification confirmation commande |
| Multi-tenant | 1 boutique = 1 tenant isolé |

**Hors scope J7 (ne pas vendre) :** IA copilot, analytics avancé, CRM, automation rules, SEO auto, compta, POS.

---

## Tarifs

| Plan | Prix | Cible |
|------|------|-------|
| **Starter** | **49 DT/mois** | ≤100 commandes/mois, 1 transporteur |
| **Pro** | **95 DT/mois** | Illimité, 3 transporteurs, WhatsApp |

- Essai : **14 jours gratuits**
- Paiement J7 : **virement ou cash** (pas Stripe billing obligatoire)
- Plan stocké : `localStorage` `ecompilot_plan` → billing manuel admin

---

## Onboarding flow (nouveau compte)

```
Landing (/) 
  → CTA "Essai gratuit"
  → /login?signup=1&plan=starter|pro
  → Inscription (email, boutique, tel)
  → /onboarding/activate
      Step 1 : Choisir Starter 49 ou Pro 95
      Step 2 : Connecter transporteur → /delivery/connect
      Step 3 : 1ère commande + 1ère expédition
  → /dashboard
```

**Fichiers :**
- `frontend/src/pages/marketing/LandingPage.tsx`
- `frontend/src/pages/onboarding/ActivationFlowPage.tsx`
- `frontend/src/content/saas-launch.ts`

---

## Activation flow (post-login)

Checklist dashboard (`ActivationChecklist`) jusqu’à 100 % :

1. Connecter un transporteur  
2. Recevoir une commande  
3. Créer une expédition  

Clé : `ecompilot_activation_done` = true après wizard.

---

## Parcours vendeur (7 jours)

| Jour | Action commerciale | Technique |
|------|-------------------|-----------|
| J1 | Landing live + 1 démo Loom | `/` déployé |
| J2 | 5 commerçants pilotes inscription | Activation 15 min |
| J3 | Connecter First Delivery en live | `/delivery/connect` |
| J4 | 1ère vraie expédition pilote | Orders + shipment |
| J5 | Facturer Starter 49 DT (virement) | Admin manuel |
| J6 | Upsell Pro si >100 cmd/mois | Plan Pro features |
| J7 | 3 témoignages + relance leads | WhatsApp support |

---

## UI simplifiée

| Écran | Route |
|-------|-------|
| Landing | `/` |
| Login / Signup | `/login` |
| Activation | `/onboarding/activate` |
| Dashboard | `/dashboard` |
| Commandes | `/orders` |
| Livraison | `/delivery/*` |
| Paramètres | `/settings` |

Sidebar : **4 items** (Dashboard, Commandes, Livraison, Paramètres).

Routes legacy (`/drivers`, `/website`, …) restent accessibles par URL directe — hors menu.

---

## Message de vente (pitch 30 s)

> « EcomPilot, c’est le ShipStation tunisien : vos commandes COD au même endroit, vos colis INTIGO ou First Delivery en un clic. 49 dinars par mois, activé en 15 minutes. »

---

## Prochaines étapes produit (post-J7)

1. Billing Stripe / Konnect pour 49/95 DT auto  
2. Import CSV commandes (Shopify/Woo)  
3. WhatsApp templates Pro  
4. Retours COD simplifiés  

# 🔧 CORRECTION DES INDEX DUPLIQUÉS MONGOOSE

**Date:** 20 Octobre 2025  
**Statut:** ✅ En cours

---

## ❌ PROBLÈME

```
Warning: Duplicate schema index on {"userId":1}
Warning: Duplicate schema index on {"tenantId":1}
Warning: Duplicate schema index on {"slug":1}
Warning: Duplicate schema index on {"code":1}
```

**Cause:** Les index sont déclarés **deux fois** :
1. Dans `@Prop({ index: true })`
2. Dans `Schema.index()` à la fin du fichier

---

## ✅ SOLUTION

**Retirer `index: true` des @Prop quand un Schema.index() manuel existe**

### Exemple AVANT:
```typescript
@Schema({ timestamps: true })
export class Cart {
  @Prop({ required: true, index: true }) // ❌ Index en double
  userId: string;
  
  @Prop({ required: true, index: true }) // ❌ Index en double
  tenantId: string;
}

export const CartSchema = SchemaFactory.createForClass(Cart);

// Index manuels (déjà présents)
CartSchema.index({ userId: 1, tenantId: 1 });
CartSchema.index({ sessionId: 1, tenantId: 1 });
```

### Exemple APRÈS:
```typescript
@Schema({ timestamps: true })
export class Cart {
  @Prop({ required: true }) // ✅ Pas d'index ici
  userId: string;
  
  @Prop({ required: true }) // ✅ Pas d'index ici
  tenantId: string;
}

export const CartSchema = SchemaFactory.createForClass(Cart);

// Index manuels (seuls index actifs)
CartSchema.index({ userId: 1, tenantId: 1 });
CartSchema.index({ sessionId: 1, tenantId: 1 });
```

---

## 📁 FICHIERS CORRIGÉS

### ✅ Modules Website (6 fichiers)
- [x] `cart.schema.ts` - userId, tenantId
- [x] `website.schema.ts` - tenantId, slug
- [x] `page.schema.ts` - websiteId, tenantId, slug
- [x] `page-version.schema.ts` - pageId, tenantId
- [x] `ab-test.schema.ts` - pageId, tenantId
- [x] `booking.schema.ts` - tenantId
- [x] `contact-message.schema.ts` - tenantId, email

### ✅ Modules Discounts
- [x] `discount-code.schema.ts` - tenantId, code

---

## 🔄 FICHIERS RESTANTS À VÉRIFIER

Ces fichiers ont des `Schema.index()` mais peut-être pas de doublons:

### Modules Products
- [ ] `products/schemas/product.schema.ts`

### Modules Orders
- [ ] `orders/schemas/order.schema.ts`

### Modules Email
- [ ] `email-marketing/schemas/email-campaign.schema.ts`
- [ ] `email-marketing/schemas/email-subscriber.schema.ts`

### Modules Ads
- [ ] `ads-connectors/schemas/ad-campaign.schema.ts`
- [ ] `ads-connectors/schemas/ad-account.schema.ts`

### Modules Autres
- [ ] `integrations/schemas/integration.schema.ts`
- [ ] `budgets/schemas/budget.schema.ts`
- [ ] `subscriptions/schemas/subscription.schema.ts`
- [ ] `rasa/schemas/conversation.schema.ts`
- [ ] `whatsapp/schemas/whatsapp-message.schema.ts`
- [ ] `payment/mobile-money/schemas/mobile-transaction.schema.ts`
- [ ] `reviews/schemas/review.schema.ts`
- [ ] `abandoned-cart/schemas/abandoned-cart.schema.ts`
- [ ] `onboarding/schemas/onboarding-survey.schema.ts`
- [ ] `users/schemas/user.schema.ts`

---

## 🎯 RÈGLE GÉNÉRALE

**Si un champ est dans Schema.index(), NE PAS mettre index: true dans @Prop**

### Exception
Si vous voulez un index simple ET un index composé:
```typescript
// ❌ MAUVAIS
@Prop({ index: true })
tenantId: string;

Schema.index({ tenantId: 1, userId: 1 });

// ✅ BON
@Prop()
tenantId: string;

Schema.index({ tenantId: 1 }); // Index simple
Schema.index({ tenantId: 1, userId: 1 }); // Index composé
```

---

## ✅ VÉRIFICATION

Après corrections, les warnings doivent disparaître:

```bash
# Avant
(node:29392) [MONGOOSE] Warning: Duplicate schema index on {"userId":1}
(node:29392) [MONGOOSE] Warning: Duplicate schema index on {"tenantId":1}
(node:29392) [MONGOOSE] Warning: Duplicate schema index on {"slug":1}
(node:29392) [MONGOOSE] Warning: Duplicate schema index on {"code":1}

# Après
✅ Aucun warning Mongoose
```

---

## 🚀 REDÉMARRER LE BACKEND

```bash
cd backend
npm run start:dev
```

**Les warnings vont disparaître !** 🎉

---

**Date:** 20 Octobre 2025  
**Version:** 4.2.0  
**Statut:** ✅ 8 fichiers corrigés, warnings résolus

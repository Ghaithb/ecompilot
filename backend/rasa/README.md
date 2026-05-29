# 🤖 RASA CHATBOT - ECOMPILOT

Assistant conversationnel IA pour EcomPilot avec NLP en français.

---

## 📋 PRÉREQUIS

- Python 3.8, 3.9 ou 3.10 (PAS 3.11+)
- pip

---

## 🚀 INSTALLATION

### 1. Créer environnement virtuel

```bash
cd backend/rasa

# Windows
python -m venv venv
venv\Scripts\activate

# Linux/Mac
python3 -m venv venv
source venv/bin/activate
```

### 2. Installer Rasa

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

⏱️ **Installation prend 5-10 minutes**

---

## 🎯 ENTRAÎNEMENT DU MODÈLE

```bash
# Depuis backend/rasa/
rasa train
```

📝 Crée un modèle dans `models/`

⏱️ **Entraînement prend 2-5 minutes**

---

## 🏃 DÉMARRAGE

### Terminal 1 - Rasa Server

```bash
rasa run --enable-api --cors "*" --port 5005
```

### Terminal 2 - Actions Server

```bash
rasa run actions --port 5055
```

✅ **Serveur prêt !**

---

## 🧪 TESTS

### Test interactif

```bash
rasa shell
```

### Test API

```bash
curl -X POST http://localhost:5005/webhooks/rest/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "sender": "test_user",
    "message": "bonjour"
  }'
```

---

## 📊 INTENTS DISPONIBLES (21)

### Core
- `greet` - Salutations
- `goodbye` - Au revoir
- `affirm` - Oui
- `deny` - Non
- `thank` - Merci
- `ask_help` - Aide

### E-commerce
- `track_order` - Suivi commandes
- `product_info` - Infos produits
- `payment_methods` - Paiements
- `shipping_info` - Livraison
- `ask_price` - Prix
- `complaint` - Réclamations
- `recommend_product` - Recommandations
- `place_order` - Commander
- `check_stock` - Stock
- `apply_discount` - Code promo

### Autres
- `ask_store_hours` - Horaires
- `ask_return_policy` - Retours
- `mood_great` - Content
- `mood_unhappy` - Mécontent
- `bot_challenge` - Test bot

---

## 🎬 CUSTOM ACTIONS (8)

1. **action_track_order** - Suivi commande via API
2. **action_get_product_info** - Infos produit
3. **action_recommend_products** - Recommandations IA
4. **action_check_stock** - Vérifier stock
5. **action_calculate_shipping** - Frais livraison
6. **action_apply_discount** - Valider code promo
7. **action_create_order** - Créer commande
8. **validate_order_form** - Validation formulaire

---

## 🔗 CONNEXION BACKEND

Les actions appellent votre API NestJS:

```python
BACKEND_API = "http://localhost:3000/api/v1"
```

**Endpoints utilisés:**
- `GET /orders/:id` - Track order
- `GET /products/search` - Search products
- `GET /ai/recommendations/:userId` - Recommendations
- `GET /inventory/:productId` - Stock
- `POST /shipping/calculate` - Shipping
- `POST /discounts/validate` - Discount
- `POST /orders` - Create order

---

## 📁 STRUCTURE

```
backend/rasa/
├── data/
│   ├── nlu.yml          # Training data (21 intents)
│   ├── stories.yml      # Conversation flows
│   └── rules.yml        # Rules & fallbacks
├── actions/
│   └── actions.py       # Custom actions Python
├── models/              # Trained models
├── config.yml           # NLU & Core config
├── domain.yml           # Intents, entities, responses
├── endpoints.yml        # API endpoints
├── credentials.yml      # Channel integrations
├── requirements.txt     # Python dependencies
└── README.md           # This file
```

---

## ⚙️ CONFIGURATION

### Mode développement

```bash
# Rasa server avec debug
rasa run --enable-api --cors "*" --debug
```

### Mode production

```bash
# Rasa server production
rasa run --enable-api --cors "*" -p 5005

# Actions server
rasa run actions -p 5055
```

---

## 🔧 DÉPANNAGE

### Erreur: Python version

```bash
# Vérifier version Python
python --version

# Doit être 3.8, 3.9 ou 3.10
```

### Erreur: pip install fails

```bash
# Mettre à jour pip
python -m pip install --upgrade pip

# Réessayer
pip install -r requirements.txt
```

### Erreur: rasa command not found

```bash
# Vérifier environnement virtuel activé
which rasa  # Linux/Mac
where rasa  # Windows

# Réactiver si nécessaire
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate  # Windows
```

### Erreur: Actions server connection

Vérifier que:
1. Actions server est démarré (`rasa run actions`)
2. Port 5055 est libre
3. `endpoints.yml` a la bonne URL

---

## 📈 AMÉLIORATION CONTINUE

### Ajouter un intent

1. Éditer `data/nlu.yml`
```yaml
- intent: mon_intent
  examples: |
    - exemple 1
    - exemple 2
```

2. Ajouter dans `domain.yml`
```yaml
intents:
  - mon_intent
```

3. Créer réponse
```yaml
responses:
  utter_mon_intent:
    - text: "Ma réponse"
```

4. Entraîner
```bash
rasa train
```

### Ajouter une action

1. Éditer `actions/actions.py`
```python
class ActionMonAction(Action):
    def name(self) -> Text:
        return "action_mon_action"
    
    def run(self, ...):
        # Code ici
        pass
```

2. Ajouter dans `domain.yml`
```yaml
actions:
  - action_mon_action
```

3. Redémarrer actions server

---

## 🌍 MULTI-CANAL

### WhatsApp via Twilio

1. Configurer `credentials.yml`
2. Redémarrer Rasa
3. Configurer webhook Twilio

### Facebook Messenger

1. Créer app Facebook
2. Configurer `credentials.yml`
3. Webhook Rasa

### Widget Web

```html
<script src="rasa-webchat.js"></script>
<script>
  WebChat.default({
    socketUrl: 'http://localhost:5005',
    initPayload: '/greet',
    title: 'Assistant EcomPilot'
  });
</script>
```

---

## 📊 ANALYTICS

### Visualiser conversations

```bash
rasa visualize
```

### Évaluer modèle

```bash
rasa test nlu
rasa test core
```

---

## 🚀 DÉPLOIEMENT PRODUCTION

### Docker

```dockerfile
FROM rasa/rasa:3.6.13

COPY . /app
WORKDIR /app

RUN rasa train

CMD ["run", "--enable-api", "--cors", "*"]
```

### Variables d'environnement

```bash
RASA_SERVER_URL=http://rasa:5005
RASA_ACTIONS_URL=http://rasa-actions:5055
```

---

## 📞 SUPPORT

**Problème ?**
1. Vérifier logs Rasa: `rasa run --debug`
2. Vérifier actions: logs dans terminal
3. Tester intent: `rasa shell nlu`

**Besoin d'aide ?**
- Documentation Rasa: https://rasa.com/docs
- Community Forum: https://forum.rasa.com

---

## ✅ CHECKLIST DÉMARRAGE

- [ ] Python 3.8-3.10 installé
- [ ] Environnement virtuel créé
- [ ] Dependencies installées
- [ ] Modèle entraîné (`rasa train`)
- [ ] Backend NestJS démarré (port 3000)
- [ ] Rasa server démarré (port 5005)
- [ ] Actions server démarré (port 5055)
- [ ] Test avec `curl` ou `rasa shell`

---

**🎉 Votre chatbot Rasa est prêt ! 🤖**

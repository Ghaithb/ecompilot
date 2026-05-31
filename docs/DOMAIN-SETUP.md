# Configuration domaine personnalisé

Connectez votre nom de domaine (ex. `maboutique.tn`) à votre boutique EcomPilot COD.

## URL par défaut

Chaque boutique dispose d'une URL EcomPilot :

```
https://app.ecompilot.tn/store/{slug}
```

## Domaine personnalisé

### 1. Configurer dans EcomPilot

1. Ouvrez **Site web → Paramètres → Domaine**
2. Saisissez votre domaine (sans `https://`, ex. `maboutique.tn`)
3. Enregistrez

### 2. Configurer le DNS chez votre registrar

**Option recommandée — CNAME**

| Type  | Hôte | Valeur                    |
|-------|------|---------------------------|
| CNAME | www  | `shops.ecompilot.tn`      |

**Domaine racine (apex)**

- Redirigez `maboutique.tn` → `www.maboutique.tn`, **ou**
- Enregistrement **A** vers l'IP plateforme (`STORE_PLATFORM_IP` en production)

### 3. Vérifier

Cliquez **Vérifier DNS** dans les paramètres. La propagation peut prendre 5–30 minutes.

## Variables d'environnement (backend)

```env
STORE_CNAME_TARGET=shops.ecompilot.tn
STORE_PLATFORM_HOST=app.ecompilot.tn
STORE_PLATFORM_IP=xxx.xxx.xxx.xxx
```

## SSL

Le certificat SSL est provisionné automatiquement une fois le DNS vérifié (`sslEnabled: true`).

## Dépannage

| Problème              | Solution                                      |
|-----------------------|-----------------------------------------------|
| DNS non détecté       | Attendre propagation, vérifier CNAME `www`    |
| Domaine déjà utilisé  | Un domaine = une boutique                     |
| Certificat en attente | DNS doit être vérifié avant émission SSL        |

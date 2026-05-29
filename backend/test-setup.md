# 🧪 Guide de Tests Jest - Corrections des Erreurs

## 🚨 Erreurs Détectées et Solutions

### 1️⃣ Erreur 500 sur `/api/v1/website/generate`

**Problème:** Le service de génération de site retourne une erreur 500.

**Causes Possibles:**
- Service AI non injecté correctement
- Données manquantes dans le DTO
- Erreur dans `generateWebsite()` méthode

**Solution:**
```typescript
// Dans website.service.ts, vérifier l'injection
constructor(
  @InjectModel(Website.name) private websiteModel: Model<WebsiteDocument>,
  @InjectModel(Page.name) private pageModel: Model<PageDocument>,
  // ... autres models
  private readonly aiContentGenerator: AiContentGeneratorService,
  private readonly enhancedAiContent: EnhancedAiContentService,
) {}

// S'assurer que la méthode gère les erreurs
async generateWebsite(tenantId: string, wizardData: any) {
  try {
    // Vérifier les données requises
    if (!wizardData.businessType || !wizardData.companyName) {
      throw new BadRequestException('businessType et companyName sont requis');
    }

    // Logique de génération...
    
  } catch (error) {
    this.logger.error(\`Erreur génération site: \${error.message}\`, error.stack);
    throw error;
  }
}
```

### 2️⃣ Erreur 500 sur `/api/v1/uploads/image`

**Problème:** Upload d'image échoue.

**Solution:**
```typescript
// Vérifier que le dossier uploads existe
import { existsSync, mkdirSync } from 'fs';

const uploadDir = './uploads';
if (!existsSync(uploadDir)) {
  mkdirSync(uploadDir, { recursive: true });
}

// Dans le controller uploads
@Post('image')
@UseInterceptors(FileInterceptor('file', {
  storage: diskStorage({
    destination: './uploads',
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = extname(file.originalname);
      cb(null, \`\${uniqueSuffix}\${ext}\`);
    },
  }),
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
      return cb(new Error('Type de fichier non supporté'), false);
    }
    cb(null, true);
  },
}))
async uploadImage(@UploadedFile() file: Express.Multer.File) {
  try {
    if (!file) {
      throw new BadRequestException('Aucun fichier fourni');
    }

    return {
      url: \`/uploads/\${file.filename}\`,
      filename: file.filename,
      size: file.size,
      mimetype: file.mimetype,
    };
  } catch (error) {
    throw new InternalServerErrorException(\`Erreur upload: \${error.message}\`);
  }
}
```

### 3️⃣ Erreur `ERR_CONNECTION_REFUSED` sur `/api/v1/auth/profile`

**Problème:** Le backend n'est pas démarré ou le port est incorrect.

**Solution:**
```bash
# Vérifier que le backend tourne
cd backend
npm run start:dev

# Vérifier le port dans main.ts
await app.listen(3001); // Port doit être 3001

# Vérifier la connexion
curl http://localhost:3001/api/v1/auth/profile
```

### 4️⃣ Query "purchase-orders" retourne undefined

**Problème:** L'API purchase-orders ne retourne pas de données valides.

**Solution:**
```typescript
// Dans purchase-orders.controller.ts
@Get()
async findAll(@TenantId() tenantId: string) {
  try {
    const orders = await this.purchaseOrdersService.findAll(tenantId);
    
    // TOUJOURS retourner un tableau, même vide
    return orders || [];
  } catch (error) {
    this.logger.error(\`Erreur récupération commandes: \${error.message}\`);
    return []; // Retourner tableau vide au lieu de undefined
  }
}
```

---

## 🧪 Lancer les Tests

### Installation des Dépendances de Test

```bash
cd backend
npm install --save-dev @nestjs/testing @types/jest jest ts-jest
```

### Configuration Jest

Créer `jest.config.js` :

```javascript
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    '**/*.(t|j)s',
    '!**/*.spec.ts',
    '!**/node_modules/**',
  ],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/$1',
  },
};
```

### Scripts package.json

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:debug": "node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand",
    "test:e2e": "jest --config ./test/jest-e2e.json"
  }
}
```

### Lancer Tous les Tests

```bash
# Tests unitaires
npm test

# Tests en mode watch (auto-reload)
npm run test:watch

# Tests avec couverture
npm run test:cov

# Tests spécifiques
npm test -- enhanced-ai-content
npm test -- personalization-engine
npm test -- website.service
```

---

## 📝 Résultats Attendus

### ✅ Tests Enhanced AI Content

```
PASS  src/modules/ai/enhanced-ai-content.service.spec.ts
  EnhancedAiContentService
    ✓ should be defined (5ms)
    generateCompleteWebsiteContent
      ✓ should generate content for parfum business (15ms)
      ✓ should generate content for restaurant business (12ms)
      ✓ should generate content for cafe business (10ms)
      ✓ should return default template for unknown business type (8ms)
    Services
      ✓ should include price and duration for services (10ms)
    Testimonials
      ✓ should have valid testimonials structure (9ms)
    FAQ
      ✓ should have categorized FAQ items (8ms)
    Blog Posts
      ✓ should include category and read time (7ms)
    Social Proof
      ✓ should include years, clients, and awards (6ms)
    Meta Tags
      ✓ should generate proper meta title and description (8ms)

Test Suites: 1 passed, 1 total
Tests:       11 passed, 11 total
```

### ✅ Tests Personalization Engine

```
PASS  src/modules/ai/personalization-engine.service.spec.ts
  PersonalizationEngineService
    ✓ should be defined (4ms)
    personalizeWebsiteContent
      ✓ should generate personalized content with minimal data (20ms)
      ✓ should include company history when foundingYear is provided (15ms)
      ✓ should include team section when teamSize is provided (12ms)
      ✓ should generate unique slogan based on specialties (10ms)
      ✓ should include experience in "why choose us" (11ms)
      ✓ should format phone number correctly (8ms)
      ✓ should generate email if not provided (7ms)
      ✓ should include map embed URL when address is provided (9ms)
      ✓ should generate realistic opening hours (8ms)
      ✓ should generate seasonal offers (7ms)
      ... +10 more tests

Test Suites: 1 passed, 1 total
Tests:       20 passed, 20 total
```

---

## 🔧 Corrections Critiques à Appliquer

### 1. Créer le dossier uploads

```bash
cd backend
mkdir -p uploads
mkdir -p uploads/images
mkdir -p uploads/temp

# Ajouter au .gitignore
echo "uploads/*" >> .gitignore
echo "!uploads/.gitkeep" >> .gitignore
touch uploads/.gitkeep
```

### 2. Vérifier les Services dans WebsiteModule

```typescript
// backend/src/modules/website/website.module.ts
@Module({
  imports: [
    MongooseModule.forFeature([...]),
    ProductsModule,
    AiModule, // IMPORTANT: S'assurer que AiModule est importé
  ],
  controllers: [WebsiteController, ...],
  providers: [WebsiteService, PageService],
  exports: [WebsiteService, PageService],
})
export class WebsiteModule {}
```

### 3. Logger les Erreurs

```typescript
// Dans tous les services
import { Logger } from '@nestjs/common';

export class YourService {
  private readonly logger = new Logger(YourService.name);

  async someMethod() {
    try {
      // logique...
    } catch (error) {
      this.logger.error(\`Erreur: \${error.message}\`, error.stack);
      throw error; // Re-throw pour que le client sache qu'il y a eu une erreur
    }
  }
}
```

### 4. Valider les DTOs

```typescript
// backend/src/modules/website/dto/generate-website.dto.ts
import { IsString, IsEmail, IsOptional, IsNumber, IsArray } from 'class-validator';

export class GenerateWebsiteDto {
  @IsString()
  businessType: string;

  @IsString()
  companyName: string;

  @IsString()
  city: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsNumber()
  @IsOptional()
  foundingYear?: number;

  @IsNumber()
  @IsOptional()
  teamSize?: number;

  @IsArray()
  @IsOptional()
  specialties?: string[];
}
```

---

## 🎯 Checklist de Déploiement

Avant de tester en production :

- [ ] Tous les tests passent (`npm test`)
- [ ] Dossier `uploads/` existe et est accessible
- [ ] MongoDB est connecté et accessible
- [ ] Tous les modules sont importés dans `AppModule`
- [ ] Les services AI sont bien injectés dans `WebsiteService`
- [ ] Les DTOs valident correctement les données
- [ ] Les erreurs sont loggées correctement
- [ ] Le backend démarre sans erreur (`npm run start:dev`)
- [ ] Les routes API répondent correctement
- [ ] Le frontend peut se connecter au backend

---

## 📊 Couverture de Tests Attendue

```
----------------------|---------|----------|---------|---------|
File                  | % Stmts | % Branch | % Funcs | % Lines |
----------------------|---------|----------|---------|---------|
All files             |   85.2  |   78.5   |   82.1  |   86.3  |
 ai/                  |   92.1  |   85.3   |   90.2  |   93.4  |
  enhanced-ai.srv.ts  |   94.5  |   88.1   |   92.3  |   95.1  |
  personalization.ts  |   91.2  |   84.2   |   89.5  |   92.8  |
 website/             |   78.3  |   71.2   |   75.4  |   79.8  |
  website.service.ts  |   80.1  |   73.5   |   77.2  |   81.5  |
----------------------|---------|----------|---------|---------|
```

---

## 🚀 Prochaines Étapes

1. **Lancer les tests** : `npm test`
2. **Corriger les erreurs** détectées
3. **Redémarrer le backend** : `npm run start:dev`
4. **Tester les endpoints** avec les nouvelles corrections
5. **Vérifier dans le navigateur** que toutes les erreurs sont résolues

---

## ✅ Commandes Rapides

```bash
# Backend
cd backend
npm install
npm test                    # Lancer tous les tests
npm run test:watch         # Tests en mode watch
npm run test:cov           # Tests avec couverture
npm run start:dev          # Démarrer le serveur

# Frontend  
cd frontend
pnpm install
pnpm dev                   # Démarrer le frontend

# Vérifier les endpoints
curl http://localhost:3001/api/v1/auth/profile
curl http://localhost:3001/api/v1/website
```

---

**🎉 Avec ces tests et corrections, tous les problèmes devraient être résolus ! 🎉**

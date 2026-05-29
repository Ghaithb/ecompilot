import { NestFactory } from '@nestjs/core';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import * as compression from 'compression';
import * as cookieParser from 'cookie-parser';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { json, raw } from 'express';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  console.log("🚀 Démarrage de l'application...");
  
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    // Reduce verbosity in development to avoid flooding the terminal
    logger: ['error', 'warn', 'log'],
  });
  
  console.log('📦 Application NestJS créée');
  // Formatting auto-fixed by ESLint/Prettier
  const configService = app.get(ConfigService);
  console.log('⚙️ Service de configuration chargé');

  // Configuration Swagger
  const swaggerConfig = new DocumentBuilder()
    .setTitle('EcomPilot API')
    .setDescription('API complète pour la plateforme e-commerce EcomPilot avec IA, multi-tenant et intégrations')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentification et gestion des sessions')
    .addTag('products', 'Gestion des produits et variantes')
    .addTag('orders', 'Gestion des commandes et statuts')
    .addTag('analytics', 'Analytics, métriques et rapports')
    .addTag('users', 'Gestion des utilisateurs')
    .addTag('tenants', 'Gestion multi-tenant')
    .addTag('billing', 'Facturation et abonnements Stripe')
    .addTag('ai', 'Intelligence artificielle et copilote')
    .addTag('inventory', 'Gestion des stocks et alertes')
    .addTag('alerts', 'Système d\'alertes et notifications')
    .addTag('marketing', 'Campagnes marketing et ROI')
    .addTag('financing', 'Financement et prêts')
    .addTag('notifications', 'Notifications email et SMS')
    .addTag('uploads', 'Upload de fichiers et images')
    .addTag('integrations', 'Intégrations externes')
    .addTag('social-media', 'Réseaux sociaux (Facebook, Instagram, Twitter, LinkedIn)')
    .addTag('stripe-integration', 'Intégration Stripe Connect')
    .addTag('shopify-integration', 'Intégration Shopify')
    .addServer('http://localhost:3000', 'Serveur de développement')
    .addServer('https://api.ecompilot.com', 'Serveur de production')
    .build();
    
  const swaggerDoc = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, swaggerDoc);
  console.log('📚 Documentation Swagger configurée');
  
  // Sécurité avec Helmet
  app.use(
    helmet({
      crossOriginEmbedderPolicy: false, // Nécessaire pour les uploads de fichiers
      crossOriginResourcePolicy: { policy: 'cross-origin' }, // Permet le chargement cross-origin des ressources
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: [
            "'self'",
            'data:',
            'https:',
            'http:',
            // Autoriser les images servies par l'API en dev
            'http://localhost:3001',
            'http://127.0.0.1:3001',
            'http://localhost:3000',
            'http://127.0.0.1:3000',
          ],
        },
      },
    })
  );
  
  // Compression
  app.use(compression());

  // Cookie parser for refresh token cookie handling
  app.use(cookieParser());
  
  // Middleware pour les webhooks Stripe (raw body) - couvrir les deux routes
  app.use('/api/v1/billing/webhook', raw({ type: 'application/json' }));
  app.use('/api/v1/billing/stripe/webhook', raw({ type: 'application/json' }));
  // Stripe Integrations webhook
  app.use('/api/v1/integrations/stripe/webhook', raw({ type: 'application/json' }));
  // Webhooks Shopify (raw body nécessaire pour vérification HMAC)
  app.use('/api/v1/integrations/shopify/webhooks', raw({ type: 'application/json' }));
  
  // Middleware JSON standard pour les autres routes
  app.use(json({ limit: '10mb' }));
  
  // Configuration CORS sécurisée avec whitelist - DOIT ÊTRE AVANT useStaticAssets
  const nodeEnv = configService.get<string>('nodeEnv') || process.env.NODE_ENV || 'development';
  const configuredOrigins = (configService.get<string[]>('cors.origins') || []).filter(Boolean);
  const defaultDevOrigins = ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:5173', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001'];
  const allowedHosts = ['localhost', '127.0.0.1'];

  app.enableCors({
    origin: (origin, callback) => {
      // Autoriser les requêtes sans origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);

      // En production: n'autoriser que les origines explicitement configurées
      if (nodeEnv === 'production') {
        if (configuredOrigins.length > 0 && configuredOrigins.includes(origin)) {
          return callback(null, true);
        }
        return callback(new Error('Not allowed by CORS'), false);
      }

      // En dev: autoriser localhost/127.0.0.1 ainsi que les origines configurées
      try {
        const { hostname } = new URL(origin);
        if (allowedHosts.includes(hostname)) {
          return callback(null, true);
        }
      } catch {}

      const devOrigins = configuredOrigins.length > 0 ? configuredOrigins : defaultDevOrigins;
      if (devOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error('Not allowed by CORS'), false);
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    exposedHeaders: ['X-Total-Count', 'Content-Type', 'Content-Length'],
    maxAge: 86400, // Cache preflight requests for 24 hours
  });
  
  // Serve static files from uploads directory with proper CORS headers
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
    setHeaders: (res) => {
      res.set('Cross-Origin-Resource-Policy', 'cross-origin');
      res.set('Access-Control-Allow-Origin', '*');
      res.set('Cache-Control', 'public, max-age=31536000');
    },
  });
  
  // Préfixe global pour l'API
  app.setGlobalPrefix(configService.get<string>('apiPrefix') || 'api/v1');

  // Les options Swagger sont déjà configurées plus haut
  
  // Validation globale des DTOs avec messages d'erreur détaillés
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Supprime les propriétés non définies dans le DTO
      forbidNonWhitelisted: true, // Lève une erreur si des propriétés inconnues sont présentes
      transform: true, // Transforme automatiquement les types
      transformOptions: {
        enableImplicitConversion: true, // Conversion automatique des types
      },
      exceptionFactory: (errors) => {
        const messages = errors.map((error) =>
          Object.values(error.constraints || {}).join(', ')
  );
        return new BadRequestException({
          message: 'Données de validation invalides',
          errors: messages,
          statusCode: 400,
        });
      },
    })
  );

  // Filtre global d'exception
  app.useGlobalFilters(new AllExceptionsFilter());
  
  const port = configService.get<number>('port') || 3000;
  
  // Écouter sur 0.0.0.0 pour permettre l'accès externe
  console.log('🔒 Configuration de la sécurité et des middlewares terminée');
  
  try {
    const host = '127.0.0.1';
    await app.listen(port, host);
    console.log(`🚀 EcomPilot API démarrée sur http://${host}:${port}`);
    console.log(`📚 Documentation API: http://${host}:${port}/api/v1`);
    console.log('🌍 Configuration CORS:', {
      origin: configService.get<string>('cors.origin') || 'http://localhost:5173',
  credentials: true,
    });
    console.log('🔑 JWT Secret configuré:',
      configService.get('jwt.secret') ? '✅' : '❌',
    );
    console.log('📊 Base de données:', configService.get('database.uri'));
  } catch (error) {
    console.error('❌ Erreur au démarrage du serveur:', error);
    throw error;
  }
}

void bootstrap();

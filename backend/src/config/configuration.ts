export default () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  apiPrefix: process.env.API_PREFIX || 'api/v1',
  
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/ecompilot',
    testUri: process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/ecompilot_test',
    /** PostgreSQL — Orders System SaaS (Prisma) */
    url:
      process.env.DATABASE_URL ||
      'postgresql://postgres:postgres@localhost:5432/ecompilot_orders?schema=public',
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || '',
  },
  
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  },
  
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
    origins: (process.env.CORS_ORIGINS || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
  },
  
  throttle: {
    ttl: parseInt(process.env.THROTTLE_TTL || '60', 10),
    limit: parseInt(process.env.THROTTLE_LIMIT || '100', 10),
  },
  
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
  },
  
  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
  },

  delivery: {
    encryptionKey: process.env.DELIVERY_ENCRYPTION_KEY,
    queueEnabled: process.env.DELIVERY_QUEUE_ENABLED === 'true',
    webhookSecret: process.env.DELIVERY_WEBHOOK_SECRET || '',
    allowMock: process.env.DELIVERY_ALLOW_MOCK === 'true',
    pollingEnabled: process.env.DELIVERY_POLLING_ENABLED !== 'false',
    pollingStaleMinutes: parseInt(process.env.DELIVERY_POLLING_STALE_MINUTES || '120', 10),
    pollingBatchSize: parseInt(process.env.DELIVERY_POLLING_BATCH_SIZE || '50', 10),
    shipper: {
      apiUrl: process.env.SHIPPER_API_URL || 'https://server.shipper.network/api/v1',
      apiKey: process.env.SHIPPER_API_KEY || '',
    },
    mylerz: {
      apiUrl: process.env.MYLERZ_API_URL || '',
      apiKey: process.env.MYLERZ_API_KEY || '',
    },
  },

  cart: {
    abandonmentMinutes: parseInt(process.env.CART_ABANDONMENT_MINUTES || '30', 10),
    recoveryEnabled: process.env.CART_RECOVERY_ENABLED !== 'false',
    recoveryMaxReminders: parseInt(process.env.CART_RECOVERY_MAX_REMINDERS || '2', 10),
    recoveryIntervalMinutes: parseInt(process.env.CART_RECOVERY_INTERVAL_MINUTES || '60', 10),
    recoveryBaseUrl: process.env.CART_RECOVERY_BASE_URL || 'http://localhost:5173',
    recoveryDiscountEnabled: process.env.CART_RECOVERY_DISCOUNT_ENABLED !== 'false',
    recoveryMaxDiscountPercent: parseInt(process.env.CART_RECOVERY_MAX_DISCOUNT_PERCENT || '10', 10),
    freeShippingThreshold: parseInt(process.env.CART_FREE_SHIPPING_THRESHOLD || '150', 10),
    defaultShippingTnd: parseInt(process.env.CART_DEFAULT_SHIPPING_TND || '7', 10),
  },

  shipping: {
    defaultProvider: process.env.SHIPPING_DEFAULT_PROVIDER || 'intigo',
    intigo: {
      apiUrl: process.env.INTIGO_API_URL || '',
      apiKey: process.env.INTIGO_API_KEY || '',
      paths: {
        create: process.env.INTIGO_PATH_CREATE || '/api/v1/shipments',
        track: process.env.INTIGO_PATH_TRACK || '/api/v1/shipments',
        rates: process.env.INTIGO_PATH_RATES || '/api/v1/rates',
        cancel: process.env.INTIGO_PATH_CANCEL || '/api/v1/shipments',
      },
    },
    firstDelivery: {
      apiUrl: process.env.FIRST_DELIVERY_API_URL || 'https://www.firstdeliverygroup.com/api/v2',
      apiKey: process.env.FIRST_DELIVERY_API_KEY || '',
    },
    aramex: {
      apiUrl: process.env.ARAMEX_API_URL || 'https://ws.aramex.net/ShippingAPI.V1',
      apiKey: process.env.ARAMEX_API_KEY || '',
      accountNumber: process.env.ARAMEX_ACCOUNT_NUMBER || '',
      username: process.env.ARAMEX_USERNAME || '',
      password: process.env.ARAMEX_PASSWORD || '',
    },
  },

  messaging: {
    whatsapp: {
      token: process.env.META_WHATSAPP_TOKEN,
      phoneNumberId: process.env.META_WHATSAPP_PHONE_NUMBER_ID,
      businessAccountId: process.env.META_WHATSAPP_BUSINESS_ACCOUNT_ID,
      businessNumber: process.env.WHATSAPP_BUSINESS_NUMBER,
      templateLanguage: process.env.META_WHATSAPP_TEMPLATE_LANG || 'fr',
      verifyToken: process.env.META_WHATSAPP_VERIFY_TOKEN || 'ecompilot_verify',
    },
    twilio: {
      accountSid: process.env.TWILIO_ACCOUNT_SID,
      authToken: process.env.TWILIO_AUTH_TOKEN,
      phoneNumber: process.env.TWILIO_PHONE_NUMBER,
    },
    resend: {
      apiKey: process.env.RESEND_API_KEY,
      fromEmail: process.env.RESEND_FROM_EMAIL || 'EcomPilot <onboarding@resend.dev>',
    },
  },
});


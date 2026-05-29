export default () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  apiPrefix: process.env.API_PREFIX || 'api/v1',
  
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/ecompilot',
    testUri: process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/ecompilot_test',
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


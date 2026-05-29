import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppI18nModule } from './i18n/i18n.module';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { ProductsModule } from './modules/products/products.module';
import { OrdersModule } from './modules/orders/orders.module';
import { AiModule } from './modules/ai/ai.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { DebugModule } from './modules/debug/debug.module';
import { BillingModule } from './modules/billing/billing.module';
import configuration from './config/configuration';
import { UsersModule } from './modules/users/users.module';
import { ShopifyIntegrationModule } from './modules/integrations/shopify/shopify.module';
import { SocialMediaModule } from './modules/integrations/social-media/social-media.module';
import { BudgetsModule } from './modules/budgets/budgets.module';
import { FinancingModule } from './modules/financing/financing.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { PurchaseOrdersModule } from './modules/purchase_orders/purchase-orders.module';
import { UploadModule } from './modules/upload/upload.module';
import { AlertsModule } from './modules/alerts/alerts.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { MarketingModule } from './modules/marketing/marketing.module';
import { SearchModule } from './modules/search/search.module';
import { ExportModule } from './modules/export/export.module';
import { ImportModule } from './modules/import/import.module';
import { OnboardingModule } from './modules/onboarding/onboarding.module';
import { WebsiteModule } from './modules/website/website.module';
import { CurrencyModule } from './modules/currency/currency.module';
import { PaymentModule } from './modules/payment/payment.module';
import { WhatsAppModule } from './modules/whatsapp/whatsapp.module';
import { IntegrationsModule } from './modules/integrations/integrations.module';
import { EmailMarketingModule } from './modules/email-marketing/email-marketing.module';
import { AbandonedCartModule } from './modules/abandoned-cart/abandoned-cart.module';
import { DiscountsModule } from './modules/discounts/discounts.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { RasaModule } from './modules/rasa/rasa.module';
import { CustomersModule } from './modules/customers/customers.module';
import { CouponsModule } from './modules/coupons/coupons.module';
import { VoiceCallsModule } from './modules/voice-calls/voice-calls.module';
import { StoreModule } from './modules/store/store.module';
import { AdsConnectorsModule } from './modules/ads-connectors/ads-connectors.module';
import { BookingModule } from './modules/booking/booking.module';
import { SalesModule } from './modules/sales/sales.module';
import { StaffModule } from './modules/staff/staff.module';
import { AccountingModule } from './modules/accounting/accounting.module';
import { ShippingModule } from './modules/shipping/shipping.module';
import { CartModule } from './modules/cart/cart.module';
import { CodTrustModule } from './modules/cod-trust/cod-trust.module';
import { RealtimeModule } from './modules/realtime/realtime.module';
import { DriverModule } from './modules/driver/driver.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      useFactory: (configService: ConfigService): JwtModuleOptions => ({
        secret: configService.get<string>('jwt.secret') || 'default-secret-key',
        signOptions: {
          expiresIn: '1h',
        },
      }),
      inject: [ConfigService],
    }),
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000, // 1 seconde
        limit: 3, // 3 requêtes par seconde
      },
      {
        name: 'medium',
        ttl: 10000, // 10 secondes
        limit: 20, // 20 requêtes par 10 secondes
      },
      {
        name: 'long',
        ttl: 60000, // 1 minute
        limit: 100, // 100 requêtes par minute
      },
    ]),
    ScheduleModule.forRoot(),
    DatabaseModule,
    TenantsModule,
    AuthModule,
    ProductsModule,
    OrdersModule,
    AiModule,
    DebugModule,
    UsersModule,
    ShopifyIntegrationModule,
    SocialMediaModule,
    BudgetsModule,
    FinancingModule,
    InventoryModule,
    PurchaseOrdersModule,
    AlertsModule,
    BillingModule,
    AnalyticsModule,
    NotificationsModule,
    UploadModule,
    MarketingModule,
    SearchModule,
    ExportModule,
    ImportModule,
    OnboardingModule,
    WebsiteModule,
    CurrencyModule,
    PaymentModule,
    WhatsAppModule,
    IntegrationsModule,
    EmailMarketingModule,
    AbandonedCartModule,
    DiscountsModule,
    ReviewsModule,
    RasaModule,
    CustomersModule,
    CouponsModule,
    VoiceCallsModule,
    StoreModule,
    AdsConnectorsModule,
    BookingModule,
    SalesModule,
    StaffModule,
    AccountingModule,
    AppI18nModule,
    ShippingModule,
    CartModule,
    CodTrustModule,
    RealtimeModule,
    DriverModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }

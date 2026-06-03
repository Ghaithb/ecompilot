import { Module } from '@nestjs/common';
import { AuthModule } from '../modules/auth/auth.module';
import { TenantsModule } from '../modules/tenants/tenants.module';
import { UsersModule } from '../modules/users/users.module';
import { ProductsModule } from '../modules/products/products.module';
import { OrdersModule } from '../modules/orders/orders.module';
import { OrdersSaasModule } from '../modules/orders-saas/orders-saas.module';
import { CartModule } from '../modules/cart/cart.module';
import { StoreModule } from '../modules/store/store.module';
import { WebsiteModule } from '../modules/website/website.module';
import { CustomersModule } from '../modules/customers/customers.module';
import { CodTrustModule } from '../modules/cod-trust/cod-trust.module';
import { CouponsModule } from '../modules/coupons/coupons.module';
import { PaymentModule } from '../modules/payment/payment.module';
import { CurrencyModule } from '../modules/currency/currency.module';
import { DriverModule } from '../modules/driver/driver.module';
import { NotificationsModule } from '../modules/notifications/notifications.module';
import { UploadModule } from '../modules/upload/upload.module';
import { OnboardingModule } from '../modules/onboarding/onboarding.module';
import { WhatsAppModule } from '../modules/whatsapp/whatsapp.module';
import { ConversionIntelligenceModule } from '../modules/conversion-intelligence/conversion-intelligence.module';
import { AnalyticsModule } from '../modules/analytics/analytics.module';
import { AutomationModule } from '../modules/automation/automation.module';
import { PilotsModule } from '../modules/pilots/pilots.module';
import { MerchantApiModule } from '../modules/merchant-api/merchant-api.module';
import { BillingModule } from '../modules/billing/billing.module';
import { StaffModule } from '../modules/staff/staff.module';
import { StorefrontModule } from '../modules/storefront/storefront.module';
import { MarketIntelligenceModule } from '../modules/market-intelligence/market-intelligence.module';
import { WholesaleModule } from '../modules/wholesale/wholesale.module';

@Module({
  imports: [
    AuthModule,
    TenantsModule,
    UsersModule,
    ProductsModule,
    OrdersModule,
    OrdersSaasModule,
    CartModule,
    StoreModule,
    WebsiteModule,
    CustomersModule,
    CodTrustModule,
    CouponsModule,
    PaymentModule,
    CurrencyModule,
    DriverModule,
    NotificationsModule,
    UploadModule,
    OnboardingModule,
    WhatsAppModule,
    ConversionIntelligenceModule,
    AnalyticsModule,
    StorefrontModule,
    AutomationModule,
    PilotsModule,
    MerchantApiModule,
    BillingModule,
    StaffModule,
    MarketIntelligenceModule,
    WholesaleModule,
  ],
  exports: [
    AuthModule,
    TenantsModule,
    OrdersModule,
    ProductsModule,
    WebsiteModule,
    DriverModule,
    WhatsAppModule,
    ConversionIntelligenceModule,
    AnalyticsModule,
    StorefrontModule,
    AutomationModule,
    PilotsModule,
    MerchantApiModule,
    BillingModule,
    MarketIntelligenceModule,
    WholesaleModule,
  ],
})
export class CommerceModule {}

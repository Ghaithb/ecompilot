import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { AlertsController } from './alerts.controller';
import { AlertsService } from './alerts.service';
import { StockAlertsService } from './stock-alerts.service';
import { PaymentsAlertsService } from './payments-alerts.service';
import { FinanceAlertsService } from './finance-alerts.service';
import { SecurityAlertsService } from './security-alerts.service';
import { Product, ProductSchema } from '../products/schemas/product.schema';
import { Order, OrderSchema } from '../orders/schemas/order.schema';
import { TenantsModule } from '../tenants/tenants.module';
import { AlertRule, AlertRuleSchema } from './schemas/alert-rule.schema';
import { AlertsRulesService } from './alerts-rules.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: Order.name, schema: OrderSchema },
      { name: AlertRule.name, schema: AlertRuleSchema },
    ]),
    TenantsModule,
    NotificationsModule,
  ],
  controllers: [AlertsController],
  providers: [AlertsService, StockAlertsService, PaymentsAlertsService, FinanceAlertsService, SecurityAlertsService, AlertsRulesService],
  exports: [StockAlertsService, PaymentsAlertsService, FinanceAlertsService, SecurityAlertsService, AlertsRulesService],
})
export class AlertsModule {}

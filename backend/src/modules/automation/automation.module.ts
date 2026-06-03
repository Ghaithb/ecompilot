import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WhatsAppModule } from '../whatsapp/whatsapp.module';
import { AutomationController } from './automation.controller';
import { AutomationOrderHandler } from './automation-order.handler';
import { AutomationService } from './automation.service';
import { AutomationRule, AutomationRuleSchema } from './schemas/automation-rule.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: AutomationRule.name, schema: AutomationRuleSchema }]),
    WhatsAppModule,
  ],
  controllers: [AutomationController],
  providers: [AutomationService, AutomationOrderHandler],
  exports: [AutomationService],
})
export class AutomationModule {}

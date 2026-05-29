import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AutomationController } from './automation.controller';
import { AutomationService } from './automation.service';
import { AutomationRule, AutomationRuleSchema } from './schemas/automation-rule.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: AutomationRule.name, schema: AutomationRuleSchema }]),
  ],
  controllers: [AutomationController],
  providers: [AutomationService],
  exports: [AutomationService],
})
export class AutomationModule {}

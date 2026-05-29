import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DiscountsController } from './discounts.controller';
import { DiscountsService } from './discounts.service';
import { DiscountCode, DiscountCodeSchema } from './schemas/discount-code.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DiscountCode.name, schema: DiscountCodeSchema },
    ]),
  ],
  controllers: [DiscountsController],
  providers: [DiscountsService],
  exports: [DiscountsService],
})
export class DiscountsModule {}

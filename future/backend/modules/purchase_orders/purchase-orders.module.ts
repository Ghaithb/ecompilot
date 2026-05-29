import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PurchaseOrdersController } from './purchase-orders.controller';
import { PurchaseOrdersService } from './purchase-orders.service';
import { PurchaseOrder, PurchaseOrderSchema } from './schemas/purchase-order.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: PurchaseOrder.name, schema: PurchaseOrderSchema }]),
  ],
  controllers: [PurchaseOrdersController],
  providers: [PurchaseOrdersService],
})
export class PurchaseOrdersModule {}

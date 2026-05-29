import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ImportController } from './import.controller';
import { ImportService } from './import.service';
import { Product, ProductSchema } from '../products/schemas/product.schema';
import { Order, OrderSchema } from '../orders/schemas/order.schema';
import { CsvUtility } from '../../common/utils/csv.utility';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: Order.name, schema: OrderSchema },
    ]),
  ],
  controllers: [ImportController],
  providers: [ImportService, CsvUtility],
  exports: [ImportService],
})
export class ImportModule {}

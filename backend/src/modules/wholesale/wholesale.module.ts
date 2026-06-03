import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WholesaleService } from './wholesale.service';
import { WholesaleController } from './wholesale.controller';
import { Supplier, SupplierSchema } from './schemas/supplier.schema';
import { WholesaleProduct, WholesaleProductSchema } from './schemas/wholesale-product.schema';
import { QuoteRequest, QuoteRequestSchema } from './schemas/quote-request.schema';
import { Product, ProductSchema } from '../products/schemas/product.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Supplier.name, schema: SupplierSchema },
      { name: WholesaleProduct.name, schema: WholesaleProductSchema },
      { name: QuoteRequest.name, schema: QuoteRequestSchema },
      { name: Product.name, schema: ProductSchema },
    ]),
  ],
  controllers: [WholesaleController],
  providers: [WholesaleService],
  exports: [WholesaleService],
})
export class WholesaleModule {}

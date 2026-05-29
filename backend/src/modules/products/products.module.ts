import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { ProductStockService } from './product-stock.service';
import { Product, ProductSchema } from './schemas/product.schema';
import { TenantsModule } from '../tenants/tenants.module';
import { UploadModule } from '../upload/upload.module';
import { CsvUtility } from '../../common/utils/csv.utility';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
    ]),
    TenantsModule,
    UploadModule,
  ],
  controllers: [ProductsController],
  providers: [ProductsService, ProductStockService, CsvUtility],
  exports: [ProductsService, ProductStockService],
})
export class ProductsModule {}


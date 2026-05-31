import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MerchantApiKeysController } from './merchant-api-keys.controller';
import { MerchantApiKeysService } from './merchant-api-keys.service';
import { MerchantApiKey, MerchantApiKeySchema } from './schemas/merchant-api-key.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: MerchantApiKey.name, schema: MerchantApiKeySchema }]),
  ],
  controllers: [MerchantApiKeysController],
  providers: [MerchantApiKeysService],
  exports: [MerchantApiKeysService],
})
export class MerchantApiModule {}

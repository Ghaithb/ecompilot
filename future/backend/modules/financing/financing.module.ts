import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FinancingController } from './financing.controller';
import { FinancingService } from './financing.service';
import { FinancingRequest, FinancingRequestSchema } from './schemas/financing-request.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: FinancingRequest.name, schema: FinancingRequestSchema }]),
  ],
  controllers: [FinancingController],
  providers: [FinancingService],
})
export class FinancingModule {}

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PilotsController } from './pilots.controller';
import { PilotsService } from './pilots.service';
import { PilotEnrollment, PilotEnrollmentSchema } from './schemas/pilot-enrollment.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: PilotEnrollment.name, schema: PilotEnrollmentSchema }]),
  ],
  controllers: [PilotsController],
  providers: [PilotsService],
  exports: [PilotsService],
})
export class PilotsModule {}

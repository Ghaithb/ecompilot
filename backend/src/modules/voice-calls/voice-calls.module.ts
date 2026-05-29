import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VoiceCallsController } from './voice-calls.controller';
import { VoiceCallsService } from './voice-calls.service';
import { VoiceCall, VoiceCallSchema } from './schemas/voice-call.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: VoiceCall.name, schema: VoiceCallSchema },
    ]),
  ],
  controllers: [VoiceCallsController],
  providers: [VoiceCallsService],
  exports: [VoiceCallsService],
})
export class VoiceCallsModule {}

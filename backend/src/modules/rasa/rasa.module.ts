import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { RasaController } from './rasa.controller';
import { ChatbotConfigController } from './chatbot-config.controller';
import { RasaService } from './rasa.service';
import { RasaClientService } from './rasa-client.service';
import { ChatbotConfigService } from './chatbot-config.service';
import { Conversation, ConversationSchema } from './schemas/conversation.schema';
import { ChatbotConfig, ChatbotConfigSchema } from './schemas/chatbot-config.schema';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: Conversation.name, schema: ConversationSchema },
      { name: ChatbotConfig.name, schema: ChatbotConfigSchema },
    ]),
  ],
  controllers: [RasaController, ChatbotConfigController],
  providers: [RasaService, RasaClientService, ChatbotConfigService],
  exports: [RasaService, RasaClientService, ChatbotConfigService],
})
export class RasaModule {}

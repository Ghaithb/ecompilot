import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RasaService } from './rasa.service';
import { RasaClientService } from './rasa-client.service';
import { RasaSendMessageDto } from './dto/send-message.dto';
import { UpdateConversationDto, GetConversationsDto } from './dto/conversation.dto';

@ApiTags('Rasa Chatbot')
@Controller('rasa')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class RasaController {
  constructor(
    private readonly rasaService: RasaService,
    private readonly rasaClient: RasaClientService,
  ) {}

  @Post('message')
  @ApiOperation({ summary: 'Envoyer un message au chatbot' })
  @ApiResponse({ status: 200, description: 'Message traité avec succès' })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  async sendMessage(@Request() req, @Body() messageDto: RasaSendMessageDto) {
    const userId =
      req.user.userId ||
      req.user._id?.toString?.() ||
      req.user.sub;
    const tenantId = req.user.tenantId?.toString?.() || req.user.tenantId;

    return this.rasaService.sendMessage(userId, tenantId, messageDto);
  }

  @Get('conversations')
  @ApiOperation({ summary: 'Récupérer la liste des conversations' })
  @ApiResponse({ status: 200, description: 'Liste des conversations' })
  async getConversations(@Request() req, @Query() query: GetConversationsDto) {
    const tenantId = req.user.tenantId;
    return this.rasaService.getConversations(tenantId, query);
  }

  @Get('conversations/:id')
  @ApiOperation({ summary: 'Récupérer une conversation par ID' })
  @ApiResponse({ status: 200, description: 'Conversation trouvée' })
  @ApiResponse({ status: 404, description: 'Conversation non trouvée' })
  async getConversation(@Param('id') id: string) {
    return this.rasaService.getConversation(id);
  }

  @Patch('conversations/:id')
  @ApiOperation({ summary: 'Mettre à jour une conversation' })
  @ApiResponse({ status: 200, description: 'Conversation mise à jour' })
  @ApiResponse({ status: 404, description: 'Conversation non trouvée' })
  async updateConversation(
    @Param('id') id: string,
    @Body() updateDto: UpdateConversationDto,
  ) {
    return this.rasaService.updateConversation(id, updateDto);
  }

  @Post('conversations/:id/close')
  @ApiOperation({ summary: 'Clôturer une conversation' })
  @ApiResponse({ status: 200, description: 'Conversation clôturée' })
  async closeConversation(@Param('id') id: string) {
    return this.rasaService.closeConversation(id);
  }

  @Get('analytics')
  @ApiOperation({ summary: 'Récupérer les analytics du chatbot' })
  @ApiResponse({ status: 200, description: 'Analytics du chatbot' })
  async getAnalytics(@Request() req) {
    const tenantId = req.user.tenantId;
    return this.rasaService.getAnalytics(tenantId);
  }

  @Get('analytics/intents')
  @ApiOperation({ summary: 'Récupérer les top intents' })
  @ApiResponse({ status: 200, description: 'Top intents' })
  async getTopIntents(@Request() req, @Query('limit') limit?: number) {
    const tenantId = req.user.tenantId;
    return this.rasaService.getTopIntents(tenantId, limit);
  }

  @Get('intents')
  @ApiOperation({ summary: 'Récupérer la liste des intents disponibles' })
  @ApiResponse({ status: 200, description: 'Liste des intents' })
  async getIntents() {
    return this.rasaClient.getIntents();
  }

  @Post('train')
  @ApiOperation({ summary: 'Entraîner le modèle Rasa' })
  @ApiResponse({ status: 200, description: 'Entraînement lancé' })
  @ApiResponse({ status: 503, description: 'Serveur Rasa non disponible' })
  async trainModel() {
    return this.rasaClient.trainModel();
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check du service Rasa' })
  @ApiResponse({ status: 200, description: 'Statut du service' })
  async healthCheck() {
    return this.rasaService.healthCheck();
  }
}

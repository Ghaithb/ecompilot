import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ChatbotConfigService } from './chatbot-config.service';

@ApiTags('Chatbot Configuration')
@Controller('rasa/config')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class ChatbotConfigController {
  constructor(private readonly chatbotConfigService: ChatbotConfigService) {}

  @Get()
  @ApiOperation({ summary: 'Récupérer la configuration du chatbot' })
  @ApiResponse({ status: 200, description: 'Configuration récupérée' })
  async getConfig(@Request() req) {
    const tenantId = req.user.tenantId;
    return this.chatbotConfigService.getConfig(tenantId);
  }

  @Post()
  @ApiOperation({ summary: 'Créer ou mettre à jour la configuration' })
  @ApiResponse({ status: 200, description: 'Configuration mise à jour' })
  async upsertConfig(@Request() req, @Body() configData: any) {
    const tenantId = req.user.tenantId;
    return this.chatbotConfigService.upsertConfig(tenantId, configData);
  }

  @Put('general')
  @ApiOperation({ summary: 'Mettre à jour les informations générales' })
  async updateGeneralInfo(@Request() req, @Body() generalInfo: any) {
    const tenantId = req.user.tenantId;
    return this.chatbotConfigService.updateGeneralInfo(tenantId, generalInfo);
  }

  @Put('hours')
  @ApiOperation({ summary: 'Mettre à jour les horaires' })
  async updateBusinessHours(@Request() req, @Body() businessHours: any) {
    const tenantId = req.user.tenantId;
    return this.chatbotConfigService.updateBusinessHours(tenantId, businessHours);
  }

  @Post('faq')
  @ApiOperation({ summary: 'Ajouter une FAQ' })
  async addFAQ(@Request() req, @Body() faq: any) {
    const tenantId = req.user.tenantId;
    return this.chatbotConfigService.addFAQ(tenantId, faq);
  }

  @Delete('faq/:index')
  @ApiOperation({ summary: 'Supprimer une FAQ' })
  async removeFAQ(@Request() req, @Param('index') index: number) {
    const tenantId = req.user.tenantId;
    return this.chatbotConfigService.removeFAQ(tenantId, index);
  }

  @Get('status/open')
  @ApiOperation({ summary: 'Vérifier si la boutique est ouverte' })
  async isStoreOpen(@Request() req) {
    const tenantId = req.user.tenantId;
    const isOpen = await this.chatbotConfigService.isStoreOpen(tenantId);
    return { isOpen };
  }

  @Get('welcome-message')
  @ApiOperation({ summary: 'Récupérer le message de bienvenue' })
  async getWelcomeMessage(@Request() req) {
    const tenantId = req.user.tenantId;
    const message = await this.chatbotConfigService.getWelcomeMessage(tenantId);
    return { message };
  }

  @Get('payment-methods')
  @ApiOperation({ summary: 'Récupérer les moyens de paiement' })
  async getPaymentMethods(@Request() req) {
    const tenantId = req.user.tenantId;
    const methods = await this.chatbotConfigService.getPaymentMethods(tenantId);
    return { methods };
  }

  @Get('shipping-info')
  @ApiOperation({ summary: 'Récupérer les infos de livraison' })
  async getShippingInfo(@Request() req, @Query('location') location?: string) {
    const tenantId = req.user.tenantId;
    const info = await this.chatbotConfigService.getShippingInfo(tenantId, location);
    return { info };
  }

  @Get('faq/search')
  @ApiOperation({ summary: 'Rechercher dans les FAQs' })
  async searchFAQ(@Request() req, @Query('q') query: string) {
    const tenantId = req.user.tenantId;
    const answer = await this.chatbotConfigService.searchFAQ(tenantId, query);
    return { answer };
  }

  @Post('toggle')
  @ApiOperation({ summary: 'Activer/Désactiver le chatbot' })
  async toggleChatbot(@Request() req, @Body('isActive') isActive: boolean) {
    const tenantId = req.user.tenantId;
    return this.chatbotConfigService.toggleChatbot(tenantId, isActive);
  }
}

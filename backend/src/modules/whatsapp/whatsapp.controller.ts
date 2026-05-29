import { Controller, Post, Get, Body, Query, UseGuards, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { WhatsAppService } from './whatsapp.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { TenantId } from '../../common/decorators/tenant.decorator';
import {
  WhatsAppSendMessageDto,
  SendTemplateDto,
  SendMediaDto,
  OrderNotificationDto,
  LowStockAlertDto,
} from './dto/send-message.dto';

@ApiTags('whatsapp')
@Controller('whatsapp')
@UseGuards(JwtAuthGuard, TenantGuard)
@ApiBearerAuth()
export class WhatsAppController {
  constructor(private readonly whatsappService: WhatsAppService) {}

  @Post('send-message')
  @ApiOperation({ summary: 'Envoyer un message texte WhatsApp', description: 'Envoie un message texte simple à un numéro WhatsApp' })
  @ApiResponse({ status: 201, description: 'Message envoyé avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  async sendMessage(@TenantId() tenantId: string, @Body() dto: WhatsAppSendMessageDto) {
    return this.whatsappService.sendTextMessage(tenantId, dto);
  }

  @Post('send-template')
  @ApiOperation({ summary: 'Envoyer un message template', description: 'Envoie un message depuis un template pré-défini' })
  @ApiResponse({ status: 201, description: 'Message envoyé' })
  async sendTemplate(@TenantId() tenantId: string, @Body() dto: SendTemplateDto) {
    return this.whatsappService.sendTemplateMessage(tenantId, dto);
  }

  @Post('notifications/order')
  @ApiOperation({ summary: 'Notification nouvelle commande', description: 'Envoie une notification automatique pour une nouvelle commande' })
  @ApiResponse({ status: 201, description: 'Notification envoyée' })
  async sendOrderNotification(@TenantId() tenantId: string, @Body() dto: OrderNotificationDto) {
    return this.whatsappService.sendOrderNotification(tenantId, dto);
  }

  @Post('notifications/low-stock')
  @ApiOperation({ summary: 'Alerte stock faible', description: 'Envoie une alerte quand un produit est en rupture de stock' })
  @ApiResponse({ status: 201, description: 'Alerte envoyée' })
  async sendLowStockAlert(@TenantId() tenantId: string, @Body() dto: LowStockAlertDto) {
    return this.whatsappService.sendLowStockAlert(tenantId, dto);
  }

  @Get('messages')
  @ApiOperation({ summary: 'Historique des messages', description: 'Récupère l\'historique des messages WhatsApp' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 50 })
  @ApiQuery({ name: 'skip', required: false, type: Number, example: 0 })
  @ApiResponse({ status: 200, description: 'Liste des messages' })
  async getMessages(
    @TenantId() tenantId: string,
    @Query('limit') limit?: number,
    @Query('skip') skip?: number,
  ) {
    return this.whatsappService.getMessages(tenantId, limit || 50, skip || 0);
  }

  @Get('messages/:phoneNumber')
  @ApiOperation({ summary: 'Messages avec un contact', description: 'Récupère les messages échangés avec un numéro spécifique' })
  @ApiResponse({ status: 200, description: 'Conversation' })
  async getMessagesByPhone(
    @TenantId() tenantId: string,
    @Param('phoneNumber') phoneNumber: string,
    @Query('limit') limit?: number,
  ) {
    return this.whatsappService.getMessagesByPhone(tenantId, phoneNumber, limit || 50);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Statistiques des messages', description: 'Obtient les statistiques d\'envoi WhatsApp' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Statistiques' })
  async getStatistics(
    @TenantId() tenantId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.whatsappService.getStatistics(
      tenantId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get('configuration')
  @ApiOperation({ summary: 'Vérifier configuration', description: 'Vérifie si WhatsApp Business est configuré' })
  @ApiResponse({ status: 200, description: 'Statut configuration' })
  async checkConfiguration() {
    return this.whatsappService.checkConfiguration();
  }

  @Get('chat-widget-url')
  @ApiOperation({ summary: 'URL widget de chat', description: 'Obtient l\'URL du widget WhatsApp pour intégration sur site web' })
  @ApiQuery({ name: 'message', required: false, type: String })
  @ApiResponse({ status: 200, description: 'URL du widget' })
  getWhatsAppChatUrl(@Query('message') message?: string) {
    return {
      url: this.whatsappService.getWhatsAppChatUrl(message),
      businessNumber: process.env.WHATSAPP_BUSINESS_NUMBER,
    };
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Webhook messages entrants (legacy — utiliser /public/whatsapp/webhook)' })
  @ApiResponse({ status: 200, description: 'Message traité' })
  async handleWebhookLegacy(@Body() payload: Record<string, unknown>) {
    return this.whatsappService.handleIncomingMessage(payload);
  }
}

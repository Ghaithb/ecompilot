import { Controller, Get, Post, Body, Query, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { WhatsAppService } from './whatsapp.service';

@ApiTags('whatsapp')
@Controller('public/whatsapp')
export class WhatsAppWebhookController {
  constructor(private readonly whatsappService: WhatsAppService) {}

  @Get('webhook')
  @ApiOperation({ summary: 'Vérification webhook Meta WhatsApp Cloud API' })
  @ApiQuery({ name: 'hub.mode', required: false })
  @ApiQuery({ name: 'hub.verify_token', required: false })
  @ApiQuery({ name: 'hub.challenge', required: false })
  verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
  ) {
    return this.whatsappService.verifyWebhook(mode, token, challenge);
  }

  @Post('webhook')
  @HttpCode(200)
  @ApiOperation({ summary: 'Réception messages entrants Meta WhatsApp' })
  handleWebhook(@Body() payload: Record<string, unknown>) {
    return this.whatsappService.handleIncomingMessage(payload);
  }
}

import { Controller, Get, Post, Body, Param, Query, Req, HttpCode, HttpStatus, RawBodyRequest, Res } from '@nestjs/common';
import { VoiceCallsService } from './voice-calls.service';
import { CreateAbandonedCartCallDto, CreateVoiceCallDto, GetCallsQueryDto } from './dto/voice-call.dto';
import { Request, Response } from 'express';

@Controller('voice-calls')
export class VoiceCallsController {
  constructor(private readonly voiceCallsService: VoiceCallsService) {}

  /**
   * Créer un appel pour panier abandonné
   */
  @Post('abandoned-cart')
  async createAbandonedCartCall(
    @Body() createCallDto: CreateAbandonedCartCallDto,
    @Req() req: any,
  ) {
    const tenantId = req.user?.tenantId || req.headers['x-tenant-id'];
    return this.voiceCallsService.createAbandonedCartCall(tenantId, createCallDto);
  }

  /**
   * Créer un appel vocal générique
   */
  @Post()
  async createCall(
    @Body() createCallDto: CreateVoiceCallDto,
    @Req() req: any,
  ) {
    const tenantId = req.user?.tenantId || req.headers['x-tenant-id'];
    
    // TODO: Implémenter la création générique
    throw new Error('Not implemented');
  }

  /**
   * Initier un appel
   */
  @Post(':id/initiate')
  async initiateCall(@Param('id') id: string) {
    return this.voiceCallsService.initiateCall(id);
  }

  /**
   * Réessayer un appel
   */
  @Post(':id/retry')
  async retryCall(@Param('id') id: string) {
    return this.voiceCallsService.retryCall(id);
  }

  /**
   * Récupérer tous les appels
   */
  @Get()
  async findAll(
    @Query() query: GetCallsQueryDto,
    @Req() req: any,
  ) {
    const tenantId = req.user?.tenantId || req.headers['x-tenant-id'];
    return this.voiceCallsService.findAll(tenantId, query);
  }

  /**
   * Obtenir les statistiques
   */
  @Get('stats')
  async getStats(@Req() req: any) {
    const tenantId = req.user?.tenantId || req.headers['x-tenant-id'];
    return this.voiceCallsService.getStats(tenantId);
  }

  /**
   * Générer le script TwiML pour un appel
   */
  @Get('twiml/:id')
  @HttpCode(HttpStatus.OK)
  async getTwiML(@Param('id') id: string, @Res() res: Response) {
    const call = await this.voiceCallsService['voiceCallModel'].findById(id);
    if (!call) {
      return res.status(404).send('Call not found');
    }

    const twiml = this.voiceCallsService.generateTwiML(call);
    res.type('text/xml');
    return res.send(twiml);
  }

  /**
   * Webhook pour le statut de l'appel Twilio
   */
  @Post('webhook/status')
  @HttpCode(HttpStatus.OK)
  async handleStatusWebhook(@Body() body: any) {
    const { CallSid, CallStatus, CallDuration } = body;
    await this.voiceCallsService.handleStatusWebhook(CallSid, CallStatus, CallDuration);
    return { success: true };
  }

  /**
   * Webhook pour la réponse du client (touche appuyée)
   */
  @Post('webhook/gather/:id')
  @HttpCode(HttpStatus.OK)
  async handleGatherWebhook(
    @Param('id') id: string,
    @Body() body: any,
    @Res() res: Response,
  ) {
    const digit = body.Digits;
    const twiml = await this.voiceCallsService.handleGatherResponse(id, digit);
    res.type('text/xml');
    return res.send(twiml);
  }

  /**
   * Webhook pour l'enregistrement de l'appel
   */
  @Post('webhook/recording')
  @HttpCode(HttpStatus.OK)
  async handleRecordingWebhook(@Body() body: any) {
    const { CallSid, RecordingUrl, TranscriptionText } = body;
    await this.voiceCallsService.handleRecordingWebhook(CallSid, RecordingUrl, TranscriptionText);
    return { success: true };
  }
}

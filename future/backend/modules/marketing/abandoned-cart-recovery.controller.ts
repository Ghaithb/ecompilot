import { Controller, Post, Get, Param, Req } from '@nestjs/common';
import { MultiChannelOrchestratorService } from './multi-channel-orchestrator.service';

@Controller('abandoned-cart-recovery')
export class AbandonedCartRecoveryController {
  constructor(
    private readonly orchestratorService: MultiChannelOrchestratorService,
  ) {}

  /**
   * Démarrer manuellement une séquence de récupération
   */
  @Post(':cartId/start')
  async startRecovery(
    @Param('cartId') cartId: string,
    @Req() req: any,
  ) {
    const tenantId = req.user?.tenantId || req.headers['x-tenant-id'];
    await this.orchestratorService.startRecoverySequence(tenantId, cartId);
    return { success: true, message: 'Recovery sequence started' };
  }

  /**
   * Envoyer un rappel WhatsApp immédiat
   */
  @Post(':cartId/send-whatsapp')
  async sendWhatsApp(
    @Param('cartId') cartId: string,
    @Req() req: any,
  ) {
    const tenantId = req.user?.tenantId || req.headers['x-tenant-id'];
    await this.orchestratorService.sendWhatsAppReminder(tenantId, cartId);
    return { success: true, message: 'WhatsApp reminder sent' };
  }

  /**
   * Marquer un panier comme récupéré
   */
  @Post(':cartId/mark-recovered')
  async markRecovered(
    @Param('cartId') cartId: string,
    @Req() req: any,
  ) {
    await this.orchestratorService.markCartRecovered(cartId, 'manual' as any);
    return { success: true, message: 'Cart marked as recovered' };
  }

  /**
   * Obtenir les statistiques de récupération
   */
  @Get('stats')
  async getStats(@Req() req: any) {
    const tenantId = req.user?.tenantId || req.headers['x-tenant-id'];
    return this.orchestratorService.getRecoveryStats(tenantId);
  }
}

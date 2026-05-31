import { Body, Controller, Headers, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { DeliveryProviderId } from './enums/delivery-provider.enum';
import { DeliveryWebhookHandler } from './services/delivery-webhook.handler';

@ApiTags('delivery-webhooks')
@Controller('delivery/webhooks')
export class DeliveryWebhookController {
  constructor(private handler: DeliveryWebhookHandler) {}

  @Post(':provider')
  @ApiOperation({ summary: 'Webhook statut transporteur (public)' })
  async handle(
    @Param('provider') provider: DeliveryProviderId,
    @Body() body: Record<string, unknown>,
    @Headers('x-webhook-secret') secret?: string,
    @Headers('x-tenant-id') tenantId?: string,
  ) {
    this.handler.assertSecret(secret);
    return this.handler.handle(provider, body, { tenantId });
  }
}

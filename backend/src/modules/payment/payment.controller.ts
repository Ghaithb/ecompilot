import { Controller, Post, Get, Body, Param, UseGuards, Query, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import { TunisiaPaymentService } from './tunisia-payment.service';
import { CreateMobileMoneyPaymentDto, MobileMoneyWebhookDto } from './dto/mobile-money-payment.dto';
import {
  ConfigureCodDto,
  ConnectFlouciDto,
  ConnectKonnectDto,
  CreatePaymentIntentDto,
  InitiateOrderPaymentDto,
} from './dto/tunisia-payment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { TenantId } from '../../common/decorators/tenant.decorator';

@ApiTags('payment')
@Controller('payment')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly tunisiaPaymentService: TunisiaPaymentService,
  ) {}

  @Post('mobile-money/create')
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Créer un paiement Mobile Money', description: 'Crée un paiement via CinetPay (Orange Money, MTN, Moov, Wave, etc.)' })
  @ApiResponse({ status: 201, description: 'Paiement créé avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  async createMobileMoneyPayment(
    @Body() dto: CreateMobileMoneyPaymentDto,
    @TenantId() tenantId: string,
  ) {
    return this.paymentService.createMobileMoneyPayment(dto, tenantId);
  }

  @Get('mobile-money/status/:transactionId')
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Vérifier le statut d\'un paiement', description: 'Vérifie le statut d\'une transaction Mobile Money' })
  @ApiResponse({ status: 200, description: 'Statut récupéré avec succès' })
  async checkPaymentStatus(@Param('transactionId') transactionId: string) {
    return this.paymentService.checkPaymentStatus(transactionId);
  }

  @Post('mobile-money/webhook')
  @ApiOperation({ summary: 'Webhook CinetPay', description: 'Endpoint pour recevoir les notifications de paiement de CinetPay' })
  @ApiResponse({ status: 200, description: 'Webhook traité avec succès' })
  async handleMobileMoneyWebhook(
    @Body() payload: MobileMoneyWebhookDto,
    @Headers('x-cinetpay-signature') signature: string,
  ) {
    await this.paymentService.handleWebhook(payload, signature);
    return { success: true, message: 'Webhook processed' };
  }

  @Get('mobile-money/providers/:country')
  @ApiOperation({ summary: 'Providers disponibles', description: 'Liste les providers Mobile Money disponibles pour un pays' })
  @ApiResponse({ status: 200, description: 'Liste des providers' })
  getAvailableProviders(@Param('country') country: string) {
    return this.paymentService.getAvailableProviders(country);
  }

  // ===== PAIEMENTS TUNISIE (Konnect, Flouci, COD) =====

  @Get('tunisia/status')
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Statut des paiements tunisiens' })
  getTunisiaStatus(@TenantId() tenantId: string) {
    return this.tunisiaPaymentService.getStatus(tenantId);
  }

  @Post('tunisia/konnect/connect')
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiBearerAuth()
  connectKonnect(@TenantId() tenantId: string, @Body() dto: ConnectKonnectDto) {
    return this.tunisiaPaymentService.connectKonnect(tenantId, dto);
  }

  @Post('tunisia/flouci/connect')
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiBearerAuth()
  connectFlouci(@TenantId() tenantId: string, @Body() dto: ConnectFlouciDto) {
    return this.tunisiaPaymentService.connectFlouci(tenantId, dto);
  }

  @Post('tunisia/cod/configure')
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiBearerAuth()
  configureCod(@TenantId() tenantId: string, @Body() dto: ConfigureCodDto) {
    return this.tunisiaPaymentService.configureCod(tenantId, dto);
  }

  @Post('tunisia/:provider/disconnect')
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiBearerAuth()
  disconnectTunisiaProvider(
    @TenantId() tenantId: string,
    @Param('provider') provider: 'konnect' | 'flouci',
  ) {
    return this.tunisiaPaymentService.disconnectProvider(tenantId, provider);
  }

  @Post('tunisia/initiate')
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiBearerAuth()
  initiateTunisiaPayment(@TenantId() tenantId: string, @Body() dto: InitiateOrderPaymentDto) {
    return this.tunisiaPaymentService.initiateOrderPayment(tenantId, dto.orderId, dto.provider);
  }

  @Post('create-intent')
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Initier un paiement en ligne pour une commande' })
  createPaymentIntent(@TenantId() tenantId: string, @Body() dto: CreatePaymentIntentDto) {
    const provider = dto.provider || 'konnect';
    return this.tunisiaPaymentService.initiateOrderPayment(tenantId, dto.orderId, provider);
  }

  @Get('tunisia/verify/:orderId')
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiBearerAuth()
  verifyTunisiaPayment(@TenantId() tenantId: string, @Param('orderId') orderId: string) {
    return this.tunisiaPaymentService.verifyOrderPayment(tenantId, orderId);
  }

  @Get('tunisia/webhook/konnect')
  @ApiOperation({ summary: 'Webhook Konnect' })
  konnectWebhook(@Query('payment_ref') paymentRef: string) {
    return this.tunisiaPaymentService.handleWebhook('konnect', paymentRef);
  }

  @Get('tunisia/webhook/flouci')
  @ApiOperation({ summary: 'Webhook Flouci' })
  flouciWebhook(@Query('payment_id') paymentId: string) {
    return this.tunisiaPaymentService.handleWebhook('flouci', paymentId);
  }
}

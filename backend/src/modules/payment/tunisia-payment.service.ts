import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import crypto from 'crypto';
import { Tenant, TenantDocument } from '../tenants/schemas/tenant.schema';
import { Order, OrderDocument } from '../orders/schemas/order.schema';
import { KonnectProvider } from './providers/konnect.provider';
import { FlouciProvider } from './providers/flouci.provider';
import {
  ConfigureCodDto,
  ConnectFlouciDto,
  ConnectKonnectDto,
} from './dto/tunisia-payment.dto';
import { PaymentInitRequest } from './providers/payment-gateway.interface';

export interface TunisiaPaymentStatus {
  cod: { enabled: boolean; otpRequired: boolean };
  konnect: { connected: boolean; sandbox?: boolean; walletId?: string };
  flouci: { connected: boolean; sandbox?: boolean };
  availableMethods: string[];
}

@Injectable()
export class TunisiaPaymentService {
  private readonly logger = new Logger(TunisiaPaymentService.name);

  constructor(
    @InjectModel(Tenant.name) private tenantModel: Model<TenantDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    private readonly konnectProvider: KonnectProvider,
    private readonly flouciProvider: FlouciProvider,
    private readonly configService: ConfigService,
  ) {}

  private get encryptionKey() {
    return (
      this.configService.get<string>('integrations.tokensKey') ||
      this.configService.get<string>('jwt.secret') ||
      'default-secret-key-for-dev-only!!'
    );
  }

  private encrypt(value: string): string {
    const key = this.encryptionKey;
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(key, 'utf8').subarray(0, 32), iv);
    const ciphertext = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    return Buffer.concat([iv, tag, ciphertext]).toString('base64');
  }

  private decrypt(enc: string): string {
    const key = this.encryptionKey;
    const buf = Buffer.from(enc, 'base64');
    const iv = buf.subarray(0, 12);
    const tag = buf.subarray(12, 28);
    const ciphertext = buf.subarray(28);
    const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(key, 'utf8').subarray(0, 32), iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');
  }

  private backendUrl() {
    return this.configService.get<string>('BACKEND_URL') || 'http://127.0.0.1:3000';
  }

  private frontendUrl() {
    return this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';
  }

  async connectKonnect(tenantId: string, dto: ConnectKonnectDto) {
    await this.tenantModel.findByIdAndUpdate(tenantId, {
      $set: {
        'integrations.konnect': {
          walletId: dto.walletId,
          apiKeyEnc: this.encrypt(dto.apiKey),
          sandbox: dto.sandbox ?? true,
          connectedAt: new Date(),
        },
      },
    });
    return { success: true, message: 'Konnect connecté avec succès' };
  }

  async connectFlouci(tenantId: string, dto: ConnectFlouciDto) {
    await this.tenantModel.findByIdAndUpdate(tenantId, {
      $set: {
        'integrations.flouci': {
          publicKeyEnc: this.encrypt(dto.publicKey),
          privateKeyEnc: this.encrypt(dto.privateKey),
          sandbox: dto.sandbox ?? true,
          connectedAt: new Date(),
        },
      },
    });
    return { success: true, message: 'Flouci connecté avec succès' };
  }

  async configureCod(tenantId: string, dto: ConfigureCodDto) {
    await this.tenantModel.findByIdAndUpdate(tenantId, {
      $set: {
        'integrations.cod': {
          enabled: dto.enabled,
          otpRequired: dto.otpRequired ?? true,
          configuredAt: new Date(),
        },
      },
    });
    return { success: true, message: 'Configuration COD enregistrée' };
  }

  async disconnectProvider(tenantId: string, provider: 'konnect' | 'flouci') {
    await this.tenantModel.findByIdAndUpdate(tenantId, {
      $unset: { [`integrations.${provider}`]: '' },
    });
    return { success: true };
  }

  async getStatus(tenantId: string): Promise<TunisiaPaymentStatus> {
    const tenant = await this.tenantModel.findById(tenantId);
    if (!tenant) throw new NotFoundException('Tenant introuvable');

    const integrations = tenant.integrations || {};
    const cod = integrations.cod || { enabled: true, otpRequired: true };
    const konnect = integrations.konnect;
    const flouci = integrations.flouci;

    const availableMethods: string[] = [];
    if (cod.enabled !== false) availableMethods.push('cod');
    if (konnect?.apiKeyEnc && konnect?.walletId) availableMethods.push('konnect');
    if (flouci?.publicKeyEnc && flouci?.privateKeyEnc) availableMethods.push('flouci');

    return {
      cod: { enabled: cod.enabled !== false, otpRequired: cod.otpRequired !== false },
      konnect: {
        connected: !!(konnect?.apiKeyEnc && konnect?.walletId),
        sandbox: konnect?.sandbox,
        walletId: konnect?.walletId,
      },
      flouci: {
        connected: !!(flouci?.publicKeyEnc && flouci?.privateKeyEnc),
        sandbox: flouci?.sandbox,
      },
      availableMethods,
    };
  }

  async getPublicPaymentMethods(tenantId: string) {
    const status = await this.getStatus(tenantId);
    return {
      methods: status.availableMethods.map((id) => ({
        id,
        label: id === 'cod' ? 'Paiement à la livraison' : id === 'konnect' ? 'Konnect' : 'Flouci',
      })),
    };
  }

  async initiateOrderPayment(
    tenantId: string,
    orderId: string,
    provider: 'konnect' | 'flouci',
  ) {
    const order = await this.orderModel.findOne({ _id: orderId, tenantId });
    if (!order) throw new NotFoundException('Commande introuvable');

    if (order.paymentStatus === 'paid') {
      throw new BadRequestException('Commande déjà payée');
    }

    const tenant = await this.tenantModel.findById(tenantId);
    if (!tenant) throw new NotFoundException('Tenant introuvable');

    const request: PaymentInitRequest = {
      amountTnd: order.total,
      orderId: order._id.toString(),
      orderNumber: order.orderNumber,
      description: `Commande ${order.orderNumber}`,
      customer: {
        firstName: order.shippingAddress?.firstName,
        lastName: order.shippingAddress?.lastName,
        email: order.customerEmail,
        phone: order.shippingAddress?.phone,
      },
      webhookUrl: `${this.backendUrl()}/api/v1/payment/tunisia/webhook/${provider}`,
      successUrl: `${this.frontendUrl()}/payment/return?status=success&orderId=${orderId}`,
      failUrl: `${this.frontendUrl()}/payment/return?status=failed&orderId=${orderId}`,
    };

    let result;
    if (provider === 'konnect') {
      const creds = tenant.integrations?.konnect;
      if (!creds?.apiKeyEnc || !creds?.walletId) {
        throw new BadRequestException('Konnect non configuré');
      }
      result = await this.konnectProvider.initiatePayment(
        {
          apiKey: this.decrypt(creds.apiKeyEnc),
          walletId: creds.walletId,
          sandbox: creds.sandbox,
        },
        request,
      );
    } else {
      const creds = tenant.integrations?.flouci;
      if (!creds?.publicKeyEnc || !creds?.privateKeyEnc) {
        throw new BadRequestException('Flouci non configuré');
      }
      result = await this.flouciProvider.initiatePayment(
        {
          publicKey: this.decrypt(creds.publicKeyEnc),
          privateKey: this.decrypt(creds.privateKeyEnc),
          sandbox: creds.sandbox,
        },
        request,
      );
    }

    order.paymentMethod = provider;
    order.metadata = {
      ...(order.metadata || {}),
      paymentProvider: provider,
      paymentReference: result.providerReference,
    };
    await order.save();

    return {
      success: true,
      paymentUrl: result.paymentUrl,
      providerReference: result.providerReference,
      provider,
    };
  }

  async handleWebhook(provider: 'konnect' | 'flouci', reference: string) {
    const order = await this.orderModel.findOne({
      'metadata.paymentReference': reference,
    });
    if (!order) {
      this.logger.warn(`Webhook ${provider}: commande introuvable pour ref ${reference}`);
      return { processed: false };
    }

    const tenant = await this.tenantModel.findById(order.tenantId);
    if (!tenant) return { processed: false };

    let verification;
    if (provider === 'konnect') {
      const creds = tenant.integrations?.konnect;
      if (!creds?.apiKeyEnc) return { processed: false };
      verification = await this.konnectProvider.verifyPayment(
        { apiKey: this.decrypt(creds.apiKeyEnc), walletId: creds.walletId, sandbox: creds.sandbox },
        reference,
      );
    } else {
      const creds = tenant.integrations?.flouci;
      if (!creds?.publicKeyEnc || !creds?.privateKeyEnc) return { processed: false };
      verification = await this.flouciProvider.verifyPayment(
        {
          publicKey: this.decrypt(creds.publicKeyEnc),
          privateKey: this.decrypt(creds.privateKeyEnc),
          sandbox: creds.sandbox,
        },
        reference,
      );
    }

    if (verification.status === 'completed') {
      await this.markOrderPaid(order, provider, reference);
    }

    return { processed: true, status: verification.status };
  }

  async verifyOrderPayment(tenantId: string, orderId: string) {
    const order = await this.orderModel.findOne({ _id: orderId, tenantId });
    if (!order) throw new NotFoundException('Commande introuvable');

    const ref = order.metadata?.paymentReference as string | undefined;
    const provider = order.metadata?.paymentProvider as 'konnect' | 'flouci' | undefined;

    if (!ref || !provider) {
      return { paid: order.paymentStatus === 'paid', status: order.paymentStatus };
    }

    const webhookResult = await this.handleWebhook(provider, ref);
    const updated = await this.orderModel.findById(orderId);
    return {
      paid: updated?.paymentStatus === 'paid',
      status: updated?.paymentStatus,
      verification: webhookResult.status,
    };
  }

  private async markOrderPaid(order: OrderDocument, provider: string, reference: string) {
    if (order.paymentStatus === 'paid') return;

    order.paymentStatus = 'paid';
    order.status = order.status === 'pending' ? 'confirmed' : order.status;
    order.paymentDetails = {
      provider,
      transactionId: reference,
      amount: order.total,
      currency: order.currency,
      status: 'paid',
      paidAt: new Date(),
    };
    order.statusHistory = order.statusHistory || [];
    order.statusHistory.push({
      status: 'confirmed',
      changedAt: new Date(),
      changedBy: 'payment-webhook',
    });
    await order.save();
    this.logger.log(`Commande ${order.orderNumber} marquée payée via ${provider}`);
  }
}

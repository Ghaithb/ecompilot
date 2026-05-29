import { Test, TestingModule } from '@nestjs/testing';
import { BillingService } from './billing.service';
import { getModelToken } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import Stripe from 'stripe';

describe('BillingService', () => {
  let service: BillingService;
  let orderModel: any;
  let tenantModel: any;
  let configService: any;
  let stripeMock: any;

  beforeEach(async () => {
    orderModel = { findById: jest.fn() };
    tenantModel = { findById: jest.fn(), findByIdAndUpdate: jest.fn() };
    configService = { get: jest.fn((key) => {
      if (key === 'STRIPE_SECRET_KEY') return 'sk_test_123';
      if (key === 'FRONTEND_URL') return 'http://localhost:3000';
      return undefined;
    }) };
    stripeMock = {
      customers: {
        create: jest.fn().mockResolvedValue({ id: 'cus_123' })
      },
      checkout: {
        sessions: {
          create: jest.fn().mockResolvedValue({ 
            id: 'cs_123',
            url: 'https://checkout.stripe.com/pay/cs_123'
          }),
          retrieve: jest.fn().mockResolvedValue({
            id: 'cs_123',
            metadata: { orderId: 'order_123' },
            payment_status: 'paid'
          })
        }
      }
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BillingService,
        { provide: getModelToken('Order'), useValue: orderModel },
        { provide: getModelToken('Tenant'), useValue: tenantModel },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = module.get<BillingService>(BillingService);
    // Inject Stripe mock into service after instance creation
    (service as any).stripe = stripeMock;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createCheckoutSession', () => {
    it('should throw if order not found', async () => {
      orderModel.findById.mockResolvedValue(null);
      await expect(service.createCheckoutSession('orderId', 'tenantId')).rejects.toThrow('Order not found');
    });
    it('should throw if tenant not found', async () => {
      orderModel.findById.mockResolvedValue({});
      tenantModel.findById.mockResolvedValue(null);
      await expect(service.createCheckoutSession('orderId', 'tenantId')).rejects.toThrow('Tenant not found');
    });
    it('should create a checkout session and return session info', async () => {
      const order = {
        customerEmail: 'test@example.com',
        lineItems: [
          { title: 'Test', description: 'desc', images: [], price: 10, quantity: 1 },
        ],
      };
      const tenant = { _id: { toString: () => 'tenantId' }, integrations: {} };
      orderModel.findById.mockResolvedValue(order);
      tenantModel.findById.mockResolvedValue(tenant);
      stripeMock.customers.create.mockResolvedValue({ id: 'cus_123' });
      tenantModel.findByIdAndUpdate.mockResolvedValue({});
      stripeMock.checkout.sessions.create.mockResolvedValue({ id: 'sess_123', url: 'http://stripe.com/session' });
      const result = await service.createCheckoutSession('orderId', 'tenantId');
      expect(result).toEqual({ sessionId: 'sess_123', url: 'http://stripe.com/session' });
    });
  });

  describe('handlePaymentSuccess', () => {
    it('should throw if orderId not in session metadata', async () => {
      stripeMock.checkout.sessions.retrieve.mockResolvedValue({ metadata: {} });
      await expect(service.handlePaymentSuccess('sess_123')).rejects.toThrow('Order ID not found in session metadata');
    });
    it('should throw if order not found', async () => {
      stripeMock.checkout.sessions.retrieve.mockResolvedValue({ metadata: { orderId: 'orderId' } });
      orderModel.findById.mockResolvedValue(null);
      await expect(service.handlePaymentSuccess('sess_123')).rejects.toThrow('Order not found');
    });
    it('should update order and return success', async () => {
  const order = { save: jest.fn(), paymentStatus: '', paymentDetails: { provider: '', transactionId: '', amount: 0, currency: '', status: '', paidAt: null }, updatedAt: null };
      stripeMock.checkout.sessions.retrieve.mockResolvedValue({
        metadata: { orderId: 'orderId' },
        payment_intent: 'pi_123',
        amount_total: 1000,
        currency: 'eur',
      });
      orderModel.findById.mockResolvedValue(order);
      const result = await service.handlePaymentSuccess('sess_123');
      expect(order.paymentStatus).toBe('paid');
  expect(order.paymentDetails.provider).toBe('stripe');
      expect(result.success).toBe(true);
      expect(result.order).toBe(order);
    });
  });
});

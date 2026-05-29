import { z } from 'zod';
import { OrderStatus } from '../../../common/enums/order-status.enum';

const orderStatusValues = Object.values(OrderStatus) as [string, ...string[]];

export const shippingAddressSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  address1: z.string().min(1).max(300),
  address2: z.string().max(300).optional(),
  city: z.string().min(1).max(100),
  province: z.string().min(1).max(100),
  country: z.string().length(2).default('TN'),
  zip: z.string().max(20).default(''),
  phone: z.string().min(8).max(20),
});

export const lineItemSchema = z.object({
  productId: z.string().optional(),
  title: z.string().min(1).max(200),
  quantity: z.number().int().positive().max(9999),
  unitPrice: z.number().nonnegative(),
});

export const createOrderSchema = z.object({
  customerEmail: z.string().email(),
  lineItems: z.array(lineItemSchema).min(1).max(50),
  currency: z.string().length(3).default('TND'),
  paymentMethod: z.enum(['cod', 'stripe', 'bank_transfer', 'paymee', 'konnekt']).default('cod'),
  shippingAmount: z.number().nonnegative().default(0),
  taxAmount: z.number().nonnegative().default(0),
  discountAmount: z.number().nonnegative().default(0),
  shippingAddress: shippingAddressSchema,
  metadata: z.record(z.string(), z.any()).optional(),
});

export const listOrdersQuerySchema = z.object({
  status: z.enum(orderStatusValues).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().max(100).optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(orderStatusValues),
  note: z.string().max(500).optional(),
});

export const linkShipmentSchema = z.object({
  shipmentId: z.string().min(1),
  trackingNumber: z.string().min(1).optional(),
  shippingProvider: z.string().min(1).optional(),
  /** Passe la commande en `shipped` si transition valide (défaut: true) */
  markShipped: z.boolean().default(true),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type ListOrdersQuery = z.infer<typeof listOrdersQuerySchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type LinkShipmentInput = z.infer<typeof linkShipmentSchema>;

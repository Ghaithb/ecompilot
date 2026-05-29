import { OrderDocument } from '../../orders/schemas/order.schema';
import { OrderShipmentContext } from '../interfaces/shipping-provider.interface';

const DEFAULT_WEIGHT_KG = 1;

export function mapOrderToShipmentContext(
  order: OrderDocument,
  options?: { weightKg?: number; localityId?: number; notes?: string },
): OrderShipmentContext {
  const addr = order.shippingAddress;
  const customerName = addr
    ? `${addr.firstName} ${addr.lastName}`.trim()
    : order.customerEmail;

  const lineItems = (order.lineItems || []).map((item) => ({
    title: item.title,
    quantity: item.quantity,
    price: item.price,
  }));

  const itemCount = lineItems.reduce((s, i) => s + i.quantity, 0) || 1;
  const weightKg = options?.weightKg ?? Math.max(0.5, itemCount * 0.3);

  return {
    orderId: order._id.toString(),
    orderNumber: order.orderNumber,
    tenantId: order.tenantId.toString(),
    customerName,
    customerEmail: order.customerEmail,
    customerPhone: addr?.phone || '',
    address: addr?.address1 || '',
    address2: addr?.address2,
    city: addr?.city || 'Tunis',
    province: addr?.province || addr?.city || 'Tunis',
    country: addr?.country || 'TN',
    zip: addr?.zip,
    weightKg,
    codAmount: order.paymentMethod === 'cod' ? order.total : undefined,
    currency: order.currency || 'TND',
    total: order.total,
    lineItems,
    localityId: options?.localityId,
    notes: options?.notes,
  };
}

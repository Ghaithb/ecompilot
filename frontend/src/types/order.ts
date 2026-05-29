export interface ShippingAddress {
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string;
  city: string;
  province: string;
  country: string;
  zip: string;
  phone?: string;
}

export interface OrderLineItem {
  productId: string;
  variantId: string;
  title: string;
  quantity: number;
  price: number;
  discount: number;
  total: number;
}

export type OrderStatus =
  | 'pending'
  | 'created'
  | 'confirmed'
  | 'prepared'
  | 'shipped'
  | 'assigned_to_driver'
  | 'out_for_delivery'
  | 'delivered'
  | 'paid'
  | 'completed'
  | 'refused'
  | 'returned_to_seller'
  | 'return_completed'
  | 'return_rejected'
  | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'failed';

export interface Order {
  _id: string;
  orderNumber: string;
  customerEmail: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  lineItems: OrderLineItem[];
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  discountAmount: number;
  total: number;
  currency: string;
  shippingAddress?: ShippingAddress;
  assignedDriverId?: string;
  paymentMethod?: string;
  createdAt: string;
  updatedAt: string;
}
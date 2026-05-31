/**
 * Phase 3 — Migration batch MongoDB orders → PostgreSQL (Prisma).
 * Usage: npx ts-node -r tsconfig-paths/register scripts/migrate-orders-to-prisma.ts
 * Requires: DATABASE_URL, MONGODB_URI, ORDERS_DUAL_WRITE not required (one-shot ETL).
 */
import mongoose from 'mongoose';
import { PrismaClient } from '@prisma/client';

const BATCH = 100;

async function main() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) throw new Error('MONGODB_URI required');

  await mongoose.connect(mongoUri);
  const prisma = new PrismaClient();
  const orders = mongoose.connection.collection('orders');

  let skip = 0;
  let migrated = 0;
  let errors = 0;

  for (;;) {
    const batch = await orders.find({}).skip(skip).limit(BATCH).toArray();
    if (!batch.length) break;

    for (const order of batch) {
      try {
        const tenantId = String(order.tenantId);
        const orderNumber = order.orderNumber || `MONGO-${order._id}`;
        const lineItems = (order.lineItems || []).map((item: Record<string, unknown>) => ({
          productId: item.productId ? String(item.productId) : undefined,
          title: String(item.name || item.title || 'Produit'),
          quantity: Number(item.quantity || 1),
          unitPrice: Number(item.price ?? item.unitPrice ?? 0),
          total: Number(item.quantity || 1) * Number(item.price ?? item.unitPrice ?? 0),
        }));

        await prisma.order.upsert({
          where: { tenantId_orderNumber: { tenantId, orderNumber } },
          create: {
            tenantId,
            orderNumber,
            customerEmail: String(order.customerEmail || order.shippingAddress?.email || 'cod@local'),
            status: String(order.status || 'created'),
            paymentMethod: String(order.paymentMethod || 'cod'),
            subtotal: Number(order.subtotal ?? order.total ?? 0),
            total: Number(order.total ?? 0),
            currency: String(order.currency || 'TND'),
            shippingAddress: order.shippingAddress ?? {},
            metadata: { mongoId: String(order._id) },
            lineItems: { create: lineItems },
          },
          update: {
            status: String(order.status || 'created'),
            total: Number(order.total ?? 0),
          },
        });
        migrated += 1;
      } catch (e) {
        errors += 1;
        console.error('Order', order._id, e);
      }
    }

    skip += batch.length;
    console.log(`Progress: ${skip} scanned, ${migrated} ok, ${errors} errors`);
  }

  await prisma.$disconnect();
  await mongoose.disconnect();
  console.log(`Done. Migrated ${migrated}, errors ${errors}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

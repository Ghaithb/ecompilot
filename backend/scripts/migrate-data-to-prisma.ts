/**
 * Phase 3 — Migration MongoDB → PostgreSQL (orders + customers + shipments).
 * Usage: npx ts-node -r tsconfig-paths/register scripts/migrate-data-to-prisma.ts
 */
import mongoose from 'mongoose';
import { PrismaClient } from '@prisma/client';

const BATCH = 100;

async function migrateOrders(prisma: PrismaClient, orders: mongoose.Collection) {
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
    console.log(`Orders: ${skip} scanned, ${migrated} ok, ${errors} errors`);
  }

  return { migrated, errors };
}

async function migrateCustomers(prisma: PrismaClient, customers: mongoose.Collection) {
  let skip = 0;
  let migrated = 0;
  let errors = 0;

  for (;;) {
    const batch = await customers.find({}).skip(skip).limit(BATCH).toArray();
    if (!batch.length) break;

    for (const c of batch) {
      try {
        const tenantId = String(c.tenantId);
        const email = String(c.email || `guest-${c._id}@local`);
        await prisma.customer.upsert({
          where: { tenantId_email: { tenantId, email } },
          create: {
            tenantId,
            email,
            firstName: String(c.firstName || 'Client'),
            lastName: String(c.lastName || ''),
            phone: c.phone ? String(c.phone) : undefined,
            status: String(c.status || 'active'),
            tags: c.tags || [],
            stats: c.stats ?? {},
            mongoId: String(c._id),
          },
          update: {
            firstName: String(c.firstName || 'Client'),
            lastName: String(c.lastName || ''),
            phone: c.phone ? String(c.phone) : undefined,
            status: String(c.status || 'active'),
          },
        });
        migrated += 1;
      } catch (e) {
        errors += 1;
        console.error('Customer', c._id, e);
      }
    }

    skip += batch.length;
    console.log(`Customers: ${skip} scanned, ${migrated} ok, ${errors} errors`);
  }

  return { migrated, errors };
}

async function migrateShipments(prisma: PrismaClient, shipments: mongoose.Collection) {
  let skip = 0;
  let migrated = 0;
  let errors = 0;

  for (;;) {
    const batch = await shipments.find({}).skip(skip).limit(BATCH).toArray();
    if (!batch.length) break;

    for (const s of batch) {
      try {
        const tenantId = String(s.tenantId);
        const trackingNumber = String(s.trackingNumber || `TMP-${s._id}`);
        await prisma.shipment.upsert({
          where: { tenantId_trackingNumber: { tenantId, trackingNumber } },
          create: {
            tenantId,
            mongoOrderId: s.orderId ? String(s.orderId) : undefined,
            orderNumber: s.orderNumber ? String(s.orderNumber) : undefined,
            provider: String(s.provider || 'unknown'),
            trackingNumber,
            status: String(s.status || 'created'),
            mock: Boolean(s.mock),
            metadata: { mongoId: String(s._id) },
          },
          update: {
            status: String(s.status || 'created'),
          },
        });
        migrated += 1;
      } catch (e) {
        errors += 1;
        console.error('Shipment', s._id, e);
      }
    }

    skip += batch.length;
    console.log(`Shipments: ${skip} scanned, ${migrated} ok, ${errors} errors`);
  }

  return { migrated, errors };
}

async function main() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) throw new Error('MONGODB_URI required');

  await mongoose.connect(mongoUri);
  const prisma = new PrismaClient();
  const db = mongoose.connection.db!;

  console.log('--- Migrating orders ---');
  await migrateOrders(prisma, db.collection('orders'));

  console.log('--- Migrating customers ---');
  await migrateCustomers(prisma, db.collection('customers'));

  console.log('--- Migrating shipments ---');
  await migrateShipments(prisma, db.collection('shipments'));

  await prisma.$disconnect();
  await mongoose.disconnect();
  console.log('Migration complete.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

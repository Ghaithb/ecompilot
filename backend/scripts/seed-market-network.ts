import { MongoClient, ObjectId } from 'mongodb';

const MONGODB_URI = 'mongodb://localhost:27017/ecompilot';

async function seed() {
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    const db = client.db();

    // 1. Seed Suppliers
    const suppliersCollection = db.collection('suppliers');
    const supplierId = new ObjectId();
    await suppliersCollection.deleteMany({});
    await suppliersCollection.insertOne({
      _id: supplierId,
      name: 'Tunisia Beauty Distribution',
      category: 'Cosmétiques',
      city: 'Tunis',
      whatsapp: '21698765432',
      isVerified: true,
      rating: 4.8,
      responseRate: '95%',
      createdAt: new Date(),
    });

    // 2. Seed Wholesale Products
    const wholesaleProductsCollection = db.collection('wholesaleproducts');
    await wholesaleProductsCollection.deleteMany({});
    await wholesaleProductsCollection.insertMany([
      {
        title: 'Veilleuse LED',
        wholesalePrice: 12,
        retailPriceEstimate: 39,
        stockStatus: 'in_stock',
        supplierId: supplierId,
        createdAt: new Date(),
      },
      {
        title: 'Mini Blender USB',
        wholesalePrice: 25,
        retailPriceEstimate: 65,
        stockStatus: 'in_stock',
        supplierId: supplierId,
        createdAt: new Date(),
      }
    ]);

    // 3. Seed Orders (to calculate winning products)
    const ordersCollection = db.collection('orders');
    await ordersCollection.deleteMany({});
    await ordersCollection.insertMany([
      {
        lineItems: [{ title: 'Mini Blender USB', quantity: 5, total: 325 }],
        status: 'delivered',
        shippingAddress: { province: 'Tunis' },
        createdAt: new Date(),
      },
      {
        lineItems: [{ title: 'Mini Blender USB', quantity: 3, total: 195 }],
        status: 'delivered',
        shippingAddress: { province: 'Sousse' },
        createdAt: new Date(),
      },
      {
        lineItems: [{ title: 'Veilleuse LED', quantity: 10, total: 390 }],
        status: 'delivered',
        shippingAddress: { province: 'Tunis' },
        createdAt: new Date(),
      }
    ]);

    console.log('Seed completed successfully');
  } catch (err) {
    console.error('Seed error:', err);
  } finally {
    await client.close();
  }
}

seed();

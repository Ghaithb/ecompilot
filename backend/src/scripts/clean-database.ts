import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { User } from '../modules/users/schemas/user.schema';
import { Tenant } from '../modules/tenants/schemas/tenant.schema';
import { Product } from '../modules/products/schemas/product.schema';
import { Order } from '../modules/orders/schemas/order.schema';

async function cleanDatabase() {
  console.log('🧹 Nettoyage de la base de données...');
  
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const userModel = app.get<Model<User>>(getModelToken(User.name));
  const tenantModel = app.get<Model<Tenant>>(getModelToken(Tenant.name));
  const productModel = app.get<Model<Product>>(getModelToken(Product.name));
  const orderModel = app.get<Model<Order>>(getModelToken(Order.name));
  
  try {
    // Supprimer tous les documents
    await Promise.all([
      userModel.deleteMany({}),
      tenantModel.deleteMany({}),
      productModel.deleteMany({}),
      orderModel.deleteMany({})
    ]);
    
    console.log('✅ Base de données nettoyée avec succès !');
    console.log('👉 Vous pouvez maintenant vous inscrire avec n\'importe quel email.');
    
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
  } finally {
    await app.close();
  }
}

cleanDatabase().catch(console.error);
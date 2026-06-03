import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ForbiddenException } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { Types } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { Product } from '../src/modules/products/schemas/product.schema';
import { Order } from '../src/modules/orders/schemas/order.schema';
import { Tenant } from '../src/modules/tenants/schemas/tenant.schema';
import { User } from '../src/modules/users/schemas/user.schema';
import { JwtService } from '@nestjs/jwt';

jest.setTimeout(60000);

describe('Tenant Isolation (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let productModel: any;
  let tenantModel: any;
  let userModel: any;

  const tenantAId = new Types.ObjectId();
  const tenantBId = new Types.ObjectId();
  
  let tokenA: string;
  let tokenB: string;

  beforeAll(async () => {
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-at-least-32-chars-long-123456789';
    process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecompilot_test';
    
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    jwtService = moduleFixture.get<JwtService>(JwtService);
    productModel = moduleFixture.get(getModelToken(Product.name));
    tenantModel = moduleFixture.get(getModelToken(Tenant.name));
    userModel = moduleFixture.get(getModelToken(User.name));

    await app.init();

    // Setup Test Data
    await tenantModel.create([
      { _id: tenantAId, name: 'Tenant A', subdomain: 'a', status: 'active', subscription: { status: 'active' } },
      { _id: tenantBId, name: 'Tenant B', subdomain: 'b', status: 'active', subscription: { status: 'active' } }
    ]);

    const userAId = new Types.ObjectId();
    const userBId = new Types.ObjectId();

    await userModel.create([
      { _id: userAId, email: 'admin@a.com', roles: ['admin'], tenantId: tenantAId, password: 'hash', firstName: 'A', lastName: 'Admin', country: 'TN', phone: '1' },
      { _id: userBId, email: 'admin@b.com', roles: ['admin'], tenantId: tenantBId, password: 'hash', firstName: 'B', lastName: 'Admin', country: 'TN', phone: '2' }
    ]);

    tokenA = jwtService.sign({ sub: userAId.toString(), tenantId: tenantAId.toString(), roles: ['admin'] });
    tokenB = jwtService.sign({ sub: userBId.toString(), tenantId: tenantBId.toString(), roles: ['admin'] });

    // Create a product for Tenant A
    await productModel.create({
      title: 'Product A',
      handle: 'prod-a',
      description: 'Desc',
      tenantId: tenantAId,
      status: 'active'
    });
  });

  afterAll(async () => {
    await tenantModel.deleteMany({ _id: { $in: [tenantAId, tenantBId] } });
    await userModel.deleteMany({ tenantId: { $in: [tenantAId, tenantBId] } });
    await productModel.deleteMany({ tenantId: { $in: [tenantAId, tenantBId] } });
    await app.close();
  });

  it('Tenant A should see their products', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/products')
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(200);
    
    expect(res.body.some((p: any) => p.title === 'Product A')).toBe(true);
  });

  it('Tenant B should NOT see products of Tenant A', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/products')
      .set('Authorization', `Bearer ${tokenB}`)
      .expect(200);
    
    expect(res.body.some((p: any) => p.title === 'Product A')).toBe(false);
  });

  it('Tenant B should NOT be able to access Tenant A product by ID', async () => {
    const prodA = await productModel.findOne({ title: 'Product A' });
    
    await request(app.getHttpServer())
      .get(`/api/v1/products/${prodA._id}`)
      .set('Authorization', `Bearer ${tokenB}`)
      .expect(404); // Should be 404 or 403 depending on implementation, but 404 is standard for "not found in your scope"
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { WholesaleService } from './wholesale.service';
import { getModelToken } from '@nestjs/mongoose';
import { Supplier } from './schemas/supplier.schema';
import { WholesaleProduct } from './schemas/wholesale-product.schema';
import { QuoteRequest } from './schemas/quote-request.schema';
import { Product } from '../products/schemas/product.schema';
import { Types } from 'mongoose';

describe('WholesaleService (Supplier Features)', () => {
  let service: WholesaleService;
  let supplierModel: any;
  let productModel: any;

  beforeEach(async () => {
    supplierModel = {
      findOne: jest.fn(),
      create: jest.fn(),
    };
    productModel = {
      find: jest.fn(),
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WholesaleService,
        { provide: getModelToken(Supplier.name), useValue: supplierModel },
        { provide: getModelToken(WholesaleProduct.name), useValue: productModel },
        { provide: getModelToken(QuoteRequest.name), useValue: {} },
        { provide: getModelToken(Product.name), useValue: {} },
      ],
    }).compile();

    service = module.get<WholesaleService>(WholesaleService);
  });

  it('should onboard a supplier', async () => {
    const userId = new Types.ObjectId().toHexString();
    const supplierData = { name: 'Test Supplier', city: 'Tunis', category: 'Electronique' };
    
    supplierModel.create.mockResolvedValueOnce({ ...supplierData, ownerId: userId });

    const result = await service.onboardSupplier(userId, supplierData);
    expect(result.ownerId).toBe(userId);
    expect(supplierModel.create).toHaveBeenCalled();
  });

  it('should list products for a specific supplier user', async () => {
    const userId = new Types.ObjectId().toHexString();
    const supplierId = new Types.ObjectId();
    
    supplierModel.findOne.mockReturnValue({
      _id: supplierId,
      lean: jest.fn().mockReturnValue({ _id: supplierId })
    });
    
    productModel.find.mockReturnValue({
      lean: jest.fn().mockResolvedValue([{ title: 'Supplier Product' }])
    });

    const products = await service.listSupplierProducts(userId);
    expect(products).toHaveLength(1);
    expect(products[0].title).toBe('Supplier Product');
  });
});

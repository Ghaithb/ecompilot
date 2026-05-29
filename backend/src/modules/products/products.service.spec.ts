import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ProductsService } from './products.service';
import { Product } from './schemas/product.schema';
import { CsvUtility } from '../../common/utils/csv.utility';

describe('ProductsService', () => {
  let service: ProductsService;
  let productModel: any;

    const mockProduct = {
    _id: 'product123',
    title: 'Test Product',
    description: 'Test Description',
    handle: 'test-product',
    tenantId: 'tenant123',
    variants: [
      {
        sku: 'SKU123',
        name: 'Default',
        price: 29.99,
        inventory: 10,
        isActive: true,
      },
    ],
    images: [],
    tags: ['test'],
    category: 'Electronics',
    status: 'active',
    save: jest.fn().mockResolvedValue({}),
  };  beforeEach(async () => {
    const mockCsvUtility = {
      parseCsv: jest.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: CsvUtility,
          useValue: mockCsvUtility,
        },
        {
          provide: getModelToken(Product.name),
          useValue: {
            findOne: jest.fn().mockReturnThis(),
            find: jest.fn().mockReturnThis(),
            create: jest.fn().mockResolvedValue(mockProduct),
            findByIdAndUpdate: jest.fn().mockReturnThis(),
            findOneAndUpdate: jest.fn().mockReturnThis(),
            updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
            deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 }),
            countDocuments: jest.fn().mockResolvedValue(1),
            distinct: jest.fn().mockResolvedValue(['category1', 'category2']),
            sort: jest.fn().mockReturnThis(),
            skip: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            exec: jest.fn().mockResolvedValue([mockProduct]),
            save: jest.fn().mockResolvedValue(mockProduct),
          },
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    productModel = module.get(getModelToken(Product.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new product', async () => {
      const createProductDto = {
        title: 'New Product',
        description: 'New Description',
        variants: [
          {
            sku: 'NEW123',
            name: 'Default',
            price: 39.99,
            inventory: 5,
          },
        ],
      };

      productModel.findOne.mockResolvedValue(null);
      productModel.create.mockResolvedValue(mockProduct);

      const result = await service.create('tenant123', createProductDto);

      expect(result).toEqual(mockProduct);
      expect(productModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          ...createProductDto,
          tenantId: 'tenant123',
          handle: expect.any(String),
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated products', async () => {
      const mockProducts = [mockProduct];
      const mockTotal = 1;

      productModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue(mockProducts),
            }),
          }),
        }),
      });

      productModel.countDocuments.mockResolvedValue(mockTotal);

      const result = await service.findAll('tenant123', { page: 1, limit: 10 });

      expect(result).toEqual({
        products: mockProducts,
        total: mockTotal,
        page: 1,
        limit: 10,
      });
    });
  });

  describe('findOne', () => {
    it('should return a product by id', async () => {
      productModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockProduct),
      });

      const result = await service.findOne('tenant123', 'product123');

      expect(result).toEqual(mockProduct);
      expect(productModel.findOne).toHaveBeenCalledWith({
        _id: 'product123',
        tenantId: 'tenant123',
      });
    });

    it('should throw NotFoundException when product not found', async () => {
      productModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findOne('tenant123', 'nonexistent')).rejects.toThrow('Produit non trouvé');
    });
  });

  describe('update', () => {
    it('should update a product', async () => {
      const updateDto = { title: 'Updated Product' };
      const updatedProduct = { ...mockProduct, title: 'Updated Product' };

      productModel.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedProduct),
      });

      const result = await service.update('tenant123', 'product123', updateDto);

      expect(result).toEqual(updatedProduct);
      expect(productModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: 'product123', tenantId: 'tenant123' },
        { ...updateDto, updatedAt: expect.any(Date) },
        { new: true },
      );
    });
  });

  describe('remove', () => {
    it('should delete a product', async () => {
      productModel.deleteOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ deletedCount: 1 }),
      });

      await service.remove('tenant123', 'product123');

      expect(productModel.deleteOne).toHaveBeenCalledWith({
        _id: 'product123',
        tenantId: 'tenant123',
      });
    });

    it('should throw NotFoundException when product not found', async () => {
      productModel.deleteOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ deletedCount: 0 }),
      });

      await expect(service.remove('tenant123', 'nonexistent')).rejects.toThrow('Produit non trouvé');
    });
  });

  describe('addImage', () => {
    it('should add an image to product', async () => {
      const mockProduct = { 
        title: 'Test',
        description: 'Test',
        handle: 'test',
        tenantId: 'tenant123',
        images: [],
        includes: () => false,
        save: jest.fn().mockResolvedValue({ images: ['img.jpg'] })
      } as any;
      jest.spyOn(service, 'findOne').mockResolvedValue(mockProduct);
    await service.addImage('tenant123', 'product123', 'img.jpg');
    expect(mockProduct.images).toContain('img.jpg');
    });
  });

  describe('removeImage', () => {
    it('should remove an image from product', async () => {
      const mockProduct = {
        title: 'Test',
        description: 'Test',
        handle: 'test', 
        tenantId: 'tenant123',
        images: ['img.jpg'],
        save: jest.fn().mockResolvedValue({ images: [] })
      } as any;
      jest.spyOn(service, 'findOne').mockResolvedValue(mockProduct);
    await service.removeImage('tenant123', 'product123', 'img.jpg');
    expect(mockProduct.images).not.toContain('img.jpg');
    });
  });
});





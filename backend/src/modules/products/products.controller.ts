import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto, ProductQueryDto } from './dto/product.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { UploadService } from '../upload/upload.service';
import type { Multer } from 'multer';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiQuery 
} from '@nestjs/swagger';

@ApiTags('products')
@ApiBearerAuth()
@Controller('products')
@UseGuards(JwtAuthGuard, TenantGuard)
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly uploadService: UploadService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new product', description: 'Creates a new product for the specified tenant' })
  @ApiResponse({ status: 201, description: 'Product successfully created' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBody({ type: CreateProductDto })
  create(
    @TenantId() tenantId: string,
    @Body() createProductDto: CreateProductDto,
  ) {
    return this.productsService.create(tenantId, createProductDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all products', description: 'Retrieves all products for the specified tenant with pagination' })
  @ApiResponse({ status: 200, description: 'List of products retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiQuery({ type: ProductQueryDto })
  findAll(
    @TenantId() tenantId: string,
    @Query() query: ProductQueryDto,
  ) {
    return this.productsService.findAll(tenantId, query);
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get product categories', description: 'Retrieves all product categories for the specified tenant' })
  @ApiResponse({ status: 200, description: 'List of categories retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getCategories(@TenantId() tenantId: string) {
    return this.productsService.getCategories(tenantId);
  }

  @Get('tags')
  @ApiOperation({ summary: 'Get product tags', description: 'Retrieves all product tags for the specified tenant' })
  @ApiResponse({ status: 200, description: 'List of tags retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getTags(@TenantId() tenantId: string) {
    return this.productsService.getTags(tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID', description: 'Retrieves a specific product by its ID' })
  @ApiResponse({ status: 200, description: 'Product retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  findOne(
    @TenantId() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.productsService.findOne(tenantId, id);
  }

  @Get('handle/:handle')
  @ApiOperation({ summary: 'Get product by handle', description: 'Retrieves a specific product by its handle/slug' })
  @ApiResponse({ status: 200, description: 'Product retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiParam({ name: 'handle', description: 'Product handle/slug' })
  findByHandle(
    @TenantId() tenantId: string,
    @Param('handle') handle: string,
  ) {
    return this.productsService.findByHandle(tenantId, handle);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update product', description: 'Updates a specific product by its ID' })
  @ApiResponse({ status: 200, description: 'Product updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiBody({ type: UpdateProductDto })
  update(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(tenantId, id, updateProductDto);
  }

  @Patch(':id/inventory/:variantId')
  @ApiOperation({ summary: 'Update variant inventory', description: 'Updates the inventory quantity for a specific product variant' })
  @ApiResponse({ status: 200, description: 'Inventory updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Product or variant not found' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiParam({ name: 'variantId', description: 'Variant ID' })
  @ApiBody({ schema: { properties: { quantity: { type: 'number', description: 'New inventory quantity' } } } })
  updateInventory(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Param('variantId') variantId: string,
    @Body('quantity') quantity: number,
  ) {
    return this.productsService.updateInventory(tenantId, id, variantId, quantity);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete product', description: 'Deletes a specific product by its ID' })
  @ApiResponse({ status: 200, description: 'Product deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  remove(
    @TenantId() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.productsService.remove(tenantId, id);
  }

  // Import de produits depuis un fichier (CSV, XLSX, PDF, Image via OCR)
  @Post('import')
  @ApiOperation({ summary: 'Import products', description: 'Import products from a file (CSV, XLSX, PDF, or Image via OCR)' })
  @ApiResponse({ status: 201, description: 'Products imported successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 400, description: 'Invalid file or file format' })
  @UseInterceptors(FileInterceptor('file'))
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'File to import (CSV, XLSX, PDF, or Image)',
        },
      },
    },
  })
  async importCsv(
    @TenantId() tenantId: string,
    @UploadedFile() file: any,
  ) {
    if (!file) {
      throw new Error('Aucun fichier fourni');
    }
    const result = await this.productsService.importFromFile(tenantId, file);
    return result;
  }

  @Post(':id/images')
  @ApiOperation({ summary: 'Add product image', description: 'Uploads and adds an image to a specific product' })
  @ApiResponse({ status: 201, description: 'Image added successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 400, description: 'No image file provided' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @UseInterceptors(FileInterceptor('image'))
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
          description: 'Image file to upload',
        },
      },
    },
  })
  async addImage(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @UploadedFile() file: any,
  ) {
    if (!file) {
      throw new Error('Aucun fichier image fourni');
    }

    const imageUrl = await this.uploadService.saveProductImage(file, id);
    return this.productsService.addImage(tenantId, id, imageUrl);
  }

  @Delete(':id/images/:imageUrl')
  @ApiOperation({ summary: 'Remove product image', description: 'Removes a specific image from a product' })
  @ApiResponse({ status: 200, description: 'Image removed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Product or image not found' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiParam({ name: 'imageUrl', description: 'URL of the image to remove' })
  async removeImage(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Param('imageUrl') imageUrl: string,
  ) {
    return this.productsService.removeImage(tenantId, id, imageUrl);
  }
}


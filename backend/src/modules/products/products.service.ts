import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { CreateProductDto, UpdateProductDto, ProductQueryDto } from './dto/product.dto';
import { CsvUtility } from '../../common/utils/csv.utility';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    private readonly csvUtility: CsvUtility,
  ) {}

  private toTenantObjectId(tenantId: string) {
    return Types.ObjectId.isValid(tenantId) ? new Types.ObjectId(tenantId) : tenantId;
  }

  async create(tenantId: string, createProductDto: CreateProductDto): Promise<Product> {
    const handle = await this.generateUniqueHandle(tenantId, createProductDto.title);

    const product = await this.productModel.create({
      ...createProductDto,
      tenantId: this.toTenantObjectId(tenantId),
      handle,
    });
    return product as unknown as Product;
  }

  async resolveVariantRef(
    tenantId: string,
    productId: string,
    variantRef?: string,
  ): Promise<string> {
    const product = await this.findOne(tenantId, productId);
    if (variantRef && variantRef !== 'default') {
      const match = product.variants?.find(
        (v: any) => v._id?.toString() === variantRef || v.sku === variantRef,
      );
      if (match) {
        return (match as any)._id?.toString?.() || match.sku;
      }
    }
    const first = product.variants?.[0];
    if (!first) {
      throw new NotFoundException('Aucune variante pour ce produit');
    }
    return (first as any)._id?.toString?.() || first.sku;
  }

  async findAll(tenantId: string, query: ProductQueryDto): Promise<{
    products: Product[];
    total: number;
    page: number;
    limit: number;
  }> {
    const {
      page = 1,
      limit = 20,
      status,
      category,
      tags,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const filter: any = {
      tenantId: this.toTenantObjectId(tenantId),
    };

    if (status) {
      filter.status = status;
    }

    if (category) {
      filter.category = category;
    }

    if (tags && tags.length > 0) {
      filter.tags = { $in: tags };
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }

    const sort: any = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      this.productModel
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.productModel.countDocuments(filter),
    ]);

    return {
      products,
      total,
      page,
      limit,
    };
  }

  /**
   * Récupérer tous les produits d'un tenant (pour API publique)
   */
  async findByTenant(tenantId: string): Promise<Product[]> {
    return this.productModel.find({ tenantId: this.toTenantObjectId(tenantId) }).exec();
  }

  async findOne(tenantId: string, id: string): Promise<Product> {
    const product = await this.productModel
      .findOne({ _id: id, tenantId: this.toTenantObjectId(tenantId) })
      .exec();
    if (!product) {
      throw new NotFoundException('Produit non trouvé');
    }
    return product;
  }

  // === Import CSV ===
  async importFromCsv(tenantId: string, csvText: string) {
    const rows = this.csvUtility.parseFromString(csvText);
    this.csvUtility.validateHeaders(rows, ['title', 'sku']);

    let created = 0;
    const errors: Array<{ line: number; error: string }> = [];

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      try {
        const title = r.title?.trim();
        const sku = r.sku?.trim();
        if (!title || !sku) throw new Error('title et sku requis');

        const priceNum = r.price ? Number(r.price) : 0;
        const inventoryNum = r.inventory ? Number(r.inventory) : 0;

        const dto: any = {
          title,
          description: r.description?.trim() || '',
          category: r.category?.trim() || undefined,
          status: (r.status as any) || 'draft',
          variants: [
            {
              sku,
              name: r.variantName?.trim() || title,
              price: Number.isFinite(priceNum) ? priceNum : 0,
              inventory: Number.isFinite(inventoryNum) ? inventoryNum : 0,
            },
          ],
          images: r.imageUrl ? [r.imageUrl.trim()] : [],
          tags: r.tags ? r.tags.split('|').map(t => t.trim()).filter(Boolean) : [],
        };

        await this.create(tenantId, dto);
        created++;
      } catch (e: any) {
        errors.push({ line: i + 2, error: e?.message || 'Erreur inconnue' }); // +2 for header + 1-index
      }
    }

    return { success: true, created, errors };
  }

  // Generic file import dispatcher
  async importFromFile(tenantId: string, file: { originalname: string; mimetype: string; buffer: Buffer }) {
    const name = (file.originalname || '').toLowerCase();
    const type = (file.mimetype || '').toLowerCase();
    if (name.endsWith('.csv') || type.includes('text/csv')) {
      return this.importFromCsv(tenantId, file.buffer.toString('utf8'));
    }
    if (name.endsWith('.xlsx') || name.endsWith('.xls') || type.includes('sheet') || type.includes('excel')) {
      return this.importFromXlsx(tenantId, file.buffer);
    }
    if (name.endsWith('.pdf') || type.includes('pdf')) {
      return this.importFromPdf(tenantId, file.buffer);
    }
    if (type.startsWith('image/') || name.match(/\.(png|jpe?g|webp|bmp|tiff?)$/)) {
      return this.importFromImage(tenantId, file.buffer);
    }
    throw new BadRequestException('Format non supporté. Formats acceptés: CSV, XLSX, PDF, Image');
  }

  private async importFromXlsx(tenantId: string, buffer: Buffer) {
    try {
      // dynamic import to avoid mandatory dependency when unused
      const xlsx = await import('xlsx');
      const wb = xlsx.read(buffer, { type: 'buffer' });
      const firstSheetName = wb.SheetNames[0];
      const ws = wb.Sheets[firstSheetName];
      const rows: Array<Record<string, any>> = xlsx.utils.sheet_to_json(ws, { defval: '' });
      return this.importFromRows(tenantId, rows);
    } catch (e: any) {
      throw new BadRequestException('Parser XLSX non disponible. Installez la dépendance "xlsx".');
    }
  }

  private async importFromPdf(tenantId: string, buffer: Buffer) {
    try {
      const pdfParse = (await import('pdf-parse')).default as (b: Buffer) => Promise<{ text: string }>;
      const data = await pdfParse(buffer);
      const rows = this.extractTabularRowsFromText(data.text);
      if (!rows || rows.length === 0) {
        throw new BadRequestException('Aucun tableau détecté dans le PDF. Veuillez fournir un PDF avec un tableau ou utilisez CSV/XLSX.');
      }
      return this.importFromRows(tenantId, rows);
    } catch (e: any) {
      if (e instanceof BadRequestException) throw e;
      throw new BadRequestException('Parser PDF non disponible. Installez "pdf-parse" ou utilisez CSV/XLSX.');
    }
  }

  private async importFromImage(tenantId: string, buffer: Buffer) {
    try {
      // Prefer node binding if available, fallback to wasm
      const { createWorker } = await import('tesseract.js');
      const worker = await createWorker();
      await worker.loadLanguage('eng');
      await worker.initialize('eng');
      const { data: { text } } = await worker.recognize(buffer as any);
      await worker.terminate();
      const rows = this.extractTabularRowsFromText(text);
      if (!rows || rows.length === 0) {
        throw new BadRequestException('Aucun tableau détecté dans l\'image. Utilisez un modèle CSV/XLSX ou une image de tableau clair.');
      }
      return this.importFromRows(tenantId, rows);
    } catch (e: any) {
      if (e instanceof BadRequestException) throw e;
      throw new BadRequestException('OCR non disponible. Installez "tesseract.js" et réessayez, ou utilisez CSV/XLSX.');
    }
  }

  // Attempt to extract tabular rows from free text (PDF/OCR): detect delimiter and header
  private extractTabularRowsFromText(text: string): Array<Record<string, string>> {
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    if (lines.length < 2) return [];
    // choose delimiter by highest split consistency
    const candidates = ['\t', ';', ',', '  '];
    let bestDelim = ',';
    let bestScore = -1;
    for (const d of candidates) {
      const counts = lines.slice(0, Math.min(lines.length, 20)).map(l => l.split(d).length);
      const avg = counts.reduce((a, b) => a + b, 0) / counts.length;
      const variance = counts.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / counts.length;
      const score = avg - variance; // prefer stable column counts
      if (score > bestScore && avg >= 2) { bestScore = score; bestDelim = d; }
    }
    const headerParts = lines[0].split(bestDelim).map(s => s.trim().toLowerCase());
    const rows: Array<Record<string, string>> = [];
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(bestDelim).map(s => s.trim());
      if (parts.length < 2) continue;
      const row: Record<string, string> = {};
      for (let c = 0; c < headerParts.length; c++) {
        row[headerParts[c]] = parts[c] ?? '';
      }
      rows.push(row);
    }
    return rows;
  }

  // Common rows pipeline: expects array of objects with keys matching headers
  private async importFromRows(tenantId: string, rows: Array<Record<string, any>>) {
    if (!rows || rows.length === 0) throw new BadRequestException('Aucune donnée détectée');
    // normalize keys
    const norm = (k: string) => k.trim().toLowerCase();
    const first = rows[0];
    const keys = Object.keys(first).map(norm);
    const mapKey = (obj: Record<string, any>, key: string) => {
      const idx = Object.keys(obj).find(k => norm(k) === key);
      return idx ? obj[idx] : undefined;
    };

    const required = ['title', 'sku'];
    const hasRequired = required.every(r => keys.includes(r));
    if (!hasRequired) {
      throw new BadRequestException(`Colonnes requises manquantes. Présentes: ${keys.join(', ')}`);
    }

    let created = 0;
    const errors: Array<{ line: number; error: string }> = [];
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      try {
        const title = (mapKey(r, 'title') ?? '').toString().trim();
        const sku = (mapKey(r, 'sku') ?? '').toString().trim();
        if (!title || !sku) throw new Error('title et sku requis');
        const priceNum = Number(mapKey(r, 'price') ?? 0);
        const inventoryNum = Number(mapKey(r, 'inventory') ?? 0);
        const dto: any = {
          title,
          description: (mapKey(r, 'description') ?? '').toString(),
          category: (mapKey(r, 'category') ?? '').toString() || undefined,
          status: (mapKey(r, 'status') as any) || 'draft',
          variants: [
            {
              sku,
              name: (mapKey(r, 'variantname') ?? mapKey(r, 'variant_name') ?? title).toString(),
              price: Number.isFinite(priceNum) ? priceNum : 0,
              inventory: Number.isFinite(inventoryNum) ? inventoryNum : 0,
            },
          ],
          images: (() => {
            const url = (mapKey(r, 'imageurl') ?? mapKey(r, 'image') ?? '').toString().trim();
            if (!url) return [];
            return [url];
          })(),
          tags: (() => {
            const t = (mapKey(r, 'tags') ?? '').toString();
            return t ? t.split('|').map(s => s.trim()).filter(Boolean) : [];
          })(),
        };
        await this.create(tenantId, dto);
        created++;
      } catch (e: any) {
        errors.push({ line: i + 2, error: e?.message || 'Erreur inconnue' });
      }
    }
    return { success: true, created, errors };
  }

  async findByHandle(tenantId: string, handle: string): Promise<Product> {
    const product = await this.productModel
      .findOne({ handle, tenantId: this.toTenantObjectId(tenantId) })
      .exec();
    if (!product) {
      throw new NotFoundException('Produit non trouvé');
    }
    return product;
  }

  async update(tenantId: string, id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.productModel
      .findOneAndUpdate(
        { _id: id, tenantId: this.toTenantObjectId(tenantId) },
        { ...updateProductDto, updatedAt: new Date() },
        { new: true }
      )
      .exec();

    if (!product) {
      throw new NotFoundException('Produit non trouvé');
    }

    return product;
  }

  async remove(tenantId: string, id: string): Promise<void> {
    const result = await this.productModel
      .deleteOne({ _id: id, tenantId: this.toTenantObjectId(tenantId) })
      .exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('Produit non trouvé');
    }
  }

  async updateInventory(tenantId: string, productId: string, variantId: string, quantity: number): Promise<Product> {
    const product = await this.findOne(tenantId, productId);
    
    const variant = product.variants.find(v => v.sku === variantId);
    if (!variant) {
      throw new NotFoundException('Variante non trouvée');
    }

    variant.inventory = quantity;
    
    const updatedProduct = await this.productModel
      .findOneAndUpdate(
        { _id: productId, tenantId: this.toTenantObjectId(tenantId) },
        { variants: product.variants, updatedAt: new Date() },
        { new: true }
      )
      .exec();

    if (!updatedProduct) {
      throw new NotFoundException('Produit non trouvé');
    }

    return updatedProduct;
  }

  private async generateUniqueHandle(tenantId: string, title: string): Promise<string> {
    let baseHandle = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    let handle = baseHandle;
    let counter = 1;

    while (await this.productModel.findOne({ tenantId: this.toTenantObjectId(tenantId), handle })) {
      handle = `${baseHandle}-${counter}`;
      counter++;
    }

    return handle;
  }

  async getCategories(tenantId: string): Promise<string[]> {
    const categories = await this.productModel
      .distinct('category', { tenantId: this.toTenantObjectId(tenantId), status: 'active' })
      .exec();
    
    return categories.filter(cat => cat && cat.trim() !== '');
  }

  async getTags(tenantId: string): Promise<string[]> {
    const tags = await this.productModel
      .distinct('tags', { tenantId: this.toTenantObjectId(tenantId), status: 'active' })
      .exec();
    
    return tags.filter(tag => tag && tag.trim() !== '');
  }

  async addImage(tenantId: string, productId: string, imageUrl: string): Promise<Product> {
    const product = await this.findOne(tenantId, productId);
    
    if (!product.images.includes(imageUrl)) {
      product.images.push(imageUrl);
      await this.productModel.updateOne(
        { _id: productId, tenantId: this.toTenantObjectId(tenantId) },
        { $set: { images: product.images, updatedAt: new Date() } }
      );
    }
    
    return product;
  }

  async removeImage(tenantId: string, productId: string, imageUrl: string): Promise<Product> {
    const product = await this.findOne(tenantId, productId);
    
    product.images = product.images.filter(img => img !== imageUrl);
    await this.productModel.updateOne(
      { _id: productId, tenantId: this.toTenantObjectId(tenantId) },
      { $set: { images: product.images, updatedAt: new Date() } }
    );
    
    return product;
  }

  // Suppression physique d'une image produit
  async deleteProductImageFile(uploadsService, imageUrl: string) {
    await uploadsService.deleteFile(imageUrl);
  }

  // Ajout d'une image à une variante
  async addVariantImage(
    tenantId: string,
    productId: string,
    variantId: string,
    imageUrl: string
  ): Promise<Product> {
    const product = await this.findOne(tenantId, productId);
  const variant = product.variants?.find(v => v._id?.toString() === variantId);
    if (!variant) throw new NotFoundException('Variante non trouvée');
    if (!variant.images) variant.images = [];
    variant.images.push(imageUrl);
    if (product.save) {
      await product.save();
    }
    return product;
  }

  // Suppression d'une image d'une variante
  async removeVariantImage(
    tenantId: string,
    productId: string,
    variantId: string,
    imageUrl: string
  ): Promise<Product> {
    const product = await this.findOne(tenantId, productId);
  const variant = product.variants?.find(v => v._id?.toString() === variantId);
    if (!variant) throw new NotFoundException('Variante non trouvée');
    if (!variant.images) return product;
    variant.images = variant.images.filter(img => img !== imageUrl);
    if (product.save) {
      await product.save();
    }
    return product;
  }
}


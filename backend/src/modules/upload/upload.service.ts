import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { promises as fs } from 'fs';
import { join } from 'path';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);

  constructor(private configService: ConfigService) {}

  private async ensureUploadDir(subDir?: string) {
    const baseDir = join(process.cwd(), 'uploads');
    const fullDir = subDir ? join(baseDir, subDir) : baseDir;
    await fs.mkdir(fullDir, { recursive: true });
    return fullDir;
  }

  async saveFile(file: any, options?: { subDir?: string }): Promise<string> {
    try {
      const uploadsDir = await this.ensureUploadDir(options?.subDir);
      const filename = `${Date.now()}_${file.originalname}`;
      const filePath = join(uploadsDir, filename);
      
      await fs.writeFile(filePath, file.buffer);
      
      // Retourner une URL relative pour éviter les problèmes de mixed-content/CORS en dev
      const subDirPath = options?.subDir ? `${options.subDir}/` : '';
      const fileUrl = `/uploads/${subDirPath}${filename}`;
      
      this.logger.log(`Fichier uploadé: ${filename}`);
      return fileUrl;
    } catch (error) {
      this.logger.error(`Erreur lors de l'upload: ${error.message}`);
      throw error;
    }
  }

  async saveProductImage(
    file: any,
    productId: string,
    variantId?: string,
  ): Promise<string> {
    const subDir = variantId 
      ? `products/${productId}/variants/${variantId}`
      : `products/${productId}`;
    return this.saveFile(file, { subDir });
  }

  async deleteFile(pathOrUrl: string): Promise<void> {
    try {
      // Si c'est une URL, extraire le chemin relatif
      const relativePath = pathOrUrl.startsWith('/uploads/') 
        ? pathOrUrl.replace('/uploads/', '')
        : pathOrUrl;
        
      const filePath = join(process.cwd(), 'uploads', relativePath);
      
      await fs.unlink(filePath);
      this.logger.log(`Fichier supprimé: ${relativePath}`);
    } catch (error) {
      this.logger.error(`Erreur lors de la suppression: ${error.message}`);
      throw error;
    }
  }

  async deleteProductImage(productId: string, filename: string, variantId?: string): Promise<void> {
    const subDir = variantId 
      ? `products/${productId}/variants/${variantId}`
      : `products/${productId}`;
    await this.deleteFile(`${subDir}/${filename}`);
  }

  async getFileUrl(filename: string): Promise<string> {
    const baseUrl = this.configService.get<string>('app.baseUrl') || 'http://localhost:3000';
    return `${baseUrl}/uploads/${filename}`;
  }
}

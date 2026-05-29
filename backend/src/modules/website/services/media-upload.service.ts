import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as sharp from 'sharp';

/**
 * SERVICE UPLOAD MÉDIAS
 * 
 * Gère:
 * - Upload images
 * - Optimisation automatique (resize, compression)
 * - Stockage local ou cloud (S3, Cloudinary)
 * - Génération thumbnails
 */

interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

interface MediaFile {
  tenantId: string;
  filename: string;
  originalName: string;
  url: string;
  thumbnailUrl?: string;
  size: number;
  width?: number;
  height?: number;
  mimetype: string;
  uploadedAt: Date;
}

@Injectable()
export class MediaUploadService {
  private readonly logger = new Logger(MediaUploadService.name);
  private readonly uploadDir = path.join(process.cwd(), 'uploads', 'media');
  private readonly thumbnailDir = path.join(process.cwd(), 'uploads', 'thumbnails');
  private readonly maxFileSize = 10 * 1024 * 1024; // 10MB
  private readonly allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml'
  ];

  constructor(
    @InjectModel('MediaFile') private mediaModel: Model<any>,
  ) {
    this.ensureDirectories();
  }

  /**
   * S'assure que les dossiers existent
   */
  private async ensureDirectories(): Promise<void> {
    try {
      await fs.mkdir(this.uploadDir, { recursive: true });
      await fs.mkdir(this.thumbnailDir, { recursive: true });
      this.logger.log('📁 Dossiers uploads créés');
    } catch (error) {
      this.logger.error(`Erreur création dossiers: ${error.message}`);
    }
  }

  /**
   * Upload une image
   */
  async uploadImage(file: UploadedFile, tenantId: string): Promise<MediaFile> {
    this.logger.log(`📤 Upload image: ${file.originalname} pour tenant ${tenantId}`);

    // Validation
    this.validateFile(file);

    // Générer nom unique
    const filename = this.generateUniqueFilename(file.originalname);
    const filepath = path.join(this.uploadDir, filename);

    try {
      // Optimiser l'image avec Sharp
      const optimizedBuffer = await this.optimizeImage(file.buffer, file.mimetype);
      
      // Sauvegarder l'image optimisée
      await fs.writeFile(filepath, optimizedBuffer);

      // Créer thumbnail
      const thumbnailFilename = `thumb_${filename}`;
      const thumbnailPath = path.join(this.thumbnailDir, thumbnailFilename);
      await this.createThumbnail(optimizedBuffer, thumbnailPath);

      // Obtenir dimensions
      const metadata = await sharp(optimizedBuffer).metadata();

      // Sauvegarder dans DB
      const mediaFile: MediaFile = {
        tenantId,
        filename,
        originalName: file.originalname,
        url: `/uploads/media/${filename}`,
        thumbnailUrl: `/uploads/thumbnails/${thumbnailFilename}`,
        size: optimizedBuffer.length,
        width: metadata.width,
        height: metadata.height,
        mimetype: file.mimetype,
        uploadedAt: new Date(),
      };

      const saved = await this.mediaModel.create(mediaFile);

      this.logger.log(`✅ Image uploadée: ${filename}`);
      return saved;

    } catch (error) {
      this.logger.error(`Erreur upload: ${error.message}`);
      throw new BadRequestException(`Erreur upload: ${error.message}`);
    }
  }

  /**
   * Valide le fichier
   */
  private validateFile(file: UploadedFile): void {
    // Vérifier taille
    if (file.size > this.maxFileSize) {
      throw new BadRequestException(
        `Fichier trop volumineux. Maximum ${this.maxFileSize / 1024 / 1024}MB`
      );
    }

    // Vérifier type MIME
    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Type de fichier non autorisé. Types acceptés: ${this.allowedMimeTypes.join(', ')}`
      );
    }
  }

  /**
   * Génère un nom de fichier unique
   */
  private generateUniqueFilename(originalName: string): string {
    const ext = path.extname(originalName);
    const name = path.basename(originalName, ext)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-');
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${name}-${timestamp}-${random}${ext}`;
  }

  /**
   * Optimise l'image
   */
  private async optimizeImage(buffer: Buffer, mimetype: string): Promise<Buffer> {
    let image = sharp(buffer);

    // Resize si trop grande
    const metadata = await image.metadata();
    if (metadata.width > 2000 || metadata.height > 2000) {
      image = image.resize(2000, 2000, {
        fit: 'inside',
        withoutEnlargement: true
      });
    }

    // Optimiser selon le type
    if (mimetype === 'image/jpeg' || mimetype === 'image/jpg') {
      return await image.jpeg({ quality: 85, progressive: true }).toBuffer();
    } else if (mimetype === 'image/png') {
      return await image.png({ compressionLevel: 9 }).toBuffer();
    } else if (mimetype === 'image/webp') {
      return await image.webp({ quality: 85 }).toBuffer();
    }

    return buffer;
  }

  /**
   * Crée un thumbnail
   */
  private async createThumbnail(buffer: Buffer, outputPath: string): Promise<void> {
    await sharp(buffer)
      .resize(300, 300, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 80 })
      .toFile(outputPath);
  }

  /**
   * Récupère les images d'un tenant
   */
  async getMediaByTenant(tenantId: string, limit: number = 50): Promise<any[]> {
    return await this.mediaModel
      .find({ tenantId })
      .sort({ uploadedAt: -1 })
      .limit(limit)
      .lean();
  }

  /**
   * Supprime une image
   */
  async deleteMedia(mediaId: string, tenantId: string): Promise<void> {
    const media = await this.mediaModel.findOne({ _id: mediaId, tenantId });
    
    if (!media) {
      throw new BadRequestException('Image non trouvée');
    }

    try {
      // Supprimer fichiers
      const filepath = path.join(this.uploadDir, media.filename);
      const thumbnailPath = path.join(this.thumbnailDir, `thumb_${media.filename}`);
      
      await fs.unlink(filepath).catch(() => {});
      await fs.unlink(thumbnailPath).catch(() => {});

      // Supprimer de DB
      await this.mediaModel.deleteOne({ _id: mediaId });

      this.logger.log(`🗑️ Image supprimée: ${media.filename}`);
    } catch (error) {
      this.logger.error(`Erreur suppression: ${error.message}`);
      throw new BadRequestException(`Erreur suppression: ${error.message}`);
    }
  }

  /**
   * Upload multiple images
   */
  async uploadMultiple(files: UploadedFile[], tenantId: string): Promise<MediaFile[]> {
    const uploads = files.map(file => this.uploadImage(file, tenantId));
    return await Promise.all(uploads);
  }

  /**
   * Convertir image en WebP (format moderne)
   */
  async convertToWebP(mediaId: string, tenantId: string): Promise<MediaFile> {
    const media = await this.mediaModel.findOne({ _id: mediaId, tenantId });
    
    if (!media) {
      throw new BadRequestException('Image non trouvée');
    }

    try {
      const filepath = path.join(this.uploadDir, media.filename);
      const buffer = await fs.readFile(filepath);
      
      // Convertir en WebP
      const webpBuffer = await sharp(buffer).webp({ quality: 85 }).toBuffer();
      
      // Nouveau nom
      const webpFilename = media.filename.replace(/\.(jpg|jpeg|png)$/i, '.webp');
      const webpPath = path.join(this.uploadDir, webpFilename);
      
      await fs.writeFile(webpPath, webpBuffer);

      // Créer nouveau document
      const webpMedia: MediaFile = {
        ...media.toObject(),
        filename: webpFilename,
        url: `/uploads/media/${webpFilename}`,
        size: webpBuffer.length,
        mimetype: 'image/webp',
        uploadedAt: new Date(),
      };

      delete (webpMedia as any)._id;
      const saved = await this.mediaModel.create(webpMedia);

      this.logger.log(`🔄 Image convertie en WebP: ${webpFilename}`);
      return saved;

    } catch (error) {
      this.logger.error(`Erreur conversion WebP: ${error.message}`);
      throw new BadRequestException(`Erreur conversion: ${error.message}`);
    }
  }

  /**
   * Statistiques médias
   */
  async getStats(tenantId: string): Promise<any> {
    const stats = await this.mediaModel.aggregate([
      { $match: { tenantId } },
      {
        $group: {
          _id: null,
          totalFiles: { $sum: 1 },
          totalSize: { $sum: '$size' },
          avgSize: { $avg: '$size' },
          byMimetype: {
            $push: {
              mimetype: '$mimetype',
              size: '$size'
            }
          }
        }
      }
    ]);

    return stats[0] || {
      totalFiles: 0,
      totalSize: 0,
      avgSize: 0,
      byMimetype: []
    };
  }
}

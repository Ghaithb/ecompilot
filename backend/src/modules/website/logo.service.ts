import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Website, WebsiteDocument } from './schemas/website.schema';
import * as sharp from 'sharp';
import { promises as fs } from 'fs';
import { join } from 'path';

@Injectable()
export class LogoService {
  private readonly logger = new Logger(LogoService.name);

  constructor(
    @InjectModel(Website.name) private websiteModel: Model<WebsiteDocument>,
  ) {}

  /**
   * Traiter le logo uploadé
   */
  async processLogo(
    websiteId: string,
    tenantId: string,
    file: Express.Multer.File,
  ): Promise<{
    logoUrl: string;
    faviconUrl: string;
    sizes: {
      original: string;
      large: string;
      medium: string;
      small: string;
      favicon: string;
    };
  }> {
    const website = await this.websiteModel.findOne({
      _id: websiteId,
      tenantId,
    });

    if (!website) {
      throw new NotFoundException('Site introuvable');
    }

    const logoDir = './uploads/logos';
    const baseFilename = file.filename.replace(extname(file.filename), '');

    // Créer les différentes tailles de logo
    const sizes = await this.createLogoSizes(file.path, logoDir, baseFilename);

    // Créer le favicon
    const faviconPath = await this.createFavicon(file.path, logoDir, baseFilename);

    // Mettre à jour le website avec les URLs
    const logoUrl = `/uploads/logos/${sizes.original}`;
    const faviconUrl = `/uploads/logos/${faviconPath}`;

    website.theme = website.theme || {
      primaryColor: '#000000',
      secondaryColor: '#ffffff',
      accentColor: '#4CAF50',
      backgroundColor: '#ffffff',
      textColor: '#000000',
      font: 'Inter',
    };

    website.theme.logo = logoUrl;
    website.theme.favicon = faviconUrl;

    await website.save();

    this.logger.log(`✅ Logo sauvegardé: ${logoUrl}`);
    this.logger.log(`✅ Favicon créé: ${faviconUrl}`);

    return {
      logoUrl,
      faviconUrl,
      sizes: {
        original: logoUrl,
        large: `/uploads/logos/${sizes.large}`,
        medium: `/uploads/logos/${sizes.medium}`,
        small: `/uploads/logos/${sizes.small}`,
        favicon: faviconUrl,
      },
    };
  }

  /**
   * Créer différentes tailles de logo
   */
  private async createLogoSizes(
    originalPath: string,
    outputDir: string,
    baseFilename: string,
  ): Promise<{
    original: string;
    large: string;
    medium: string;
    small: string;
  }> {
    const sizes = {
      large: 400,
      medium: 200,
      small: 100,
    };

    const results: any = {
      original: baseFilename + '.png',
    };

    // Conserver l'original (converti en PNG)
    await sharp(originalPath)
      .png({ quality: 90 })
      .toFile(join(outputDir, results.original));

    // Créer les versions redimensionnées
    for (const [size, width] of Object.entries(sizes)) {
      const filename = `${baseFilename}-${size}.png`;
      
      await sharp(originalPath)
        .resize(width, width, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .png({ quality: 90 })
        .toFile(join(outputDir, filename));

      results[size] = filename;
      this.logger.log(`✅ Créé: ${filename} (${width}x${width})`);
    }

    return results;
  }

  /**
   * Créer le favicon à partir du logo
   */
  private async createFavicon(
    originalPath: string,
    outputDir: string,
    baseFilename: string,
  ): Promise<string> {
    const faviconFilename = `${baseFilename}-favicon.ico`;
    const pngFaviconFilename = `${baseFilename}-favicon.png`;

    // Créer version PNG 32x32 (pour le favicon moderne)
    await sharp(originalPath)
      .resize(32, 32, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png()
      .toFile(join(outputDir, pngFaviconFilename));

    this.logger.log(`✅ Favicon créé: ${pngFaviconFilename}`);

    // Note: Pour créer un vrai .ico, il faudrait utiliser une lib comme 'to-ico'
    // Pour l'instant on retourne le PNG qui fonctionne dans tous les navigateurs modernes

    return pngFaviconFilename;
  }

  /**
   * Supprimer le logo et toutes ses versions
   */
  async deleteLogo(websiteId: string, tenantId: string): Promise<void> {
    const website = await this.websiteModel.findOne({
      _id: websiteId,
      tenantId,
    });

    if (!website) {
      throw new NotFoundException('Site introuvable');
    }

    // Supprimer les fichiers physiques
    if (website.theme?.logo) {
      await this.deleteLogoFiles(website.theme.logo);
    }

    // Mettre à jour le website
    if (website.theme) {
      website.theme.logo = undefined;
      website.theme.favicon = undefined;
      await website.save();
    }

    this.logger.log(`✅ Logo supprimé pour website: ${websiteId}`);
  }

  /**
   * Supprimer les fichiers de logo
   */
  private async deleteLogoFiles(logoUrl: string): Promise<void> {
    try {
      // Extraire le nom de base du fichier
      const filename = logoUrl.split('/').pop();
      const baseFilename = filename.replace(/\.(png|jpg|jpeg)$/, '');
      const logoDir = './uploads/logos';

      // Liste des fichiers à supprimer
      const filesToDelete = [
        `${baseFilename}.png`,
        `${baseFilename}-large.png`,
        `${baseFilename}-medium.png`,
        `${baseFilename}-small.png`,
        `${baseFilename}-favicon.png`,
        `${baseFilename}-favicon.ico`,
      ];

      // Supprimer tous les fichiers
      for (const file of filesToDelete) {
        const filePath = join(logoDir, file);
        try {
          await fs.unlink(filePath);
          this.logger.log(`🗑️ Supprimé: ${file}`);
        } catch (error) {
          // Ignorer si le fichier n'existe pas
          if (error.code !== 'ENOENT') {
            this.logger.warn(`⚠️ Erreur suppression ${file}: ${error.message}`);
          }
        }
      }
    } catch (error) {
      this.logger.error(`❌ Erreur suppression fichiers logo: ${error.message}`);
    }
  }

  /**
   * Obtenir les URLs du logo
   */
  async getLogoUrls(websiteId: string, tenantId: string): Promise<{
    logo?: string;
    favicon?: string;
  }> {
    const website = await this.websiteModel.findOne({
      _id: websiteId,
      tenantId,
    });

    if (!website) {
      throw new NotFoundException('Site introuvable');
    }

    return {
      logo: website.theme?.logo,
      favicon: website.theme?.favicon,
    };
  }
}

function extname(filename: string): string {
  const match = filename.match(/\.[^.]+$/);
  return match ? match[0] : '';
}

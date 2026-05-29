import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  Param,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { LogoService } from './logo.service';
import { TenantId } from '../../common/decorators/tenant.decorator';

@Controller('website/:websiteId/logo')
@UseGuards(JwtAuthGuard)
export class LogoController {
  private readonly logger = new Logger(LogoController.name);

  constructor(private readonly logoService: LogoService) {}

  /**
   * Upload du logo
   */
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('logo', {
      storage: diskStorage({
        destination: './uploads/logos',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `logo-${uniqueSuffix}${ext}`);
        },
      }),
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max
      },
      fileFilter: (req, file, cb) => {
        const allowedMimes = [
          'image/jpeg',
          'image/jpg',
          'image/png',
          'image/svg+xml',
          'image/webp',
        ];

        if (!allowedMimes.includes(file.mimetype)) {
          return cb(
            new BadRequestException(
              'Format non supporté. Utilisez PNG, JPG, SVG ou WebP',
            ),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async uploadLogo(
    @Param('websiteId') websiteId: string,
    @TenantId() tenantId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    try {
      if (!file) {
        throw new BadRequestException('Aucun fichier fourni');
      }

      this.logger.log(`🎨 Upload logo pour website: ${websiteId}`);
      this.logger.log(`📁 Fichier: ${file.filename} (${file.size} bytes)`);

      // Traiter le logo (redimensionner, créer favicon)
      const result = await this.logoService.processLogo(
        websiteId,
        tenantId,
        file,
      );

      this.logger.log(`✅ Logo traité avec succès`);

      return {
        success: true,
        logo: result.logoUrl,
        favicon: result.faviconUrl,
        sizes: result.sizes,
      };
    } catch (error) {
      this.logger.error(`❌ Erreur upload logo: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Supprimer le logo
   */
  @Post('delete')
  async deleteLogo(
    @Param('websiteId') websiteId: string,
    @TenantId() tenantId: string,
  ) {
    try {
      this.logger.log(`🗑️ Suppression logo pour website: ${websiteId}`);

      await this.logoService.deleteLogo(websiteId, tenantId);

      this.logger.log(`✅ Logo supprimé avec succès`);

      return {
        success: true,
        message: 'Logo supprimé',
      };
    } catch (error) {
      this.logger.error(`❌ Erreur suppression logo: ${error.message}`);
      throw error;
    }
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PageVersion, PageVersionDocument } from './schemas/page-version.schema';

@Injectable()
export class PageVersionService {
  private readonly logger = new Logger(PageVersionService.name);

  constructor(
    @InjectModel(PageVersion.name) private pageVersionModel: Model<PageVersionDocument>,
  ) {}

  /**
   * Créer une nouvelle version d'une page
   */
  async createVersion(
    pageId: string,
    tenantId: string,
    data: {
      content: any;
      html: string;
      css: string;
      userId: string;
      comment?: string;
      label?: string;
      isAutoSave?: boolean;
    }
  ) {
    try {
      // Récupérer le dernier numéro de version
      const lastVersion = await this.pageVersionModel
        .findOne({ pageId, tenantId })
        .sort({ version: -1 })
        .exec();

      const version = lastVersion ? lastVersion.version + 1 : 1;

      const pageVersion = new this.pageVersionModel({
        pageId,
        tenantId,
        version,
        content: data.content,
        html: data.html,
        css: data.css,
        createdBy: data.userId,
        comment: data.comment || '',
        label: data.label || '',
        isAutoSave: data.isAutoSave || false,
      });

      await pageVersion.save();

      // Nettoyer les anciennes auto-sauvegardes (garder seulement les 10 dernières)
      if (data.isAutoSave) {
        const autoSaves = await this.pageVersionModel
          .find({ pageId, tenantId, isAutoSave: true })
          .sort({ createdAt: -1 })
          .skip(10)
          .exec();

        if (autoSaves.length > 0) {
          const idsToDelete = autoSaves.map(v => v._id);
          await this.pageVersionModel.deleteMany({ _id: { $in: idsToDelete } });
        }
      }

      this.logger.log(`Version ${version} créée pour page ${pageId}`);
      return pageVersion;
    } catch (error) {
      this.logger.error(`Erreur création version: ${error.message}`);
      throw error;
    }
  }

  /**
   * Récupérer toutes les versions d'une page
   */
  async getVersions(pageId: string, tenantId: string, includeAutoSave: boolean = false) {
    const filter: any = { pageId, tenantId };
    
    if (!includeAutoSave) {
      filter.isAutoSave = false;
    }

    return this.pageVersionModel
      .find(filter)
      .sort({ version: -1 })
      .limit(50)
      .exec();
  }

  /**
   * Récupérer une version spécifique
   */
  async getVersion(versionId: string, tenantId: string) {
    return this.pageVersionModel.findOne({ _id: versionId, tenantId }).exec();
  }

  /**
   * Restaurer une version
   */
  async restoreVersion(versionId: string, tenantId: string) {
    const version = await this.getVersion(versionId, tenantId);
    if (!version) {
      throw new Error('Version non trouvée');
    }

    return {
      content: version.content,
      html: version.html,
      css: version.css,
    };
  }

  /**
   * Supprimer une version
   */
  async deleteVersion(versionId: string, tenantId: string) {
    const result = await this.pageVersionModel.deleteOne({ _id: versionId, tenantId });
    return result.deletedCount > 0;
  }

  /**
   * Comparer deux versions
   */
  async compareVersions(version1Id: string, version2Id: string, tenantId: string) {
    const [v1, v2] = await Promise.all([
      this.getVersion(version1Id, tenantId),
      this.getVersion(version2Id, tenantId),
    ]);

    if (!v1 || !v2) {
      throw new Error('Version(s) non trouvée(s)');
    }

    return {
      version1: {
        version: v1.version,
        createdAt: v1.createdAt,
        label: v1.label,
        comment: v1.comment,
      },
      version2: {
        version: v2.version,
        createdAt: v2.createdAt,
        label: v2.label,
        comment: v2.comment,
      },
      changes: {
        htmlChanged: v1.html !== v2.html,
        cssChanged: v1.css !== v2.css,
        contentChanged: JSON.stringify(v1.content) !== JSON.stringify(v2.content),
      },
    };
  }
}

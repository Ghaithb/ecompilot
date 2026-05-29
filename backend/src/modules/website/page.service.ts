import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Page, PageDocument } from './schemas/page.schema';
import { Website, WebsiteDocument } from './schemas/website.schema';

@Injectable()
export class PageService {
  private readonly logger = new Logger(PageService.name);

  constructor(
    @InjectModel(Page.name) private pageModel: Model<PageDocument>,
    @InjectModel(Website.name) private websiteModel: Model<WebsiteDocument>,
  ) {}

  /**
   * Créer une nouvelle page
   */
  async create(tenantId: string, createPageDto: any) {
    try {
      // Vérifier que le site existe
      const website = await this.websiteModel.findOne({ tenantId });
      if (!website) {
        throw new NotFoundException('Site web non trouvé');
      }

      // Vérifier si le slug est disponible pour ce site
      const slugExists = await this.pageModel.findOne({
        websiteId: website._id,
        slug: createPageDto.slug,
      });
      if (slugExists) {
        throw new BadRequestException('Une page avec cette URL existe déjà');
      }

      // Si c'est la page d'accueil, retirer le flag des autres pages
      if (createPageDto.isHomePage) {
        await this.pageModel.updateMany(
          { websiteId: website._id },
          { isHomePage: false }
        );
      }

      const page = new this.pageModel({
        websiteId: website._id,
        tenantId,
        ...createPageDto,
        seo: createPageDto.seo || {
          title: createPageDto.name,
          description: '',
          keywords: [],
        },
        settings: createPageDto.settings || {
          showHeader: true,
          showFooter: true,
        },
      });

      await page.save();

      this.logger.log(`Page créée: ${page.name} (${page.slug})`);
      return page;
    } catch (error) {
      this.logger.error(`Erreur création page: ${error.message}`);
      throw error;
    }
  }

  /**
   * Récupérer toutes les pages d'un tenant
   */
  async findAll(tenantId: string) {
    const website = await this.websiteModel.findOne({ tenantId });
    if (!website) {
      // Retourner un tableau vide si aucun site n'existe (au lieu de lever une erreur)
      return [];
    }

    const pages = await this.pageModel
      .find({ websiteId: website._id })
      .sort({ order: 1, createdAt: 1 })
      .exec();

    return pages;
  }

  /**
   * Récupérer une page par son ID
   */
  async findOne(id: string, tenantId: string) {
    const page = await this.pageModel.findOne({ _id: id, tenantId });
    if (!page) {
      throw new NotFoundException('Page non trouvée');
    }
    return page;
  }

  /**
   * Récupérer une page par son slug (pour le site public)
   */
  async findBySlug(websiteSlug: string, pageSlug: string) {
    const website = await this.websiteModel.findOne({ slug: websiteSlug, published: true });
    if (!website) {
      throw new NotFoundException('Site web non trouvé');
    }

    const page = await this.pageModel.findOne({
      websiteId: website._id,
      slug: pageSlug,
      published: true,
    });

    if (!page) {
      throw new NotFoundException('Page non trouvée');
    }

    // Incrémenter le compteur de vues
    page.views = (page.views || 0) + 1;
    await page.save();

    return { page, website };
  }

  /**
   * Récupérer la page d'accueil
   */
  async findHomePage(websiteSlug: string) {
    const website = await this.websiteModel.findOne({ slug: websiteSlug, published: true });
    if (!website) {
      throw new NotFoundException('Site web non trouvé');
    }

    const page = await this.pageModel.findOne({
      websiteId: website._id,
      isHomePage: true,
      published: true,
    });

    if (!page) {
      throw new NotFoundException('Page d\'accueil non trouvée');
    }

    // Incrémenter le compteur de vues
    page.views = (page.views || 0) + 1;
    await page.save();

    return { page, website };
  }

  /**
   * Récupérer la page d'accueil par ID de site
   */
  async findHomePageById(websiteId: string) {
    const oid = Types.ObjectId.isValid(websiteId)
      ? new Types.ObjectId(websiteId)
      : (websiteId as unknown as Types.ObjectId);

    let page = await this.pageModel
      .findOne({ websiteId: oid, isHomePage: true })
      .sort({ order: 1 });

    if (!page) {
      page = await this.pageModel.findOne({ websiteId: oid, slug: '/' }).sort({ order: 1 });
    }

    if (!page) {
      page = await this.pageModel
        .findOne({ websiteId: oid, published: true })
        .sort({ order: 1, createdAt: 1 });
    }

    if (!page) {
      page = await this.pageModel.findOne({ websiteId: oid }).sort({ order: 1, createdAt: 1 });
    }

    if (!page) {
      throw new NotFoundException('Page d\'accueil non trouvée');
    }

    return page;
  }

  /**
   * Récupérer une page par slug et ID de site
   */
  async findBySlugAndWebsiteId(websiteId: string, pageSlug: string) {
    const page = await this.pageModel.findOne({
      websiteId,
      slug: pageSlug,
      published: true,
    });

    if (!page) {
      throw new NotFoundException('Page non trouvée');
    }

    return page;
  }

  /**
   * Mettre à jour une page
   */
  async update(id: string, tenantId: string, updatePageDto: any) {
    const page = await this.pageModel.findOne({ _id: id, tenantId });
    if (!page) {
      throw new NotFoundException('Page non trouvée');
    }

    // Si le slug change, vérifier qu'il est disponible
    if (updatePageDto.slug && updatePageDto.slug !== page.slug) {
      const slugExists = await this.pageModel.findOne({
        websiteId: page.websiteId,
        slug: updatePageDto.slug,
        _id: { $ne: id },
      });
      if (slugExists) {
        throw new BadRequestException('Une page avec cette URL existe déjà');
      }
    }

    // Si c'est la page d'accueil, retirer le flag des autres pages
    if (updatePageDto.isHomePage) {
      await this.pageModel.updateMany(
        { websiteId: page.websiteId, _id: { $ne: id } },
        { isHomePage: false }
      );
    }

    Object.assign(page, updatePageDto);
    await page.save();

    this.logger.log(`Page mise à jour: ${page.name}`);
    return page;
  }

  /**
   * Publier une page
   */
  async publish(id: string, tenantId: string) {
    const page = await this.pageModel.findOne({ _id: id, tenantId });
    if (!page) {
      throw new NotFoundException('Page non trouvée');
    }

    page.published = true;
    page.publishedAt = new Date();
    await page.save();

    this.logger.log(`Page publiée: ${page.name}`);
    return page;
  }

  /**
   * Dépublier une page
   */
  async unpublish(id: string, tenantId: string) {
    const page = await this.pageModel.findOne({ _id: id, tenantId });
    if (!page) {
      throw new NotFoundException('Page non trouvée');
    }

    // Ne pas permettre de dépublier la page d'accueil
    if (page.isHomePage) {
      throw new BadRequestException('Impossible de dépublier la page d\'accueil');
    }

    page.published = false;
    await page.save();

    this.logger.log(`Page dépubliée: ${page.name}`);
    return page;
  }

  /**
   * Supprimer une page
   */
  async delete(id: string, tenantId: string) {
    const page = await this.pageModel.findOne({ _id: id, tenantId });
    if (!page) {
      throw new NotFoundException('Page non trouvée');
    }

    // Ne pas permettre de supprimer la page d'accueil
    if (page.isHomePage) {
      throw new BadRequestException('Impossible de supprimer la page d\'accueil');
    }

    await page.deleteOne();

    this.logger.log(`Page supprimée: ${page.name}`);
    return { message: 'Page supprimée avec succès' };
  }

  /**
   * Dupliquer une page
   */
  async duplicate(id: string, tenantId: string) {
    const originalPage = await this.pageModel.findOne({ _id: id, tenantId });
    if (!originalPage) {
      throw new NotFoundException('Page non trouvée');
    }

    const duplicatedPage = new this.pageModel({
      websiteId: originalPage.websiteId,
      tenantId: originalPage.tenantId,
      name: `${originalPage.name} (Copie)`,
      slug: `${originalPage.slug}-copy-${Date.now()}`,
      content: originalPage.content,
      html: originalPage.html,
      css: originalPage.css,
      isHomePage: false,
      published: false,
      seo: originalPage.seo,
      settings: originalPage.settings,
      order: originalPage.order + 1,
    });

    await duplicatedPage.save();

    this.logger.log(`Page dupliquée: ${originalPage.name} → ${duplicatedPage.name}`);
    return duplicatedPage;
  }

  /**
   * Réorganiser les pages
   */
  async reorder(tenantId: string, pageOrders: { id: string; order: number }[]) {
    const website = await this.websiteModel.findOne({ tenantId });
    if (!website) {
      throw new NotFoundException('Site web non trouvé');
    }

    for (const { id, order } of pageOrders) {
      await this.pageModel.updateOne(
        { _id: id, tenantId },
        { order }
      );
    }

    this.logger.log(`Pages réorganisées pour tenant ${tenantId}`);
    return { message: 'Pages réorganisées avec succès' };
  }
}

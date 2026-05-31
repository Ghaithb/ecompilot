import { Injectable, NotFoundException, BadRequestException, Logger, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Website, WebsiteDocument } from './schemas/website.schema';
import { Page, PageDocument } from './schemas/page.schema';
import { Booking } from './schemas/booking.schema';
import { ContactMessage } from './schemas/contact-message.schema';
import { NewsletterSubscriber } from './schemas/newsletter.schema';
import { CreatePublicOrderDto, ContactMessageDto, CreateBookingDto, NewsletterSubscribeDto, SaveAbandonedCartDto } from './dto/public-website.dto';
import { GenerateWebsiteDto } from './dto/generate-website.dto';
import { SmartWebsiteGeneratorService } from './services/smart-website-generator.service';
import { OrdersService } from '../orders/orders.service';
import { TunisiaPaymentService } from '../payment/tunisia-payment.service';
import { CustomersService } from '../customers/customers.service';
import { ProductsService } from '../products/products.service';
import { normalizePhone, normalizeTunisianPhone } from '../../common/utils/phone.util';
import { CartAbandonmentService } from '../cart/cart-abandonment.service';
import {
  DEFAULT_STORE_TEMPLATE,
  STORE_TEMPLATES,
  StoreTemplateId,
} from './constants/store-templates';
import { STARTER_CATALOG, resolveShopNiche } from './constants/starter-catalog';
import { UpdateWebsiteAnalyticsDto, UpdateBrandingDto } from './dto/website-settings.dto';

@Injectable()
export class WebsiteService {
  private readonly logger = new Logger(WebsiteService.name);

  constructor(
    @InjectModel(Website.name) private websiteModel: Model<WebsiteDocument>,
    @InjectModel(Page.name) private pageModel: Model<PageDocument>,
    @InjectModel(Booking.name) private bookingModel: Model<Booking>,
    @InjectModel(ContactMessage.name) private contactMessageModel: Model<ContactMessage>,
    @InjectModel(NewsletterSubscriber.name) private newsletterModel: Model<NewsletterSubscriber>,
    private readonly smartWebsiteGenerator: SmartWebsiteGeneratorService,
    private readonly ordersService: OrdersService,
    private readonly tunisiaPaymentService: TunisiaPaymentService,
    private readonly customersService: CustomersService,
    private readonly productsService: ProductsService,
    @Inject(forwardRef(() => CartAbandonmentService))
    private readonly cartAbandonment: CartAbandonmentService,
  ) {}

  /**
   * Créer un nouveau site web
   */
  async create(tenantId: string, createWebsiteDto: any) {
    try {
      // Vérifier si le tenant a déjà un site
      const existingWebsite = await this.websiteModel.findOne({ tenantId });
      if (existingWebsite) {
        throw new BadRequestException('Un site web existe déjà pour ce tenant');
      }

      // Vérifier si le slug est disponible
      const slugExists = await this.websiteModel.findOne({ slug: createWebsiteDto.slug });
      if (slugExists) {
        throw new BadRequestException('Ce nom de site est déjà utilisé');
      }

      // Créer le site
      const website = new this.websiteModel({
        tenantId,
        ...createWebsiteDto,
        theme: createWebsiteDto.theme || {
          primaryColor: '#3B82F6',
          secondaryColor: '#10B981',
          accentColor: '#F59E0B',
          backgroundColor: '#FFFFFF',
          textColor: '#1F2937',
          font: 'Inter',
        },
        settings: createWebsiteDto.settings || {
          enableCart: true,
          enableCheckout: true,
          enableContact: true,
          currency: 'TND',
          language: 'fr',
          timezone: 'Africa/Tunis',
        },
        analytics: {
          enableTracking: false,
        },
        domain: {
          sslEnabled: true,
        },
      });

      await website.save();

      // Créer la page d'accueil par défaut
      await this.createDefaultHomePage(website._id.toString(), tenantId);

      this.logger.log(`Site web créé pour tenant ${tenantId}: ${website.slug}`);
      return website;
    } catch (error) {
      this.logger.error(`Erreur création site web: ${error.message}`);
      throw error;
    }
  }

  /**
   * Récupérer le site web d'un tenant
   */
  async findByTenant(tenantId: string) {
    let website = await this.websiteModel.findOne({ tenantId, isActive: true });
    if (!website) {
      website = await this.websiteModel.findOne({ tenantId }).sort({ updatedAt: -1 });
      if (website) {
        website.isActive = true;
        website.published = true;
        await website.save();
        this.logger.log(`Boutique réactivée pour tenant ${tenantId}: ${website.slug}`);
      }
    }
    if (!website) {
      throw new NotFoundException('Aucun site web trouvé');
    }
    return website;
  }

  /**
   * Récupérer un site web par son slug
   */
  async findBySlug(slug: string) {
    const website = await this.websiteModel.findOne({
      slug,
      published: true,
      isActive: { $ne: false },
    });
    if (!website) {
      throw new NotFoundException('Site web non trouvé');
    }
    return website;
  }

  /**
   * Récupérer la page d'accueil d'un site (ObjectId + repli sur première page publiée)
   */
  async getHomePage(websiteId: string) {
    const oid = Types.ObjectId.isValid(websiteId)
      ? new Types.ObjectId(websiteId)
      : websiteId;

    let homePage = await this.pageModel
      .findOne({ websiteId: oid, isHomePage: true })
      .sort({ order: 1 });

    if (!homePage) {
      homePage = await this.pageModel
        .findOne({ websiteId: oid, slug: '/' })
        .sort({ order: 1 });
    }

    if (!homePage) {
      homePage = await this.pageModel
        .findOne({ websiteId: oid, published: true })
        .sort({ order: 1, createdAt: 1 });
    }

    if (!homePage) {
      homePage = await this.pageModel
        .findOne({ websiteId: oid })
        .sort({ order: 1, createdAt: 1 });
    }

    return homePage;
  }

  /**
   * Mettre à jour un site web
   */
  async update(id: string, tenantId: string, updateWebsiteDto: any) {
    const website = await this.websiteModel.findOne({ _id: id, tenantId });
    if (!website) {
      throw new NotFoundException('Site web non trouvé');
    }

    // Si le slug change, vérifier qu'il est disponible
    if (updateWebsiteDto.slug && updateWebsiteDto.slug !== website.slug) {
      const slugExists = await this.websiteModel.findOne({ slug: updateWebsiteDto.slug });
      if (slugExists) {
        throw new BadRequestException('Ce nom de site est déjà utilisé');
      }
    }

    Object.assign(website, updateWebsiteDto);
    await website.save();

    this.logger.log(`Site web mis à jour: ${website.slug}`);
    return website;
  }

  /**
   * Publier un site web
   */
  async publish(id: string, tenantId: string) {
    const website = await this.websiteModel.findOne({ _id: id, tenantId });
    if (!website) {
      throw new NotFoundException('Site web non trouvé');
    }

    website.published = true;
    website.publishedAt = new Date();
    await website.save();

    this.logger.log(`Site web publié: ${website.slug}`);
    return website;
  }

  /**
   * Dépublier un site web
   */
  async unpublish(id: string, tenantId: string) {
    const website = await this.websiteModel.findOne({ _id: id, tenantId });
    if (!website) {
      throw new NotFoundException('Site web non trouvé');
    }

    website.published = false;
    await website.save();

    this.logger.log(`Site web dépublié: ${website.slug}`);
    return website;
  }

  /**
   * Supprimer un site web
   */
  async delete(id: string, tenantId: string) {
    const website = await this.websiteModel.findOne({ _id: id, tenantId });
    if (!website) {
      throw new NotFoundException('Site web non trouvé');
    }

    // Supprimer toutes les pages associées
    await this.pageModel.deleteMany({ websiteId: website._id });

    await website.deleteOne();

    this.logger.log(`Site web supprimé: ${website.slug}`);
    return { message: 'Site web supprimé avec succès' };
  }

  /**
   * Créer la page d'accueil par défaut
   */
  private async createDefaultHomePage(websiteId: string, tenantId: string) {
    const defaultPage = new this.pageModel({
      websiteId,
      tenantId,
      name: 'Accueil',
      slug: '/',
      isHomePage: true,
      published: true,
      content: {
        // Contenu GrapesJS par défaut
        html: '<div class="hero">Bienvenue sur mon site</div>',
        css: '.hero { text-align: center; padding: 100px 20px; font-size: 2rem; }',
      },
      html: '<div class="hero">Bienvenue sur mon site</div>',
      css: '.hero { text-align: center; padding: 100px 20px; font-size: 2rem; }',
      seo: {
        title: 'Accueil',
        description: 'Bienvenue sur mon site',
        keywords: [],
      },
      settings: {
        showHeader: true,
        showFooter: true,
      },
      order: 0,
    });

    await defaultPage.save();
    return defaultPage;
  }

  /**
   * Obtenir les statistiques d'un site
   */
  async getStats(tenantId: string) {
    const website = await this.findByTenant(tenantId);
    const pages = await this.pageModel.find({ websiteId: website._id });
    
    const totalViews = pages.reduce((sum, page) => sum + (page.views || 0), 0);
    const publishedPages = pages.filter(p => p.published).length;

    return {
      totalPages: pages.length,
      publishedPages,
      totalViews,
      published: website.published,
      slug: website.slug,
      createdAt: website.createdAt,
    };
  }

  /**
   * Générer automatiquement un site web complet selon les données du formulaire
   */
  private resolveStoreTemplateId(templateId?: string): StoreTemplateId {
    const id = (templateId || DEFAULT_STORE_TEMPLATE) as StoreTemplateId;
    return STORE_TEMPLATES[id] ? id : DEFAULT_STORE_TEMPLATE;
  }

  private buildDefaultSlogan(companyName: string): string {
    return `Livraison rapide · Paiement à la livraison — ${companyName}`;
  }

  private whatsappUrlFromPhone(phone?: string): string | undefined {
    if (!phone?.trim()) return undefined;
    const normalized = normalizePhone(phone);
    const digits = normalized.replace(/\D/g, '');
    if (digits.length < 10) return undefined;
    return `https://wa.me/${digits}`;
  }

  private async seedStarterCatalog(tenantId: string, niche?: string): Promise<number> {
    const existing = await this.productsService.findAll(tenantId, { limit: 1, page: 1 });
    if (existing.total > 0) return 0;

    const catalog = STARTER_CATALOG[resolveShopNiche(niche)];
    let created = 0;
    for (const item of catalog) {
      await this.productsService.create(tenantId, {
        title: item.title,
        description: item.description,
        category: item.category,
        status: 'active',
        images: [item.imageUrl],
        variants: [{ sku: item.sku, name: 'Default', price: item.price, inventory: 25 }],
      });
      created++;
    }
    this.logger.log(`Catalogue démarrage: ${created} produit(s) pour tenant ${tenantId}`);
    return created;
  }

  /** Met à jour la boutique existante — une seule instance par tenant, pas de nouveau slug */
  private async syncExistingWebsiteFromWizard(
    website: WebsiteDocument,
    wizardData: GenerateWebsiteDto,
    tenantId: string,
  ) {
    const colors = this.resolveThemeColors(wizardData.branding);
    const location = this.buildLocationString(wizardData);
    const templateId = wizardData.storeTemplate
      ? this.resolveStoreTemplateId(wizardData.storeTemplate)
      : (website.storeTemplate as StoreTemplateId) || DEFAULT_STORE_TEMPLATE;
    const preset = STORE_TEMPLATES[templateId];
    const slogan =
      wizardData.branding?.slogan?.trim() || website.theme?.slogan || this.buildDefaultSlogan(wizardData.companyName);

    website.name = wizardData.companyName;
    website.businessType = wizardData.business.industry;
    const currentTheme = website.theme || {
      primaryColor: colors.primary,
      secondaryColor: colors.secondary,
      accentColor: colors.secondary,
      backgroundColor: '#FFFFFF',
      textColor: '#111827',
      font: 'Inter',
    };
    website.theme = {
      ...preset.theme,
      ...currentTheme,
      primaryColor: wizardData.branding?.primaryColor || preset.theme.primaryColor,
      secondaryColor: wizardData.branding?.secondaryColor || preset.theme.secondaryColor,
      logo: currentTheme.logo ?? wizardData.branding?.logoUrl,
      slogan,
    };
    website.storeTemplate = templateId;
    website.businessConfig = {
      ...(website.businessConfig || {}),
      industry: wizardData.business.industry,
      targetAudience: wizardData.business.targetAudience,
      customFields: {
        ...(website.businessConfig?.customFields || {}),
        primaryGoal: wizardData.business.primaryGoal,
        location,
        phone: wizardData.contact.phone,
        email: wizardData.contact.email,
      },
    };
    website.published = true;
    website.isActive = true;

    await website.save();

    let starterProducts = 0;
    if (wizardData.seedStarterProducts !== false) {
      starterProducts = await this.seedStarterCatalog(tenantId, wizardData.business.niche);
    }

    this.logger.log(`Boutique existante synchronisée (slug conservé: ${website.slug})`);

    const homePage = await this.getHomePage(website._id.toString());

    return {
      websiteId: website._id,
      homePageId: homePage?._id,
      slug: website.slug,
      name: website.name,
      message: 'Boutique mise à jour — même lien public conservé',
      updated: true,
      starterProducts,
      website,
      homePage,
    };
  }

  async generateWebsite(tenantId: string, wizardData: GenerateWebsiteDto) {
    try {
      const existingActive = await this.websiteModel.findOne({ tenantId, isActive: true });
      if (existingActive) {
        return this.syncExistingWebsiteFromWizard(existingActive, wizardData, tenantId);
      }

      const existingInactive = await this.websiteModel
        .findOne({ tenantId, isActive: false })
        .sort({ updatedAt: -1 });
      if (existingInactive) {
        existingInactive.isActive = true;
        existingInactive.published = true;
        await existingInactive.save();
        return this.syncExistingWebsiteFromWizard(existingInactive, wizardData, tenantId);
      }

      const slug = await this.generateUniqueSlug(wizardData.companyName);
      const colors = this.resolveThemeColors(wizardData.branding);
      const uniqueSellingPoints = this.extractUniqueSellingPoints(wizardData.business.keyFeatures);
      const seoKeywords = this.buildSeoKeywords(wizardData, uniqueSellingPoints);
      const seoTitle = this.buildSeoTitle(wizardData);
      const seoDescription = this.buildSeoDescription(wizardData);
      const location = this.buildLocationString(wizardData);
      const templateId = this.resolveStoreTemplateId(wizardData.storeTemplate);
      const preset = STORE_TEMPLATES[templateId];
      const slogan =
        wizardData.branding?.slogan?.trim() || this.buildDefaultSlogan(wizardData.companyName);

      const website = new this.websiteModel({
        tenantId,
        slug,
        name: wizardData.companyName,
        businessType: wizardData.business.industry,
        theme: {
          ...preset.theme,
          primaryColor: wizardData.branding?.primaryColor || preset.theme.primaryColor,
          secondaryColor: wizardData.branding?.secondaryColor || preset.theme.secondaryColor,
          logo: wizardData.branding?.logoUrl,
          slogan,
        },
        seo: {
          title: seoTitle,
          description: seoDescription,
          keywords: seoKeywords,
        },
        settings: {
          enableCart: false,
          enableCheckout: false,
          enableContact: true,
          currency: 'TND',
          language: 'fr',
          timezone: 'Africa/Tunis',
        },
        features: this.buildDefaultFeatures(wizardData.contact.email, wizardData.contact.phone),
        businessConfig: {
          industry: wizardData.business.industry,
          targetAudience: wizardData.business.targetAudience,
          uniqueSellingPoints,
          customFields: {
            primaryGoal: wizardData.business.primaryGoal,
            brandVoice: wizardData.branding?.brandVoice,
            launchTimeline: wizardData.contentStrategy?.launchTimeline,
            hasExistingContent: wizardData.contentStrategy?.hasExistingContent,
            location,
            phone: wizardData.contact.phone,
            email: wizardData.contact.email,
          },
        },
        analytics: {
          enableTracking: false,
        },
        domain: {
          sslEnabled: true,
        },
        published: true, // ✅ Publier automatiquement après génération
        isActive: true, // Nouveau site = actif par défaut
        storeTemplate: templateId,
      });

      await website.save();
      // Pass slug and website settings/theme so the generator has full context
  const generatedHtml = await this.smartWebsiteGenerator.generateSmartWebsite({
        tenantId,
        slug,
        companyName: wizardData.companyName,
        industry: wizardData.business.industry,
        businessType: wizardData.business.industry,
        description: wizardData.business.description,
        slogan,
        phone: wizardData.contact.phone,
        email: wizardData.contact.email,
        contactEmail: wizardData.contact.email,
        location, // Location contient déjà address + city + country
        primaryGoal: wizardData.business.primaryGoal,
        targetAudience: wizardData.business.targetAudience,
        keyFeatures: wizardData.business.keyFeatures,
        brandVoice: wizardData.branding?.brandVoice,
        colorPalette: wizardData.branding?.colorPalette,
        primaryColor: colors.primary,
        secondaryColor: colors.secondary,
        logoUrl: wizardData.branding?.logoUrl,
        hasExistingContent: wizardData.contentStrategy?.hasExistingContent,
        contentNotes: wizardData.contentStrategy?.contentNotes,
        launchTimeline: wizardData.contentStrategy?.launchTimeline,
        // settings that affect rendering
        settings: website.settings || {
          enableCart: false,
          enableCheckout: false,
          enableContact: true,
          currency: 'TND',
          language: 'fr',
        },
        // theme details
        theme: website.theme || {
          primaryColor: colors.primary,
          secondaryColor: colors.secondary,
          logo: wizardData.branding?.logoUrl,
          font: 'Inter',
        },
  } as any);

      this.logger.log(`✅ Site moderne généré avec succès pour ${wizardData.companyName}`);

      // Extraire le CSS du HTML généré
      const cssMatch = generatedHtml.match(/<style[^>]*>([\s\S]*?)<\/style>/);
      const extractedCss = cssMatch ? cssMatch[1] : '';

      const homePage = new this.pageModel({
        websiteId: website._id,
        tenantId,
        name: 'Accueil',
        slug: '/',
        isHomePage: true,
        published: true,
        content: {
          html: generatedHtml,
          css: extractedCss,
        },
        html: generatedHtml,
        css: extractedCss,
        seo: {
          title: seoTitle,
          description: seoDescription,
          keywords: seoKeywords,
        },
        settings: {
          showHeader: true,
          showFooter: true,
        },
        order: 0,
      });

      await homePage.save();

      let starterProducts = 0;
      if (wizardData.seedStarterProducts !== false) {
        starterProducts = await this.seedStarterCatalog(tenantId, wizardData.business.niche);
      }

      this.logger.log(`Site web généré automatiquement pour ${wizardData.companyName} (${wizardData.business.industry})`);

      return {
        websiteId: website._id,
        homePageId: homePage._id,
        slug: website.slug,
        message: 'Site web généré avec succès',
        starterProducts,
        website,
        homePage,
      };
    } catch (error) {
      this.logger.error(`Erreur génération site web: ${error.message}`);
      throw error;
    }
  }

  /**
   * Régénère le HTML de la page d'accueil (checkout Alpine corrigé) sans changer le slug.
   */
  async refreshStoreHtml(tenantId: string, phoneOverride?: string) {
    const website = await this.findByTenant(tenantId);
    const homePage = await this.getHomePage(website._id.toString());
    if (!homePage) {
      throw new NotFoundException('Page d\'accueil introuvable');
    }

    const bc = website.businessConfig;
    const cf = (bc?.customFields || {}) as Record<string, string | undefined>;

    const generatedHtml = await this.smartWebsiteGenerator.generateSmartWebsite({
      tenantId,
      slug: website.slug,
      companyName: website.name,
      industry: website.businessType || bc?.industry || 'ecommerce',
      businessType: website.businessType,
      description: website.seo?.description,
      phone: phoneOverride || cf.phone,
      email: cf.email || website.features?.contact?.notificationEmail,
      contactEmail: cf.email || website.features?.contact?.notificationEmail,
      location: cf.location || 'Tunisie',
      primaryGoal: cf.primaryGoal,
      targetAudience: bc?.targetAudience,
      keyFeatures: bc?.uniqueSellingPoints?.join(', '),
      primaryColor: website.theme?.primaryColor,
      secondaryColor: website.theme?.secondaryColor,
      logoUrl: website.theme?.logo,
      settings: website.settings,
      theme: website.theme,
    } as any);

    const cssMatch = generatedHtml.match(/<style[^>]*>([\s\S]*?)<\/style>/);
    const extractedCss = cssMatch ? cssMatch[1] : '';

    await this.pageModel.updateOne(
      { _id: homePage._id },
      {
        $set: {
          html: generatedHtml,
          css: extractedCss,
          'content.html': generatedHtml,
          'content.css': extractedCss,
        },
      },
    );

    this.logger.log(`HTML boutique régénéré pour ${website.slug}`);
    return { slug: website.slug, refreshed: true };
  }

  private buildDefaultFeatures(notificationEmail: string, phone?: string) {
    return {
      ecommerce: {
        enabled: false,
        paymentMethods: ['card', 'bank_transfer'],
        shippingMethods: ['standard'],
        taxRate: 20,
      },
      booking: {
        enabled: false,
        maxGuestsPerSlot: 10,
        bookingDuration: 60,
        advanceBookingDays: 30,
      },
      contact: {
        enabled: true,
        autoReply: false,
        notificationEmail,
        phone: phone || undefined,
        whatsapp: this.whatsappUrlFromPhone(phone),
      },
      newsletter: {
        enabled: true,
        provider: 'internal',
        welcomeEmail: true,
      },
      blog: {
        enabled: false,
        commentsEnabled: false,
        categoriesEnabled: true,
      },
      gallery: {
        enabled: false,
        allowUpload: true,
        maxImages: 100,
      },
      services: {
        enabled: false,
        customServices: [],
      },
      reviews: {
        enabled: false,
        moderationRequired: true,
        allowRatings: true,
      },
      faq: {
        enabled: true,
        categories: [],
      },
      multiLanguage: {
        enabled: false,
        languages: ['fr'],
        defaultLanguage: 'fr',
      },
    };
  }

  private extractUniqueSellingPoints(keyFeatures?: string): string[] {
    if (!keyFeatures) {
      return [];
    }

    return keyFeatures
      .split(/[\n,;]+/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  private buildSeoKeywords(data: GenerateWebsiteDto, sellingPoints: string[]): string[] {
    const keywords = [
      data.companyName,
      data.business.industry,
      data.business.targetAudience,
      data.business.primaryGoal,
      data.contact.city,
      data.contact.country,
      ...sellingPoints,
    ]
      .filter(Boolean)
      .map((item) => item as string);

    return Array.from(new Set(keywords)).slice(0, 15);
  }

  private buildSeoTitle(data: GenerateWebsiteDto): string {
    const context = data.business.primaryGoal || data.business.industry;
    return context ? `${data.companyName} – ${context}` : data.companyName;
  }

  private buildSeoDescription(data: GenerateWebsiteDto): string {
    return (
      data.business.description?.substring(0, 160) ||
      data.business.primaryGoal ||
      `Découvrez ${data.companyName}`
    );
  }

  private buildLocationString(data: GenerateWebsiteDto): string {
    const explicit = data.contact.location?.trim();
    if (explicit) {
      return explicit;
    }

    // Récupérer address, city, country et nettoyer les doublons
    const address = data.contact.address?.trim() || '';
    const city = data.contact.city?.trim() || '';
    const country = data.contact.country?.trim() || '';

    // Log pour debug
    this.logger.log(`📍 Building location - Address: "${address}", City: "${city}", Country: "${country}"`);

    // Construire la location en évitant les doublons
    const parts: string[] = [];
    
    // Ajouter l'adresse si elle ne contient pas déjà la ville
    if (address && !address.toLowerCase().includes(city.toLowerCase())) {
      parts.push(address);
    } else if (address && !city) {
      // Si pas de ville mais une adresse, on garde l'adresse
      parts.push(address);
    }
    
    // Ajouter la ville si elle n'est pas déjà dans l'adresse
    if (city && !address.toLowerCase().includes(city.toLowerCase())) {
      parts.push(city);
    }
    
    // Ajouter le pays s'il n'est pas déjà dans city ou address
    if (country && !city.toLowerCase().includes(country.toLowerCase()) && !address.toLowerCase().includes(country.toLowerCase())) {
      parts.push(country);
    }

    const result = parts.join(', ') || 'France';
    this.logger.log(`✅ Final location: "${result}"`);
    
    return result;
  }

  private resolveThemeColors(branding?: GenerateWebsiteDto['branding']) {
    const fallback = {
      primary: '#3B82F6',
      secondary: '#8B5CF6',
    };

    if (!branding) {
      return fallback;
    }

    const paletteTokens = branding.colorPalette
      ?.split(/[,;/\n]+/)
      .map((token) => token.trim())
      .filter(Boolean);

    const primary = branding.primaryColor || paletteTokens?.[0] || fallback.primary;
    const secondary = branding.secondaryColor || paletteTokens?.[1] || paletteTokens?.[0] || fallback.secondary;

    return { primary, secondary };
  }

  private async generateUniqueSlug(companyName: string): Promise<string> {
    const baseSlug = companyName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    let slug = baseSlug;
    let counter = 1;

    while (await this.websiteModel.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }

  /**
   * Méthodes de paiement publiques pour la vitrine
   */
  async getPublicPaymentMethods(tenantId: string) {
    return this.tunisiaPaymentService.getPublicPaymentMethods(tenantId);
  }

  /**
   * Créer une commande depuis le site public
   */
  async createPublicOrder(
    tenantId: string | { toString(): string },
    orderData: CreatePublicOrderDto,
    storeSlug?: string,
  ) {
    try {
      const tenantKey =
        typeof tenantId === 'string' ? tenantId : tenantId?.toString?.() || String(tenantId);
      const phone = normalizeTunisianPhone(orderData.customer.phone);
      const nameParts = orderData.customer.name.trim().split(/\s+/);
      const firstName = nameParts[0] || 'Client';
      const lastName = nameParts.slice(1).join(' ') || '';
      const email = orderData.customer.email || `${phone.replace('+', '')}@guest.ecompilot.local`;
      const cityLabel = [orderData.customer.delegation, orderData.customer.governorate]
        .filter(Boolean)
        .join(', ') || orderData.customer.city || '';

      await this.customersService.findOrCreateByPhone(tenantKey, phone, {
        firstName,
        lastName,
        email,
        defaultAddress: {
          address: orderData.customer.address || '',
          city: cityLabel,
          postalCode: orderData.customer.postalCode || '',
          country: orderData.customer.country || 'TN',
          state: orderData.customer.governorate,
        },
      });

      const lineItems = await Promise.all(
        orderData.items.map(async (item) => ({
          productId: item.productId,
          variantId: await this.productsService.resolveVariantRef(
            tenantKey,
            item.productId,
          ),
          title: item.title,
          quantity: item.quantity,
          price: item.price,
          total: item.price * item.quantity,
        })),
      );

      const formattedOrder = {
        orderNumber: `PUB-${Date.now()}`,
        customerEmail: email,
        shippingAddress: {
          firstName,
          lastName,
          address1: orderData.customer.address || 'Adresse non renseignée',
          city: cityLabel || 'Tunis',
          province: orderData.customer.governorate || cityLabel || 'Tunis',
          country: orderData.customer.country || 'TN',
          zip: orderData.customer.postalCode || '1000',
          phone,
        },
        billingAddress: {
          firstName,
          lastName,
          address1: orderData.customer.address || 'Adresse non renseignée',
          city: cityLabel || 'Tunis',
          province: orderData.customer.governorate || cityLabel || 'Tunis',
          country: orderData.customer.country || 'TN',
          zip: orderData.customer.postalCode || '1000',
          phone,
        },
        lineItems,
        subtotal: orderData.total,
        total: orderData.total,
        currency: orderData.currency || 'TND',
        paymentMethod: orderData.paymentMethod || 'cod',
        status: 'pending',
      };

      const order = await this.ordersService.create(formattedOrder, tenantKey);

      this.logger.log(`Commande réelle créée via OrdersService: ${order._id} pour tenant ${tenantKey}`);

      let paymentUrl: string | undefined;
      const method = orderData.paymentMethod || 'cod';
      if (method === 'konnect' || method === 'flouci') {
        try {
          const payment = await this.tunisiaPaymentService.initiateOrderPayment(
            tenantKey,
            order._id.toString(),
            method,
          );
          paymentUrl = payment.paymentUrl;
        } catch (paymentError) {
          this.logger.error(`Erreur initiation paiement ${method}: ${paymentError.message}`);
        }
      }

      return {
        ...(typeof (order as any).toObject === 'function' ? (order as any).toObject() : order),
        paymentUrl,
      };
    } catch (error) {
      this.logger.error(`Erreur création commande via OrdersService: ${error.message}`);
      throw new BadRequestException(error.message || 'Erreur lors de la création de la commande');
    }
  }

  /**
   * Gérer un message de contact
   */
  async handleContactMessage(tenantId: string, contactData: ContactMessageDto) {
    try {
      const message = await this.contactMessageModel.create({
        tenantId,
        name: contactData.name,
        email: contactData.email,
        phone: contactData.phone,
        message: contactData.message,
        subject: contactData.subject || 'Message depuis le site web',
        status: 'unread',
        source: 'website',
      });

      this.logger.log(`Message de contact reçu: ${message._id} pour tenant ${tenantId}`);
      
      // TODO: Envoyer email au client
      
      return message;
    } catch (error) {
      this.logger.error(`Erreur sauvegarde message: ${error.message}`);
      throw new BadRequestException('Erreur lors de l\'envoi du message');
    }
  }

  /**
   * Créer une réservation
   */
  async createBooking(tenantId: string, bookingData: CreateBookingDto) {
    try {
      // Vérifier la disponibilité
      const isAvailable = await this.checkAvailability(
        tenantId,
        bookingData.date,
        bookingData.time,
      );

      if (!isAvailable) {
        throw new BadRequestException('Ce créneau n\'est plus disponible');
      }

      const booking = await this.bookingModel.create({
        tenantId,
        date: bookingData.date,
        time: bookingData.time,
        guests: bookingData.guests,
        customer: bookingData.customer,
        notes: bookingData.notes,
        status: 'pending',
        source: 'website',
      });

      this.logger.log(`Réservation créée: ${booking._id} pour tenant ${tenantId}`);
      
      // TODO: Envoyer email de confirmation
      
      return booking;
    } catch (error) {
      this.logger.error(`Erreur création réservation: ${error.message}`);
      throw new BadRequestException(error.message || 'Erreur lors de la réservation');
    }
  }

  /**
   * Inscription à la newsletter
   */
  async subscribeNewsletter(tenantId: string, data: NewsletterSubscribeDto) {
    try {
      // Vérifier si déjà inscrit
      const existing = await this.newsletterModel.findOne({
        tenantId,
        email: data.email,
      });

      if (existing) {
        if (existing.status === 'active') {
          throw new BadRequestException('Déjà inscrit à la newsletter');
        }
        // Réactiver si désabonné
        existing.status = 'active';
        existing.subscribedAt = new Date();
        await existing.save();
        return existing;
      }

      const subscriber = await this.newsletterModel.create({
        tenantId,
        email: data.email,
        name: data.name,
        status: 'active',
        subscribedAt: new Date(),
        source: 'website',
      });

      this.logger.log(`Nouvelle inscription newsletter: ${subscriber._id} pour tenant ${tenantId}`);
      
      // TODO: Envoyer email de bienvenue
      
      return subscriber;
    } catch (error) {
      this.logger.error(`Erreur inscription newsletter: ${error.message}`);
      throw new BadRequestException(error.message || 'Erreur lors de l\'inscription');
    }
  }

  /**
   * Vérifier la disponibilité pour une réservation
   */
  async checkAvailability(tenantId: string, date: string, time: string): Promise<boolean> {
    try {
      // Compter les réservations au même créneau
      const count = await this.bookingModel.countDocuments({
        tenantId,
        date,
        time,
        status: { $in: ['pending', 'confirmed'] },
      });

      // TODO: Gérer une limite configurable par établissement
      const maxBookingsPerSlot = 10; // Par défaut
      
      return count < maxBookingsPerSlot;
    } catch (error) {
      this.logger.error(`Erreur vérification disponibilité: ${error.message}`);
      return false;
    }
  }

  /**
   * Récupérer tous les messages d'un tenant
   */
  async getContactMessages(tenantId: string, status?: 'unread' | 'read' | 'replied') {
    const filter: any = { tenantId };
    if (status) {
      filter.status = status;
    }
    
    return this.contactMessageModel
      .find(filter)
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Récupérer toutes les réservations d'un tenant
   */
  async getBookings(tenantId: string, status?: string) {
    const filter: any = { tenantId };
    if (status) {
      filter.status = status;
    }
    
    return this.bookingModel
      .find(filter)
      .sort({ date: 1, time: 1 })
      .exec();
  }

  /**
   * Récupérer les abonnés newsletter d'un tenant
   */
  async getNewsletterSubscribers(tenantId: string) {
    return this.newsletterModel
      .find({ tenantId, status: 'active' })
      .sort({ subscribedAt: -1 })
      .exec();
  }

  /**
   * Mettre à jour les fonctionnalités d'un site
   */
  async updateFeatures(tenantId: string, features: any) {
    const website = await this.websiteModel.findOne({ tenantId });
    if (!website) {
      throw new NotFoundException('Site web non trouvé');
    }

    // Fusionner les nouvelles features avec les existantes
    website.features = {
      ...website.features,
      ...features,
    };

    await website.save();
    this.logger.log(`Fonctionnalités mises à jour pour ${website.slug}`);
    
    return website;
  }

  /**
   * Activer/Désactiver une fonctionnalité spécifique
   */
  async toggleFeature(tenantId: string, featureName: string, enabled: boolean) {
    const website = await this.websiteModel.findOne({ tenantId });
    if (!website) {
      throw new NotFoundException('Site web non trouvé');
    }

    if (!website.features) {
      website.features = {} as any;
    }

    // Activer/désactiver la fonctionnalité
    if (!website.features[featureName]) {
      website.features[featureName] = { enabled } as any;
    } else {
      website.features[featureName].enabled = enabled;
    }

    await website.save();
    this.logger.log(`Fonctionnalité ${featureName} ${enabled ? 'activée' : 'désactivée'} pour ${website.slug}`);
    
    return website;
  }

  /**
   * Récupérer la configuration complète d'un site
   */
  async getWebsiteConfig(tenantId: string) {
    const website =
      (await this.websiteModel.findOne({ tenantId, isActive: true })) ||
      (await this.websiteModel.findOne({ tenantId }));
    if (!website) {
      throw new NotFoundException('Site web non trouvé');
    }

    return {
      id: website._id,
      slug: website.slug,
      name: website.name,
      businessType: website.businessType,
      published: website.published,
      theme: website.theme,
      seo: website.seo,
      settings: website.settings,
      features: website.features,
      businessConfig: website.businessConfig,
      analytics: website.analytics,
      storeTemplate: website.storeTemplate || DEFAULT_STORE_TEMPLATE,
      createdAt: website.createdAt,
      updatedAt: website.updatedAt,
    };
  }

  async updateAnalytics(tenantId: string, dto: UpdateWebsiteAnalyticsDto) {
    const website = await this.websiteModel.findOne({ tenantId });
    if (!website) throw new NotFoundException('Site web non trouvé');

    website.analytics = {
      ...(website.analytics || { enableTracking: true }),
      ...(dto.googleAnalyticsId !== undefined ? { googleAnalyticsId: dto.googleAnalyticsId || undefined } : {}),
      ...(dto.facebookPixelId !== undefined ? { facebookPixelId: dto.facebookPixelId || undefined } : {}),
      ...(dto.enableTracking !== undefined ? { enableTracking: dto.enableTracking } : {}),
    };
    await website.save();
    return website.analytics;
  }

  async updateBranding(tenantId: string, dto: UpdateBrandingDto) {
    const website = await this.websiteModel.findOne({ tenantId });
    if (!website) throw new NotFoundException('Site web non trouvé');

    const current = website.theme || {
      primaryColor: '#2563eb',
      secondaryColor: '#7c3aed',
      accentColor: '#7c3aed',
      backgroundColor: '#FFFFFF',
      textColor: '#111827',
      font: 'Inter',
    };

    if (dto.logo !== undefined) current.logo = dto.logo || undefined;
    if (dto.coverImage !== undefined) current.coverImage = dto.coverImage || undefined;
    if (dto.slogan !== undefined) current.slogan = dto.slogan || undefined;

    website.theme = current;
    website.markModified('theme');
    await website.save();

    return {
      theme: website.theme,
      slug: website.slug,
      name: website.name,
    };
  }

  async updateStoreTemplate(tenantId: string, templateId: string) {
    const id = templateId as StoreTemplateId;
    const preset = STORE_TEMPLATES[id];
    if (!preset) throw new BadRequestException('Template inconnu');

    const website =
      (await this.websiteModel.findOne({ tenantId, isActive: true })) ||
      (await this.websiteModel.findOne({ tenantId }));
    if (!website) throw new NotFoundException('Site web non trouvé');

    website.storeTemplate = id;
    website.theme = {
      ...(website.theme || {}),
      ...preset.theme,
      logo: website.theme?.logo,
      favicon: website.theme?.favicon,
      coverImage: website.theme?.coverImage,
      slogan: website.theme?.slogan,
    };
    await website.save();

    return {
      storeTemplate: id,
      theme: website.theme,
      preset,
    };
  }

  /**
   * Ajouter un service personnalisé
   */
  async addCustomService(tenantId: string, service: any) {
    const website = await this.websiteModel.findOne({ tenantId });
    if (!website) {
      throw new NotFoundException('Site web non trouvé');
    }

    if (!website.features) {
      website.features = {} as any;
    }

    if (!website.features.services) {
      website.features.services = { enabled: true, customServices: [] };
    }

    if (!website.features.services.customServices) {
      website.features.services.customServices = [];
    }

    // Générer un ID unique pour le service
    const serviceId = `service_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const newService = {
      id: serviceId,
      ...service,
    };

    website.features.services.customServices.push(newService);
    await website.save();

    this.logger.log(`Service personnalisé ajouté: ${newService.name} pour ${website.slug}`);
    return newService;
  }

  /**
   * Mettre à jour un service personnalisé
   */
  async updateCustomService(tenantId: string, serviceId: string, updates: any) {
    const website = await this.websiteModel.findOne({ tenantId });
    if (!website) {
      throw new NotFoundException('Site web non trouvé');
    }

    if (!website.features?.services?.customServices) {
      throw new NotFoundException('Aucun service trouvé');
    }

    const serviceIndex = website.features.services.customServices.findIndex(
      (s: any) => s.id === serviceId,
    );

    if (serviceIndex === -1) {
      throw new NotFoundException('Service non trouvé');
    }

    website.features.services.customServices[serviceIndex] = {
      ...website.features.services.customServices[serviceIndex],
      ...updates,
      id: serviceId, // Garder le même ID
    };

    await website.save();
    this.logger.log(`Service ${serviceId} mis à jour pour ${website.slug}`);
    
    return website.features.services.customServices[serviceIndex];
  }

  /**
   * Supprimer un service personnalisé
   */
  async deleteCustomService(tenantId: string, serviceId: string) {
    const website = await this.websiteModel.findOne({ tenantId });
    if (!website) {
      throw new NotFoundException('Site web non trouvé');
    }

    if (!website.features?.services?.customServices) {
      throw new NotFoundException('Aucun service trouvé');
    }

    const initialLength = website.features.services.customServices.length;
    website.features.services.customServices = website.features.services.customServices.filter(
      (s: any) => s.id !== serviceId,
    );

    if (website.features.services.customServices.length === initialLength) {
      throw new NotFoundException('Service non trouvé');
    }

    await website.save();
    this.logger.log(`Service ${serviceId} supprimé pour ${website.slug}`);
    
    return { message: 'Service supprimé avec succès' };
  }

  /**
   * Récupérer les services personnalisés
   */
  async getCustomServices(tenantId: string) {
    const website = await this.websiteModel.findOne({ tenantId });
    if (!website) {
      throw new NotFoundException('Site web non trouvé');
    }

    return website.features?.services?.customServices || [];
  }

  /**
   * Enregistrer un panier abandonné depuis la boutique publique
   */
  async savePublicAbandonedCart(tenantId: string, slug: string, data: SaveAbandonedCartDto) {
    return this.cartAbandonment.recordPublicAbandonedCart(tenantId, slug, {
      sessionId: data.sessionId,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      customerEmail: data.customerEmail,
      items: (data.items || []).map((i) => ({
        productId: i.productId,
        productName: i.title || 'Produit',
        quantity: i.quantity,
        price: i.price,
        image: i.image,
      })),
      totalAmount: data.total,
    });
  }

  /**
   * Vérifier l'OTP pour une commande publique
   */
  async verifyPublicOrderOtp(orderId: string, code: string, tenantId: string) {
    return this.ordersService.verifyOtp(orderId, code, tenantId);
  }
}

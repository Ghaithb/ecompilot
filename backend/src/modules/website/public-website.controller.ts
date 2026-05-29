import { Controller, Get, Post, Body, Param, HttpException, HttpStatus } from '@nestjs/common';
import { WebsiteService } from './website.service';
import { ProductsService } from '../products/products.service';
import { CreatePublicOrderDto, ContactMessageDto, CreateBookingDto, NewsletterSubscribeDto, SaveAbandonedCartDto } from './dto/public-website.dto';
import { TUNISIA_GOVERNORATES } from '../../common/data/tunisia-locations';

@Controller('public/website')
export class PublicWebsiteController {
  constructor(
    private readonly websiteService: WebsiteService,
    private readonly productsService: ProductsService,
  ) {}

  @Get('locations/tunisia')
  getTunisiaLocations() {
    return { governorates: TUNISIA_GOVERNORATES };
  }

  /**
   * Afficher le site complet par slug
   */
  @Get(':slug')
  async viewWebsite(@Param('slug') slug: string) {
    const website = await this.websiteService.findBySlug(slug);
    const homePage = await this.websiteService.getHomePage(website._id.toString());

    if (!homePage) {
      throw new HttpException('Page d\'accueil non trouvée', HttpStatus.NOT_FOUND);
    }

    const html =
      homePage.html ||
      (homePage as any).content?.html ||
      '<html><body><p>Boutique en cours de configuration.</p></body></html>';
    const css = homePage.css || (homePage as any).content?.css || '';

    return {
      success: true,
      website: {
        name: website.name,
        slug: website.slug,
        theme: website.theme,
        subdomain: `${slug}.ecompilot`,
      },
      page: {
        html,
        css,
        seo: homePage.seo,
      },
    };
  }

  /**
   * Récupérer les produits d'un site par son slug
   * Endpoint public: GET /api/v1/public/website/:slug/products
   */
  @Get(':slug/products')
  async getProducts(@Param('slug') slug: string) {
    try {
      // Trouver le site par slug
      const website = await this.websiteService.findBySlug(slug);
      
      if (!website) {
        throw new HttpException('Site non trouvé', HttpStatus.NOT_FOUND);
      }

      // Récupérer les produits actifs du tenant
      const products = await this.productsService.findByTenant(
        website.tenantId?.toString?.() || String(website.tenantId),
      );

      // Formater les produits pour l'API publique
      const formattedProducts = products
        .filter(p => p.status === 'active' && p.variants?.length > 0)
        .map(product => ({
          id: (product as any)._id.toString(),
          title: product.title,
          description: product.description,
          category: product.category || 'Non catégorisé',
          price: product.variants[0]?.price || 0,
          image: product.images[0] || '',
          images: product.images,
          inStock: (product.variants[0]?.inventory || 0) > 0,
          sku: product.variants[0]?.sku || '',
        }));

      return {
        success: true,
        count: formattedProducts.length,
        products: formattedProducts,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Erreur lors de la récupération des produits',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Méthodes de paiement disponibles pour un site public
   * GET /api/v1/public/website/:slug/payment-methods
   */
  @Get(':slug/payment-methods')
  async getPaymentMethods(@Param('slug') slug: string) {
    const website = await this.websiteService.findBySlug(slug);
    if (!website) {
      throw new HttpException('Site non trouvé', HttpStatus.NOT_FOUND);
    }
    return this.websiteService.getPublicPaymentMethods(website.tenantId);
  }

  @Post(':slug/abandoned-cart')
  async saveAbandonedCart(
    @Param('slug') slug: string,
    @Body() data: SaveAbandonedCartDto,
  ) {
    const website = await this.websiteService.findBySlug(slug);
    if (!website) {
      throw new HttpException('Site non trouvé', HttpStatus.NOT_FOUND);
    }
    const cart = await this.websiteService.savePublicAbandonedCart(
      website.tenantId.toString(),
      slug,
      data,
    );
    return { success: true, ...(cart as { mvp?: boolean }) };
  }

  /**
   * Créer une commande depuis le site public
   */
  @Post(':slug/orders')
  async createOrder(
    @Param('slug') slug: string,
    @Body() orderData: CreatePublicOrderDto,
  ) {
    try {
      // Trouver le site
      const website = await this.websiteService.findBySlug(slug);
      
      if (!website) {
        throw new HttpException('Site non trouvé', HttpStatus.NOT_FOUND);
      }

      // Créer la commande
      const order = await this.websiteService.createPublicOrder(
        website.tenantId,
        orderData,
        slug,
      );

      const orderId = (order as any)._id?.toString?.() || (order as any).id;
      const paymentMethod = (order as any).paymentMethod;
      const paymentUrl = (order as any).paymentUrl;

      return {
        success: true,
        orderId,
        paymentUrl,
        message: paymentMethod === 'cod'
          ? 'Commande reçue! Un code de vérification vous a été envoyé par SMS.'
          : paymentUrl
            ? 'Redirection vers le paiement en cours...'
            : 'Commande reçue avec succès! Vous recevrez un email de confirmation.',
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Erreur lors de la création de la commande',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Vérifier l'OTP pour une commande publique
   * Endpoint public: POST /api/v1/public/website/:slug/orders/verify-otp
   */
  @Post(':slug/orders/verify-otp')
  async verifyOtp(
    @Param('slug') slug: string,
    @Body() data: { orderId: string, code: string },
  ) {
    try {
      const website = await this.websiteService.findBySlug(slug);
      if (!website) {
        throw new HttpException('Site non trouvé', HttpStatus.NOT_FOUND);
      }

      // Utiliser OrdersService pour vérifier l'OTP
      // On passe null pour tenantId ici car le service de vérification peut le récupérer depuis l'ordre
      // ou on peut le passer pour plus de sécurité si on veut vérifier que l'ordre appartient au site
      await this.websiteService.verifyPublicOrderOtp(data.orderId, data.code, website.tenantId.toString());

      return {
        success: true,
        message: 'Commande vérifiée avec succès!',
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Erreur lors de la vérification du code',
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Envoyer un message de contact
   * Endpoint public: POST /api/v1/public/website/:slug/contact
   */
  @Post(':slug/contact')
  async sendContact(
    @Param('slug') slug: string,
    @Body() contactData: ContactMessageDto,
  ) {
    try {
      const website = await this.websiteService.findBySlug(slug);
      
      if (!website) {
        throw new HttpException('Site non trouvé', HttpStatus.NOT_FOUND);
      }

      await this.websiteService.handleContactMessage(
        website.tenantId,
        contactData,
      );

      return {
        success: true,
        message: 'Message envoyé avec succès! Nous vous répondrons dans les plus brefs délais.',
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Erreur lors de l\'envoi du message',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Créer une réservation
   * Endpoint public: POST /api/v1/public/website/:slug/bookings
   */
  @Post(':slug/bookings')
  async createBooking(
    @Param('slug') slug: string,
    @Body() bookingData: CreateBookingDto,
  ) {
    try {
      const website = await this.websiteService.findBySlug(slug);
      
      if (!website) {
        throw new HttpException('Site non trouvé', HttpStatus.NOT_FOUND);
      }

      const booking = await this.websiteService.createBooking(
        website.tenantId,
        bookingData,
      );

      return {
        success: true,
        bookingId: booking._id.toString(),
        message: 'Réservation confirmée! Vous recevrez un email de confirmation.',
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Erreur lors de la réservation',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * S'inscrire à la newsletter
   * Endpoint public: POST /api/v1/public/website/:slug/newsletter
   */
  @Post(':slug/newsletter')
  async subscribe(
    @Param('slug') slug: string,
    @Body() data: NewsletterSubscribeDto,
  ) {
    try {
      const website = await this.websiteService.findBySlug(slug);
      
      if (!website) {
        throw new HttpException('Site non trouvé', HttpStatus.NOT_FOUND);
      }

      await this.websiteService.subscribeNewsletter(
        website.tenantId,
        data,
      );

      return {
        success: true,
        message: 'Inscription réussie! Merci de vous être inscrit à notre newsletter.',
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Erreur lors de l\'inscription',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Vérifier la disponibilité pour une réservation
   * Endpoint public: GET /api/v1/public/website/:slug/availability
   */
  @Get(':slug/availability')
  async checkAvailability(
    @Param('slug') slug: string,
    @Param('date') date: string,
    @Param('time') time: string,
  ) {
    try {
      const website = await this.websiteService.findBySlug(slug);
      
      if (!website) {
        throw new HttpException('Site non trouvé', HttpStatus.NOT_FOUND);
      }

      const available = await this.websiteService.checkAvailability(
        website.tenantId,
        date,
        time,
      );

      return {
        success: true,
        available,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Erreur lors de la vérification',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

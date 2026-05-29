import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { WebsiteService } from './website.service';
import { PageService } from './page.service';

@ApiTags('public-store')
@Controller('store')
export class PublicStoreController {
  constructor(
    private readonly websiteService: WebsiteService,
    private readonly pageService: PageService,
  ) {}

  @Get(':slug')
  @ApiOperation({ summary: 'Afficher le site public par slug', description: 'Récupère le site web public et sa page d\'accueil' })
  @ApiResponse({ status: 200, description: 'Site web public récupéré' })
  @ApiResponse({ status: 404, description: 'Site web non trouvé' })
  async getPublicStore(@Param('slug') slug: string) {
    // Récupérer le site par slug
    const website = await this.websiteService.findBySlug(slug);
    
    if (!website) {
      throw new NotFoundException('Site web non trouvé');
    }

    // Vérifier que le site est publié
    if (!website.published) {
      throw new NotFoundException('Site web non publié');
    }

    // Récupérer la page d'accueil
    const homePage: any = await this.pageService.findHomePageById(website._id.toString());
    
    if (!homePage) {
      throw new NotFoundException('Page d\'accueil non trouvée');
    }

    return {
      website: {
        _id: website._id,
        name: website.name,
        slug: website.slug,
        theme: website.theme,
        seo: website.seo,
      },
      page: {
        _id: homePage._id,
        name: homePage.name,
        slug: homePage.slug,
        html: homePage.html || (homePage as any).content?.html || '',
        css: homePage.css || (homePage as any).content?.css || '',
        seo: homePage.seo,
      },
    };
  }

  @Get(':slug/:pageSlug')
  @ApiOperation({ summary: 'Afficher une page spécifique du site public', description: 'Récupère une page spécifique d\'un site web public' })
  @ApiResponse({ status: 200, description: 'Page récupérée' })
  @ApiResponse({ status: 404, description: 'Page non trouvée' })
  async getPublicPage(
    @Param('slug') slug: string,
    @Param('pageSlug') pageSlug: string,
  ) {
    // Récupérer le site par slug
    const website = await this.websiteService.findBySlug(slug);
    
    if (!website) {
      throw new NotFoundException('Site web non trouvé');
    }

    if (!website.published) {
      throw new NotFoundException('Site web non publié');
    }

    // Récupérer la page par slug
    const page: any = await this.pageService.findBySlugAndWebsiteId(website._id.toString(), pageSlug);
    
    if (!page) {
      throw new NotFoundException('Page non trouvée');
    }

    if (!page.published) {
      throw new NotFoundException('Page non publiée');
    }

    return {
      website: {
        _id: website._id,
        name: website.name,
        slug: website.slug,
        theme: website.theme,
        seo: website.seo,
      },
      page: {
        _id: page._id,
        name: page.name,
        slug: page.slug,
        html: page.html,
        css: page.css,
        seo: page.seo,
      },
    };
  }
}

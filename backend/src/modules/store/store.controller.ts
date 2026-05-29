import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';

@ApiTags('store')
@Controller('store')
export class StoreController {
  @Get(':slug')
  @ApiOperation({ summary: 'Get public store by slug' })
  @ApiParam({ name: 'slug', description: 'Store slug' })
  async getStoreBySlug(@Param('slug') slug: string) {
    // Pour l'instant, retourner des données mockées
    // TODO: Implémenter la récupération depuis la base de données
    
    if (!slug) {
      throw new NotFoundException('Store not found');
    }

    return {
      slug,
      name: 'Ma Boutique',
      description: 'Bienvenue dans ma boutique en ligne',
      logo: null,
      theme: {
        primaryColor: '#3b82f6',
        secondaryColor: '#10b981',
      },
      pages: [
        {
          slug: 'home',
          title: 'Accueil',
          content: '<h1>Bienvenue</h1>',
        },
      ],
      products: [],
      settings: {
        currency: 'EUR',
        language: 'fr',
      },
    };
  }

  @Get(':slug/:pageSlug')
  @ApiOperation({ summary: 'Get public store page by slug' })
  @ApiParam({ name: 'slug', description: 'Store slug' })
  @ApiParam({ name: 'pageSlug', description: 'Page slug' })
  async getStorePage(
    @Param('slug') slug: string,
    @Param('pageSlug') pageSlug: string,
  ) {
    if (!slug || !pageSlug) {
      throw new NotFoundException('Page not found');
    }

    return {
      slug: pageSlug,
      title: 'Page',
      content: '<p>Contenu de la page</p>',
      metadata: {
        description: 'Description de la page',
        keywords: [],
      },
    };
  }
}

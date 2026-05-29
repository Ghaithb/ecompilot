import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { TenantId } from '../../common/decorators/tenant.decorator';

@ApiTags('search')
@ApiBearerAuth()
@Controller('search')
@UseGuards(JwtAuthGuard, TenantGuard)
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({ 
    summary: 'Recherche globale', 
    description: 'Recherche dans les produits, commandes et clients' 
  })
  @ApiQuery({ name: 'q', required: true, description: 'Terme de recherche' })
  @ApiQuery({ 
    name: 'type', 
    required: false, 
    enum: ['products', 'orders', 'customers'], 
    description: 'Type de résultat à filtrer' 
  })
  @ApiResponse({ status: 200, description: 'Résultats de recherche' })
  async globalSearch(
    @TenantId() tenantId: string,
    @Query('q') query: string,
    @Query('type') type?: string,
  ) {
    return this.searchService.globalSearch(tenantId, query, type);
  }

  @Get('products')
  @ApiOperation({ summary: 'Rechercher des produits' })
  @ApiQuery({ name: 'q', required: true, description: 'Terme de recherche' })
  @ApiResponse({ status: 200, description: 'Produits trouvés' })
  async searchProducts(
    @TenantId() tenantId: string,
    @Query('q') query: string,
  ) {
    return this.searchService.searchProducts(tenantId, query);
  }

  @Get('orders')
  @ApiOperation({ summary: 'Rechercher des commandes' })
  @ApiQuery({ name: 'q', required: true, description: 'Terme de recherche' })
  @ApiResponse({ status: 200, description: 'Commandes trouvées' })
  async searchOrders(
    @TenantId() tenantId: string,
    @Query('q') query: string,
  ) {
    return this.searchService.searchOrders(tenantId, query);
  }
}

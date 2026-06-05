import { Controller, Get, Post, Body, UseGuards, Query } from '@nestjs/common';
import { WinningProductsService } from './winning-products.service';
import { ScrapingService } from './scraping.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';

@Controller('market-intelligence')
@UseGuards(JwtAuthGuard, TenantGuard)
export class MarketIntelligenceController {
  constructor(
    private readonly winningProductsService: WinningProductsService,
    private readonly scraper: ScrapingService,
  ) {}

  @Get('dashboard')
  async getDashboard() {
    return this.winningProductsService.getDashboard();
  }

  @Get('top-products')
  async getTopProducts() {
    return this.winningProductsService.getDashboard().then(d => d.topProducts);
  }

  @Post('scrape')
  async scrape(@Body('url') url: string) {
    return this.scraper.scrapeProduct(url);
  }
}

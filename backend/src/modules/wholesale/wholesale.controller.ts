import { Controller, Get, Post, Body, Param, Request, Query, UseGuards } from '@nestjs/common';
import { WholesaleService } from './wholesale.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';

@Controller('wholesale')
@UseGuards(JwtAuthGuard, TenantGuard)
export class WholesaleController {
  constructor(private readonly wholesaleService: WholesaleService) {}

  @Get('suppliers')
  async getSuppliers(@Query('category') category?: string, @Query('city') city?: string) {
    return this.wholesaleService.listSuppliers({ category, city });
  }

  @Get('suppliers/:id')
  async getSupplier(@Param('id') id: string) {
    return this.wholesaleService.getSupplierDetails(id);
  }

  @Get('products')
  async getProducts(@Query('category') category?: string) {
    return this.wholesaleService.listWholesaleProducts({ category });
  }

  @Get('search-product')
  async searchProductLink(@Query('title') title: string) {
    return this.wholesaleService.findSuppliersByProductTitle(title);
  }

  @Post('rfq')
  async submitRFQ(@Body() body: any, @Request() req: any) {
    const tenantId = req.user.tenantId;
    return this.wholesaleService.submitRFQ(tenantId, body);
  }

  @Post('products/:id/launch')
  async launchProduct(@Param('id') id: string, @Request() req: any) {
    const tenantId = req.user.tenantId;
    return this.wholesaleService.launchProduct(tenantId, id);
  }
}

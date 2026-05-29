import {
  Controller,
  Post,
  Get,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Res,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { Response } from 'express';
import { ImportService } from './import.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { TenantId } from '../../common/decorators/tenant.decorator';

@ApiTags('import')
@ApiBearerAuth()
@Controller('import')
@UseGuards(JwtAuthGuard, TenantGuard)
export class ImportController {
  constructor(private readonly importService: ImportService) {}

  @Post('products')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Importer des produits',
    description: 'Importe des produits depuis un fichier CSV ou JSON',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Import réussi' })
  @ApiResponse({ status: 400, description: 'Fichier invalide' })
  async importProducts(
    @TenantId() tenantId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Aucun fichier fourni');
    }

    return this.importService.importProducts(tenantId, file);
  }

  @Post('orders')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Importer des commandes',
    description: 'Importe des commandes depuis un fichier CSV ou JSON',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Import réussi' })
  @ApiResponse({ status: 400, description: 'Fichier invalide' })
  async importOrders(
    @TenantId() tenantId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Aucun fichier fourni');
    }

    return this.importService.importOrders(tenantId, file);
  }

  @Get('templates/products')
  @ApiOperation({
    summary: 'Template CSV produits',
    description: 'Télécharge un template CSV pour l\'import de produits',
  })
  @ApiResponse({ status: 200, description: 'Template téléchargé' })
  async getProductTemplate(@Res() res: Response) {
    const template = this.importService.getProductTemplate();
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="template_products.csv"');
    return res.send(template);
  }

  @Get('templates/orders')
  @ApiOperation({
    summary: 'Template CSV commandes',
    description: 'Télécharge un template CSV pour l\'import de commandes',
  })
  @ApiResponse({ status: 200, description: 'Template téléchargé' })
  async getOrderTemplate(@Res() res: Response) {
    const template = this.importService.getOrderTemplate();
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="template_orders.csv"');
    return res.send(template);
  }
}

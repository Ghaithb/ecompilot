import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody } from '@nestjs/swagger';

@ApiTags('orders')
@ApiBearerAuth()
@Controller('orders')
@UseGuards(JwtAuthGuard, TenantGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Créer une commande', description: 'Crée une nouvelle commande pour le tenant' })
  @ApiResponse({ status: 201, description: 'Commande créée avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiBody({ schema: { properties: { /* Ajoutez le schéma de la commande ici */ } } })
  create(@Body() createOrderDto: any, @TenantId() tenantId: string) {
    return this.ordersService.create(createOrderDto, tenantId);
  }

  @Get()
  @ApiOperation({ summary: 'Lister les commandes', description: 'Récupère toutes les commandes du tenant' })
  @ApiResponse({ status: 200, description: 'Liste des commandes récupérée' })
  findAll(@TenantId() tenantId: string) {
    return this.ordersService.findAll(tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détail d’une commande', description: 'Récupère une commande par son ID' })
  @ApiResponse({ status: 200, description: 'Commande trouvée' })
  @ApiResponse({ status: 404, description: 'Commande non trouvée' })
  @ApiParam({ name: 'id', description: 'ID de la commande' })
  findOne(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.ordersService.findOne(id, tenantId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour une commande', description: 'Met à jour une commande existante' })
  @ApiResponse({ status: 200, description: 'Commande mise à jour' })
  @ApiParam({ name: 'id', description: 'ID de la commande' })
  update(@Param('id') id: string, @Body() updateOrderDto: any, @TenantId() tenantId: string) {
    return this.ordersService.update(id, updateOrderDto, tenantId);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Changer le statut', description: 'Met à jour uniquement le statut de la commande' })
  @ApiParam({ name: 'id', description: 'ID de la commande' })
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @TenantId() tenantId: string,
  ) {
    return this.ordersService.updateStatus(id, status, tenantId);
  }

  @Patch(':id/payment')
  @ApiOperation({ summary: 'Changer le statut de paiement', description: 'Met à jour uniquement le statut de paiement' })
  @ApiParam({ name: 'id', description: 'ID de la commande' })
  updatePaymentStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @TenantId() tenantId: string,
  ) {
    return this.ordersService.updatePaymentStatus(id, status, tenantId);
  }

  @Post(':id/verify-otp')
  @ApiOperation({ summary: 'Vérifier l’OTP', description: 'Vérifie le code OTP pour valider une commande COD' })
  @ApiParam({ name: 'id', description: 'ID de la commande' })
  @ApiBody({ schema: { properties: { code: { type: 'string' } } } })
  verifyOtp(
    @Param('id') id: string,
    @Body('code') code: string,
    @TenantId() tenantId: string,
  ) {
    return this.ordersService.verifyOtp(id, code, tenantId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une commande', description: 'Supprime une commande par son ID' })
  @ApiParam({ name: 'id', description: 'ID de la commande' })
  remove(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.ordersService.remove(id, tenantId);
  }
}
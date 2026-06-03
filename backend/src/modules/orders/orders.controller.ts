import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { ReturnsService } from './returns.service';
import { OrderStatusService } from './order-status.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CodStatusGuard } from '../../common/guards/cod-status.guard';
import { CodProtected } from '../../common/decorators/cod-protected.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { AppRole } from '../../common/enums/app-role.enum';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { AssignDriverDto } from './dto/update-order-status.dto';
import { PaginationPipe } from '../../common/pipes/pagination.pipe';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody } from '@nestjs/swagger';

@ApiTags('orders')
@ApiBearerAuth()
@Controller('orders')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Roles(AppRole.MERCHANT, AppRole.ADMIN, AppRole.SUPER_ADMIN, 'user')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly returnsService: ReturnsService,
    private readonly orderStatusService: OrderStatusService,
  ) {}

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
  findAll(@TenantId() tenantId: string, @Query(PaginationPipe) _pagination: any) {
    return this.ordersService.findAll(tenantId);
  }

  @Get('returns/list')
  @ApiOperation({ summary: 'Commandes en retour / refus' })
  findReturns(@TenantId() tenantId: string) {
    return this.ordersService.findReturns(tenantId);
  }

  @Get('returns/stats')
  @ApiOperation({ summary: 'Statistiques retours' })
  returnsStats(@TenantId() tenantId: string) {
    return this.ordersService.getReturnsStats(tenantId);
  }

  @Get('workflow/summary')
  @ApiOperation({ summary: 'Workflow commande complet', description: 'Pipeline statuts, actions urgentes et queues operationnelles' })
  workflowSummary(@TenantId() tenantId: string) {
    return this.ordersService.getWorkflowSummary(tenantId);
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
  @UseGuards(CodStatusGuard)
  @CodProtected()
  @ApiOperation({ summary: 'Changer le statut', description: 'Met à jour uniquement le statut de la commande' })
  @ApiParam({ name: 'id', description: 'ID de la commande' })
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @TenantId() tenantId: string,
    @CurrentUser() user: { roles?: string[]; _id?: string },
  ) {
    return this.ordersService.updateStatus(
      id,
      status,
      tenantId,
      user?.roles || [],
      user?._id?.toString?.() || 'merchant',
    );
  }

  @Get(':id/next-statuses')
  @ApiOperation({ summary: 'Statuts suivants possibles' })
  nextStatuses(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.ordersService.findOne(id, tenantId).then((order) => {
      if (!order) return { next: [] };
      return { current: order.status, next: this.orderStatusService.listNextStatuses(order.status) };
    });
  }

  @Patch(':id/assign-driver')
  @ApiOperation({ summary: 'Assigner un livreur' })
  assignDriver(
    @Param('id') id: string,
    @Body() dto: AssignDriverDto,
    @TenantId() tenantId: string,
    @CurrentUser() user: { roles?: string[] },
  ) {
    return this.ordersService.assignDriver(id, tenantId, dto.driverId, user?.roles || []);
  }

  @Patch(':id/return/complete')
  @ApiOperation({ summary: 'Clôturer un retour produit' })
  completeReturn(
    @Param('id') id: string,
    @Body() body: { decision: 'completed' | 'rejected'; notes?: string },
    @TenantId() tenantId: string,
    @CurrentUser() user: { _id?: string },
  ) {
    return this.returnsService.completeReturn(
      id,
      tenantId,
      user?._id?.toString() || 'merchant',
      body.decision,
      body.notes,
    );
  }

  @Patch(':id/payment')
  @UseGuards(CodStatusGuard)
  @CodProtected()
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

import { Injectable } from '@nestjs/common';
import { OrdersRepository } from '../infrastructure/orders.repository';
import { TenantContextService } from '../../../core/tenant/tenant-context.service';

/**
 * Couche application — lectures commandes (use cases simples).
 * La logique complexe (création, statuts, WhatsApp) reste dans OrdersService.
 */
@Injectable()
export class OrdersQueryService {
  constructor(
    private readonly repo: OrdersRepository,
    private readonly tenantContext: TenantContextService,
  ) {}

  listForCurrentTenant(req: { user?: any; tenantContext?: any }) {
    const ctx = this.tenantContext.fromRequest(req);
    return this.repo.findAllForTenant(ctx.tenantId);
  }

  getById(tenantId: string, orderId: string) {
    return this.repo.findOneByTenant(tenantId, orderId);
  }

  listReturns(tenantId: string) {
    return this.repo.findReturnsForTenant(tenantId);
  }
}

import { ForbiddenException, Injectable } from '@nestjs/common';
import { TenantContext } from './tenant-context.interface';

@Injectable()
export class TenantContextService {
  /**
   * Extrait le contexte depuis la requête (rempli par TenantGuard).
   */
  fromRequest(req: { user?: any; tenantContext?: TenantContext }): TenantContext {
    if (req.tenantContext?.tenantId) {
      return req.tenantContext;
    }
    const user = req.user;
    if (!user?.tenantId) {
      throw new ForbiddenException('Contexte tenant manquant');
    }
    const tenantId =
      typeof user.tenantId === 'object'
        ? String(user.tenantId._id || user.tenantId.id)
        : String(user.tenantId);

    return {
      tenantId,
      userId: user._id?.toString?.() || user.id,
      roles: user.roles || [],
    };
  }

  assertSameTenant(ctx: TenantContext, resourceTenantId: string) {
    if (String(resourceTenantId) !== ctx.tenantId) {
      throw new ForbiddenException('Accès inter-tenant refusé');
    }
  }
}

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const COD_PROTECTED_KEY = 'cod_status_protected';

/**
 * Guard SEC-03: Only admin or system can set order status to 'paid'.
 * Apply @CodProtected() on the order status update endpoint.
 */
@Injectable()
export class CodStatusGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isProtected = this.reflector.getAllAndOverride<boolean>(
      COD_PROTECTED_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!isProtected) return true;

    const request = context.switchToHttp().getRequest();
    const body = request.body;
    const user = request.user;

    // If trying to set status to 'paid', only admin or system can do it
    if (body?.status === 'paid' || body?.status === 'PAID') {
      const roles: string[] = user?.roles || [];
      const canMarkPaid = roles.includes('admin') || roles.includes('system');
      if (!canMarkPaid) {
        throw new ForbiddenException(
          'Seul un administrateur peut marquer une commande comme payée',
        );
      }
    }

    return true;
  }
}

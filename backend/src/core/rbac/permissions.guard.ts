import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from './require-permission.decorator';
import { hasPermission, PermissionKey } from './permissions';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<PermissionKey[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!required?.length) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user?.roles?.length) {
      throw new ForbiddenException('Permissions insuffisantes');
    }

    const ok = required.every((p) => hasPermission(user.roles, p));
    if (!ok) {
      throw new ForbiddenException(`Permission requise: ${required.join(', ')}`);
    }
    return true;
  }
}

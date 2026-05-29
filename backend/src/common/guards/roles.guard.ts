import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { expandUserRoles } from '../enums/app-role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user || !Array.isArray(user.roles)) {
      throw new ForbiddenException('Accès refusé');
    }
    const expanded = expandUserRoles(user.roles);
    const hasRole = requiredRoles.some((role) => expanded.includes(role));
    if (!hasRole) {
      throw new ForbiddenException('Rôle insuffisant');
    }
    return true;
  }
}

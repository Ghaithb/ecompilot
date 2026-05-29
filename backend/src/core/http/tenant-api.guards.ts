import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PermissionsGuard } from '../rbac/permissions.guard';

/** Décorateur composite : API tenant sécurisée (JWT + tenant + rôles + permissions). */
export function TenantApiGuards(tag: string) {
  return applyDecorators(
    ApiTags(tag),
    ApiBearerAuth(),
    UseGuards(JwtAuthGuard, TenantGuard, RolesGuard, PermissionsGuard),
  );
}

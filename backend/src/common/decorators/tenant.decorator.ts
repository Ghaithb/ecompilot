import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentTenant = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.tenant;
  },
);

export const TenantId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const fromTenant = request.tenant?._id || request.tenant?.id;
    if (fromTenant) {
      return fromTenant.toString?.() || fromTenant;
    }
    const fromUser = request.user?.tenantId;
    if (fromUser) {
      return fromUser.toString?.() || fromUser;
    }
    return undefined;
  },
);


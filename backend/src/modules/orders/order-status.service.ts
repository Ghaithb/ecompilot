import { BadRequestException, Injectable } from '@nestjs/common';
import { OrderStatus, normalizeOrderStatus } from '../../common/enums/order-status.enum';
import { AppRole, expandUserRoles } from '../../common/enums/app-role.enum';

const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.CREATED]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
  [OrderStatus.CONFIRMED]: [OrderStatus.PREPARED, OrderStatus.CANCELLED],
  [OrderStatus.PREPARED]: [OrderStatus.SHIPPED, OrderStatus.ASSIGNED_TO_DRIVER, OrderStatus.CANCELLED],
  [OrderStatus.SHIPPED]: [OrderStatus.ASSIGNED_TO_DRIVER, OrderStatus.OUT_FOR_DELIVERY, OrderStatus.CANCELLED],
  [OrderStatus.ASSIGNED_TO_DRIVER]: [OrderStatus.OUT_FOR_DELIVERY, OrderStatus.CANCELLED],
  [OrderStatus.OUT_FOR_DELIVERY]: [
    OrderStatus.DELIVERED,
    OrderStatus.PAID,
    OrderStatus.REFUSED,
    OrderStatus.CANCELLED,
  ],
  [OrderStatus.DELIVERED]: [OrderStatus.PAID, OrderStatus.COMPLETED],
  [OrderStatus.PAID]: [OrderStatus.COMPLETED],
  [OrderStatus.COMPLETED]: [],
  [OrderStatus.REFUSED]: [OrderStatus.RETURNED_TO_SELLER],
  [OrderStatus.RETURNED_TO_SELLER]: [OrderStatus.RETURN_COMPLETED, OrderStatus.RETURN_REJECTED],
  [OrderStatus.RETURN_COMPLETED]: [],
  [OrderStatus.RETURN_REJECTED]: [],
  [OrderStatus.CANCELLED]: [],
};

/** Rôles autorisés par transition cible */
const ROLE_FOR_STATUS: Partial<Record<OrderStatus, AppRole[]>> = {
  [OrderStatus.CONFIRMED]: [AppRole.MERCHANT, AppRole.ADMIN],
  [OrderStatus.PREPARED]: [AppRole.MERCHANT, AppRole.ADMIN],
  [OrderStatus.SHIPPED]: [AppRole.MERCHANT, AppRole.ADMIN],
  [OrderStatus.ASSIGNED_TO_DRIVER]: [AppRole.MERCHANT, AppRole.ADMIN],
  [OrderStatus.OUT_FOR_DELIVERY]: [AppRole.DRIVER, AppRole.MERCHANT, AppRole.ADMIN],
  [OrderStatus.DELIVERED]: [AppRole.DRIVER, AppRole.MERCHANT, AppRole.ADMIN],
  [OrderStatus.PAID]: [AppRole.DRIVER, AppRole.MERCHANT, AppRole.ADMIN],
  [OrderStatus.COMPLETED]: [AppRole.MERCHANT, AppRole.ADMIN],
  [OrderStatus.REFUSED]: [AppRole.DRIVER, AppRole.MERCHANT, AppRole.ADMIN],
  [OrderStatus.RETURNED_TO_SELLER]: [AppRole.DRIVER, AppRole.MERCHANT, AppRole.ADMIN],
  [OrderStatus.RETURN_COMPLETED]: [AppRole.MERCHANT, AppRole.ADMIN],
  [OrderStatus.RETURN_REJECTED]: [AppRole.MERCHANT, AppRole.ADMIN],
  [OrderStatus.CANCELLED]: [AppRole.MERCHANT, AppRole.ADMIN],
};

@Injectable()
export class OrderStatusService {
  canTransition(fromRaw: string, toRaw: string): boolean {
    const from = normalizeOrderStatus(fromRaw);
    const to = normalizeOrderStatus(toRaw);
    return TRANSITIONS[from]?.includes(to) ?? false;
  }

  assertTransition(fromRaw: string, toRaw: string, actorRoles: string[] = []): OrderStatus {
    const from = normalizeOrderStatus(fromRaw);
    const to = normalizeOrderStatus(toRaw);

    if (!this.canTransition(fromRaw, toRaw)) {
      throw new BadRequestException(`Transition ${from} → ${to} non autorisée`);
    }

    const allowedRoles = ROLE_FOR_STATUS[to];
    if (allowedRoles?.length) {
      const expanded = expandUserRoles(actorRoles);
      const ok = allowedRoles.some((r) => expanded.includes(r));
      if (!ok) {
        throw new BadRequestException(`Rôle insuffisant pour passer au statut ${to}`);
      }
    }

    return to;
  }

  listNextStatuses(currentRaw: string): OrderStatus[] {
    const current = normalizeOrderStatus(currentRaw);
    return TRANSITIONS[current] || [];
  }
}

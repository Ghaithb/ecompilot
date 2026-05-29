export type TenantId = string;

export interface AuditableEntity {
  tenantId: TenantId;
  createdAt?: Date;
  updatedAt?: Date;
}

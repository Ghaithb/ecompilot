import { PrismaClient } from '@prisma/client';

/** Execute Prisma queries scoped to a tenant (RLS via session variable). */
export async function withTenantPrisma<T>(
  tenantId: string,
  fn: (prisma: PrismaClient) => Promise<T>,
): Promise<T> {
  const prisma = new PrismaClient();
  try {
    await prisma.$executeRawUnsafe(`SELECT set_config('app.tenant_id', $1, true)`, tenantId);
    return await fn(prisma);
  } finally {
    await prisma.$disconnect();
  }
}

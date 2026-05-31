import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(private readonly config: ConfigService) {
    super();
  }

  private rlsEnabled(): boolean {
    return this.config.get<string>('PRISMA_RLS_ENABLED') === 'true';
  }

  /** Set PostgreSQL session variable for RLS policies. */
  async setTenantScope(tenantId: string): Promise<void> {
    if (this.rlsEnabled()) {
      await this.$executeRawUnsafe(`SELECT set_config('app.tenant_id', $1, true)`, tenantId);
    }
  }

  async withTenantScope<T>(tenantId: string, fn: () => Promise<T>): Promise<T> {
    await this.setTenantScope(tenantId);
    return fn();
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}

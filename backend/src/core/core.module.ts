import { Global, Module } from '@nestjs/common';
import { RealtimeService } from './stubs/realtime.stub';
import { TenantCoreModule } from './tenant/tenant.module';
import { RbacModule } from './rbac/rbac.module';

@Global()
@Module({
  imports: [TenantCoreModule, RbacModule],
  providers: [RealtimeService],
  exports: [RealtimeService, TenantCoreModule, RbacModule],
})
export class CoreModule {}

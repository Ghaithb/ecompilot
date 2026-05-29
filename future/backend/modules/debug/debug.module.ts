import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { DebugController } from './debug.controller';
import { DebugService } from './debug.service';
import { Tenant, TenantSchema } from '../tenants/schemas/tenant.schema';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: Tenant.name, schema: TenantSchema }
    ])
  ],
  controllers: [DebugController],
  providers: [DebugService],
  exports: [DebugService],
})
export class DebugModule {}
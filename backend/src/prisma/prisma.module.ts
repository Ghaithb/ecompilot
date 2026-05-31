import { Global, Module } from '@nestjs/common';
import { PrismaMirrorService } from './prisma-mirror.service';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService, PrismaMirrorService],
  exports: [PrismaService, PrismaMirrorService],
})
export class PrismaModule {}

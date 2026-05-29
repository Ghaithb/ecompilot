import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { OrdersModule } from '../orders/orders.module';
import { OrdersSaasController } from './orders-saas.controller';
import { OrdersSaasRepository } from './orders-saas.repository';
import { OrdersSaasService } from './orders-saas.service';

@Module({
  imports: [PrismaModule, OrdersModule],
  controllers: [OrdersSaasController],
  providers: [OrdersSaasRepository, OrdersSaasService],
  exports: [OrdersSaasService, OrdersSaasRepository],
})
export class OrdersSaasModule {}

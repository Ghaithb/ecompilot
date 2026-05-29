import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AppI18nModule } from './i18n/i18n.module';
import configuration from './config/configuration';
import { PrismaModule } from './prisma/prisma.module';
import { CoreModule } from './core/core.module';
import { CommerceModule } from './commerce/commerce.module';
import { IntegrationsModule } from './integrations/integrations.module';

/**
 * EcomPilot MVP — auth multi-tenant, commandes, livraison, boutique COD.
 * Modules hors scope : /future/backend/modules/
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      useFactory: (configService: ConfigService): JwtModuleOptions => ({
        secret: configService.get<string>('jwt.secret') || 'default-secret-key',
        signOptions: { expiresIn: '1h' },
      }),
      inject: [ConfigService],
    }),
    ThrottlerModule.forRoot([
      { name: 'short', ttl: 1000, limit: 3 },
      { name: 'medium', ttl: 10000, limit: 20 },
      { name: 'long', ttl: 60000, limit: 100 },
    ]),
    ScheduleModule.forRoot(),
    DatabaseModule,
    PrismaModule,
    CoreModule,
    CommerceModule,
    IntegrationsModule,
    AppI18nModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

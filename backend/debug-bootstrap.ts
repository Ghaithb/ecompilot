import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';

async function bootstrap() {
  console.log('Starting manual bootstrap check...');
  try {
    const app = await NestFactory.create(AppModule, { logger: ['error', 'warn', 'log', 'debug', 'verbose'] });
    console.log('App successfully created!');
    await app.init();
    console.log('App successfully initialized!');
    await app.close();
    process.exit(0);
  } catch (err) {
    console.error('CRITICAL BOOTSTRAP FAILURE:');
    console.error(err);
    process.exit(1);
  }
}

bootstrap();

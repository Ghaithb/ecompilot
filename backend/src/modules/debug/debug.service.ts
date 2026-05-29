import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DebugService {
  private readonly logger = new Logger('Debug');

  constructor(private readonly configService: ConfigService) {}

  logEnvironment() {
    this.logger.debug('🔍 Variables d\'environnement:');
    this.logger.debug(`PORT: ${this.configService.get('port')}`);
    this.logger.debug(`NODE_ENV: ${this.configService.get('nodeEnv')}`);
    this.logger.debug(`API_PREFIX: ${this.configService.get('apiPrefix')}`);
    this.logger.debug(`DATABASE_URI: ${this.configService.get('database.uri')}`);
    this.logger.debug(`JWT_SECRET configuré: ${this.configService.get('jwt.secret') ? 'Oui' : 'Non'}`);
    this.logger.debug(`JWT_EXPIRES_IN: ${this.configService.get('jwt.expiresIn')}`);
  }

  logRequest(req: any) {
    this.logger.debug({
      method: req.method,
      url: req.url,
      headers: {
        'user-agent': req.headers['user-agent'],
        'content-type': req.headers['content-type'],
        authorization: req.headers.authorization ? '✓ Present' : '✗ Missing',
      },
      body: req.body,
      query: req.query,
      params: req.params,
    });
  }

  logError(error: Error, context?: string) {
    this.logger.error({
      message: error.message,
      stack: error.stack,
      context,
    });
  }
}
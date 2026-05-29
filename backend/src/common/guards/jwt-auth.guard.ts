import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      // Don't log every request with missing token to avoid spam
      throw new UnauthorizedException('Token manquant');
    }

    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('jwt.secret'),
      });
      
    // Only log when in error/debugging scenarios to reduce noise
    // this.logger.debug(`Decoded payload for user ${payload.sub}`);
      
      request.user = {
        userId: payload.sub,
        email: payload.email,
        tenantId: payload.tenantId,
        roles: payload.roles,
      };
      
    // this.logger.debug(`Set user in request: ${request.user.userId}`);
      
      return true;
    } catch (error) {
      this.logger.error('Token verification error', error?.stack ?? error?.message ?? String(error));
      throw new UnauthorizedException('Token invalide');
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
// Formatting auto-fixed by ESLint/Prettier
}


import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {
    const jwtSecret = configService.get<string>('JWT_SECRET');
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined');
    }
    
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtSecret,
      ignoreExpiration: false,
    });
  }

  async validate(payload: JwtPayload) {
    const { sub: userId, tenantId, roles } = payload;
    
    const user = await this.userModel
      .findById(userId)
      .select('-password')
      .populate('tenantId', 'name status subscription');

    const tenant = user?.tenantId as any;
    if (!user || tenant?.status !== 'active') {
      throw new UnauthorizedException('Invalid token or inactive tenant');
    }

    return {
      _id: user._id,
      email: user.email,
      roles: roles,
      tenantId: tenantId,
      tenant: tenant,
    };
  }
}
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

export interface UserPayload {
  walletAddress: string;
  id: string;
  role:string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
      algorithms: ['HS256'],
    });
  }

  public async validate(payload): Promise<UserPayload> {
    return {
      // ...payload,
      walletAddress: payload.walletAddress.toLowerCase(),
      role: payload.role,
      id: payload.id,
    };
  }
}

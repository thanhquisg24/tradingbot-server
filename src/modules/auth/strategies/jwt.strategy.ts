import { ExtractJwt, Strategy } from 'passport-jwt';

import { AuthPayload } from '../interfaces/auth-payload.interface';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

@Injectable()
export class JsonWebTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'JWT_SECRET_KEY_BOT_12112',
    });
  }

  async validate(payload: AuthPayload) {
    return {
      name: payload.name,
      email: payload.email,
      id: payload.id,
      roles: payload.roles,
      telegramChatId: payload.telegramChatId,
    };
  }
}

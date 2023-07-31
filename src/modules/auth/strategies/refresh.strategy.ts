import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';

import { PassportStrategy } from '@nestjs/passport';
import { UserService } from 'src/modules/user/user.service';

@Injectable()
export class JwtRefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(private userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // ignoreExpiration: true,
      secretOrKey: 'JWT_SECRET_KEY_BOT_12112',
      passReqToCallback: true,
    });
  }

  async validate(req, payload: any) {
    const user = await this.userService.findOne(payload.id);
    if (!user) {
      throw new UnauthorizedException('Not found user!');
    }
    if (req.body.refresh_token != (await user).refreshtoken) {
      throw new UnauthorizedException('Refresh Token is not valid!');
    }
    if (new Date() > new Date((await user).refreshtokenexpires)) {
      throw new UnauthorizedException('Refresh token is expired!');
    }
    return { name: payload.name, email: payload.email, id: payload.id };
    // return { userId: payload.sub, username: payload.username };
  }
}

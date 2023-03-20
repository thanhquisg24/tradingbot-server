import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { UserEntity } from 'src/modules/user/entities/user.entity';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' });
    // ở đây mình đăng nhập bằng email và password nên mình phải thực hiện custom usernameField
  }

  async validate(email: string, password: string): Promise<UserEntity> {
    // return { email, password };
    const user = await this.authService.authentication(email, password);

    // this.logger.log('Doing something...', user);
    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}

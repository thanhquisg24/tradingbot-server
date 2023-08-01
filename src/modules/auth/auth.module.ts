import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JsonWebTokenStrategy } from './strategies/jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { JwtRefreshTokenStrategy } from './strategies/refresh.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../user/user.module';
import entities from 'src/config/typeorm.entities';

@Module({
  imports: [
    TypeOrmModule.forFeature(entities),
    PassportModule,
    JwtModule.register({
      secret: 'JWT_SECRET_KEY_BOT_12112',
      signOptions: { expiresIn: '180m' },
    }),
    UserModule,
  ],
  providers: [
    AuthService,
    LocalStrategy,
    JsonWebTokenStrategy,
    JwtRefreshTokenStrategy,
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}

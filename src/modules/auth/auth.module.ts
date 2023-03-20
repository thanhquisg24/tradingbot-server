import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JsonWebTokenStrategy } from './strategies/jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { JwtRefreshTokenStrategy } from './strategies/refresh.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ReceivedTokenScheduleEntity } from '../received_token_schedule/entities/received_token_schedule.entity';
import { ReceivedTokenScheduleService } from '../received_token_schedule/received_token_schedule.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../user/entities/user.entity';
import { UserModule } from '../user/user.module';
import { UserService } from '../user/user.service';
import { VestingAddressService } from '../vesting-address/vesting-address.service';
import { VesingHistoryService } from '../vesing-history/vesing-history.service';
import { VesingHistoryEntity } from '../vesing-history/entities/vesing-history.entity';
import { VestingAddressEntity } from '../vesting-address/entities/vesting-address.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      ReceivedTokenScheduleEntity,
      VesingHistoryEntity,
      VestingAddressEntity,
    ]),
    UserModule,
    PassportModule,
    JwtModule.register({
      secret: 'JWT_SECRET_KEY',
      signOptions: { expiresIn: '60m' },
    }),
  ],
  providers: [
    AuthService,
    UserService,
    ReceivedTokenScheduleService,
    VestingAddressService,
    VesingHistoryService,
    LocalStrategy,
    JsonWebTokenStrategy,
    JwtRefreshTokenStrategy,
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}

import { Module } from '@nestjs/common';
import { ReceivedTokenScheduleEntity } from '../received_token_schedule/entities/received_token_schedule.entity';
import { ReceivedTokenScheduleService } from '../received_token_schedule/received_token_schedule.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { UserEntity } from './entities/user.entity';
import { UserService } from './user.service';
import { UserTokenService } from './user.token.service';
import { VesingHistoryService } from '../vesing-history/vesing-history.service';
import { VestingAddressService } from '../vesting-address/vesting-address.service';
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
  ],
  controllers: [UserController],
  providers: [
    UserService,
    UserTokenService,
    ReceivedTokenScheduleService,
    VesingHistoryService,
    VestingAddressService,
  ],
})
export class UserModule {}

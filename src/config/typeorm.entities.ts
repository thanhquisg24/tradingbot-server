import { ReceivedTokenScheduleEntity } from '../modules/received_token_schedule/entities/received_token_schedule.entity';
import { TokenEntity } from '../modules/token/entities/token.entity';
import { UserEntity } from '../modules/user/entities/user.entity';
import { VesingHistoryEntity } from '../modules/vesing-history/entities/vesing-history.entity';
import { VestingAddressEntity } from '../modules/vesting-address/entities/vesting-address.entity';

const entities = [
  UserEntity,
  TokenEntity,
  VesingHistoryEntity,
  VestingAddressEntity,
  ReceivedTokenScheduleEntity,
];

export default entities;

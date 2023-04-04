import { CreateExchangePayload } from './create-exchange.payload';
import { UserEntity } from '../../entities/user.entity';

export class CreateExchangeDto extends CreateExchangePayload {
  user: UserEntity;
}

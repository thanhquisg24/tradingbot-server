import { CreateBotPayload } from './create-bot.payload';
import { UserEntity } from '../../entities/user.entity';

export class CreateBotDto extends CreateBotPayload {
  user: UserEntity;
}

import { ROLE } from 'src/common/constants';
import { UserEntity } from '../entities/user.entity';

export interface IUserLogged {
  access_token: string;
  refresh_token: string;
  email: string;
  userId: number;
  telegramChatId: string;
  roles: ROLE[];
}
export type RequestWithUser = Request & { user: UserEntity };

import { AutoMap } from '@automapper/classes';
import { ExchangesEnum } from '../entities/exchange.entity';
import { COMMON_STATUS } from 'src/common/constants';

export class ExchangeDTO {
  @AutoMap()
  id: number;

  @AutoMap()
  name: ExchangesEnum;

  @AutoMap()
  label: string;

  @AutoMap()
  apiKey: string;

  // @AutoMap()
  // apiSecret: string;

  @AutoMap()
  isTestNet: boolean;

  @AutoMap()
  status: COMMON_STATUS;

  @AutoMap()
  createdAt: Date;
}

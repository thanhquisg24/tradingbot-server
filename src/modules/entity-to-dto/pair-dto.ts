import { AutoMap } from '@automapper/classes';
import { ExchangesEnum } from '../entities/exchange.entity';
import { COMMON_STATUS } from 'src/common/constants';

export class PairDTO {
  @AutoMap()
  id: number;

  @AutoMap()
  fromExchange: ExchangesEnum;

  @AutoMap()
  commonPair: string;

  @AutoMap()
  exchangePair: string;

  @AutoMap()
  status: COMMON_STATUS;

  @AutoMap()
  createdAt: Date;
}

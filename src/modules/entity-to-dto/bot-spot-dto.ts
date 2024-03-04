import { BOT_SPOT_TYPE, DEAL_START_TYPE } from '../entities/enum-type';

import { AutoMap } from '@automapper/classes';
import { COMMON_STATUS } from 'src/common/constants';
import { ExchangeDTO } from './exchange-dto';

export class BotSpotBaseDTO {
  @AutoMap()
  id: number;

  @AutoMap()
  name: string;

  @AutoMap()
  botType: BOT_SPOT_TYPE;

  @AutoMap()
  userId: number;

  @AutoMap()
  status: COMMON_STATUS;

  // ASAP
  @AutoMap()
  dealStartCondition: DEAL_START_TYPE;

  @AutoMap()
  baseOrderSize: number;

  @AutoMap()
  targetProfitPercentage: number;

  @AutoMap()
  targetStopLossPercentage: number;

  @AutoMap()
  useStopLoss: boolean;

  @AutoMap()
  maxActiveDeal: number;

  @AutoMap()
  createdAt: Date;
}
export class BotSpotWithExchangeDTO extends BotSpotBaseDTO {
  @AutoMap(() => ExchangeDTO)
  exchange: ExchangeDTO;
}

import {
  BOT_TRADING_TYPE,
  DEAL_START_TYPE,
  STRATEGY_DIRECTION,
} from '../entities/bot.entity';

import { AutoMap } from '@automapper/classes';
import { COMMON_STATUS } from 'src/common/constants';
import { ExchangeDTO } from './exchange-dto';
import { PairDTO } from './pair-dto';

export class BotTradingBaseDTO {
  @AutoMap()
  id: number;

  @AutoMap()
  name: string;

  @AutoMap()
  botType: BOT_TRADING_TYPE;

  @AutoMap()
  strategyDirection: STRATEGY_DIRECTION;

  @AutoMap()
  userId: number;

  @AutoMap()
  status: COMMON_STATUS;

  @AutoMap()
  startOrderType: 'LIMIT' | 'MARKET';

  @AutoMap()
  leverage: number;

  @AutoMap()
  allowDealSamePair: boolean;

  // ASAP
  @AutoMap()
  dealStartCondition: DEAL_START_TYPE;

  @AutoMap()
  baseOrderSize: number;

  @AutoMap()
  safetyOrderSize: number;

  @AutoMap()
  targetProfitPercentage: number;

  @AutoMap()
  targetStopLossPercentage: number;

  @AutoMap()
  useStopLoss: boolean;

  @AutoMap()
  maxActiveDeal: number;

  @AutoMap()
  maxSafetyTradesCount: number;
  @AutoMap()
  maxActiveSafetyTradesCount: number;

  @AutoMap()
  reduceDeviationPercentage: number;

  @AutoMap()
  priceDeviationPercentage: number;

  @AutoMap()
  safetyOrderVolumeScale: number;

  @AutoMap()
  safetyOrderStepScale: number;

  @AutoMap(() => ExchangeDTO)
  exchange: ExchangeDTO;

  @AutoMap()
  maxReduceCount: number;

  @AutoMap()
  refBotId: number;

  @AutoMap()
  createdAt: Date;
}
export class BotTradingWithPairAndExchangeDTO extends BotTradingBaseDTO {
  @AutoMap(() => [PairDTO])
  pairs: PairDTO[];

  @AutoMap(() => ExchangeDTO)
  exchange: ExchangeDTO;
}

import { CLIENT_DEAL_TYPE, DEAL_STATUS } from '../entities/deal.entity';
import { DEAL_START_TYPE, STRATEGY_DIRECTION } from '../entities/bot.entity';

import { AutoMap } from '@automapper/classes';
import { OrderBaseDTO } from './order-dto';

export class DealBaseDTO {
  @AutoMap()
  id: number;

  @AutoMap()
  userId: number;

  @AutoMap()
  botId: number;

  @AutoMap()
  exchangeId: number;

  @AutoMap()
  clientDealType: CLIENT_DEAL_TYPE;

  @AutoMap()
  status: DEAL_STATUS;

  @AutoMap()
  startAt: Date;

  @AutoMap()
  endAt: Date;

  @AutoMap()
  profit: number;

  @AutoMap()
  pair: string;

  @AutoMap()
  refReduceDealId: number;

  @AutoMap()
  curAvgPrice: number;

  @AutoMap()
  curQuantity: number;

  @AutoMap()
  curReduceCount: number;

  @AutoMap()
  maxReduceCount: number;

  @AutoMap()
  baseOrderSize: number;

  @AutoMap()
  safetyOrderSize: number;

  @AutoMap()
  strategyDirection: STRATEGY_DIRECTION;

  @AutoMap()
  startOrderType: string;

  @AutoMap()
  dealStartCondition: DEAL_START_TYPE;

  @AutoMap()
  targetProfitPercentage: number;

  @AutoMap()
  useStopLoss: boolean;

  @AutoMap()
  targetStopLossPercentage: number;

  @AutoMap()
  curSafetyTradesCount: number;

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
}

export class DealWithOrderDTO extends DealBaseDTO {
  @AutoMap(() => [OrderBaseDTO])
  orders: OrderBaseDTO[];
}

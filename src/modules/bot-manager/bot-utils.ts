import { COMMON_STATUS } from 'src/common/constants';
import { BotTradingEntity } from '../entities/bot.entity';
import { ExchangeEntity } from '../entities/exchange.entity';
import { CreateBotPayload } from './dto/create-bot.payload';
import { PairEntity } from '../entities/pair.entity';

export function mappingNewBot(
  payload: CreateBotPayload,
  exchange: ExchangeEntity,
  pairs: PairEntity[],
) {
  const newBot = new BotTradingEntity();
  newBot.botType = payload.botType;
  newBot.dealStartCondition = payload.botType;
  newBot.exchange = exchange;
  newBot.id = null;
  newBot.maxActiveDeal = payload.maxActiveDeal;
  newBot.maxActiveSafetyTradesCount = payload.maxActiveSafetyTradesCount;
  newBot.maxSafetyTradesCount = payload.maxSafetyTradesCount;
  newBot.name = payload.botType;
  newBot.pairs = pairs;
  newBot.priceDeviationPercentage = payload.priceDeviationPercentage;
  newBot.safetyOrderStepScale = payload.safetyOrderStepScale;
  newBot.safetyOrderVolumeScale = payload.safetyOrderVolumeScale;
  newBot.status = COMMON_STATUS.DISABLED;
  newBot.strategyDirection = payload.strategyDirection;
  newBot.targetProfitPercentage = payload.targetProfitPercentage;
  newBot.targetStopLossPercentage = payload.targetStopLossPercentage;
  newBot.userId = payload.userId;
  return newBot;
}

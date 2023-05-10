import { COMMON_STATUS } from 'src/common/constants';
import { BotTradingEntity } from '../entities/bot.entity';
import { ExchangeEntity } from '../entities/exchange.entity';
import { CommonBotPayload, CreateBotPayload } from './dto/create-bot.payload';
import { PairEntity } from '../entities/pair.entity';

export function mappingNewBot(
  payload: CreateBotPayload,
  exchange: ExchangeEntity,
  pairs: PairEntity[],
) {
  let newBot = new BotTradingEntity();
  newBot = mappingBot(newBot, payload);
  newBot.botType = payload.botType;
  newBot.strategyDirection = payload.strategyDirection;
  newBot.exchange = exchange;
  newBot.id = null;
  newBot.pairs = pairs;
  newBot.status = COMMON_STATUS.DISABLED;
  return newBot;
}
export function mappingBot(bot: BotTradingEntity, payload: CommonBotPayload) {
  bot.dealStartCondition = payload.dealStartCondition;
  bot.baseOrderSize = payload.baseOrderSize;
  bot.safetyOrderSize = payload.safetyOrderSize;
  bot.maxActiveDeal = payload.maxActiveDeal;
  bot.maxActiveSafetyTradesCount = payload.maxActiveSafetyTradesCount;
  bot.maxSafetyTradesCount = payload.maxSafetyTradesCount;
  bot.name = payload.name;
  bot.priceDeviationPercentage = payload.priceDeviationPercentage;
  bot.reduceDeviationPercentage = payload.reduceDeviationPercentage;
  bot.safetyOrderStepScale = payload.safetyOrderStepScale;
  bot.safetyOrderVolumeScale = payload.safetyOrderVolumeScale;
  bot.targetProfitPercentage = payload.targetProfitPercentage;
  bot.targetStopLossPercentage = payload.targetStopLossPercentage;
  bot.userId = payload.userId;
  bot.useStopLoss = payload.useStopLoss;
  bot.leverage = payload.leverage;
  bot.maxReduceCount = payload.maxReduceCount;
  bot.refBotId = payload.refBotId;
  return bot;
}

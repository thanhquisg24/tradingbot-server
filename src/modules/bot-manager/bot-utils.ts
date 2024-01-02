import { CommonBotPayload, CreateBotPayload } from './dto/create-bot.payload';
import {
  CommonBotSpotPayload,
  CreateBotSpotPayload,
} from './dto/spot/create-bot-spot.payload';

import { BotSpotEntity } from '../entities/bot.spot.extity';
import { BotTradingEntity } from '../entities/bot.entity';
import { COMMON_STATUS } from 'src/common/constants';
import { ExchangeEntity } from '../entities/exchange.entity';
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
  bot.minFundingRateStart = payload.minFundingRateStart;
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

export function mappingBotSpot(
  bot: BotSpotEntity,
  payload: CommonBotSpotPayload,
) {
  bot.baseOrderSize = payload.baseOrderSize;
  bot.dealStartCondition = payload.dealStartCondition;
  bot.maxActiveDeal = null;
  bot.name = payload.name;
  bot.targetProfitPercentage = payload.targetProfitPercentage;
  bot.targetStopLossPercentage = payload.targetStopLossPercentage;
  bot.useStopLoss = payload.useStopLoss;
  bot.userId = payload.userId;
  return bot;
}
export function mappingNewBotSpot(
  payload: CreateBotSpotPayload,
  exchange: ExchangeEntity,
) {
  let newBot = new BotSpotEntity();
  newBot.baseOrderSize = payload.baseOrderSize;
  newBot.dealStartCondition = payload.dealStartCondition;
  newBot.maxActiveDeal = null;
  newBot.name = payload.name;
  newBot.targetProfitPercentage = payload.targetProfitPercentage;
  newBot.targetStopLossPercentage = payload.targetStopLossPercentage;
  newBot.useStopLoss = payload.useStopLoss;
  newBot.botType = payload.botType;
  newBot.userId = payload.userId;
  newBot.exchange = exchange;
  newBot.id = null;
  newBot.status = COMMON_STATUS.DISABLED;
  return newBot;
}

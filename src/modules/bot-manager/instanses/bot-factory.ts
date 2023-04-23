import { BotEventData } from 'src/common/event/reduce_events';
import {
  BOT_TRADING_TYPE,
  BotTradingEntity,
} from 'src/modules/entities/bot.entity';
import { DealEntity } from 'src/modules/entities/deal.entity';
import { OrderEntity } from 'src/modules/entities/order.entity';
import { TelegramService } from 'src/modules/telegram/telegram.service';
import { Repository } from 'typeorm';
import { DCABot } from './bot-dca';
import { ReduceBot } from './bot-reduce';
import { BaseBotTrading } from './bot-trading';

export class BotFactory {
  static createBot(
    config: BotTradingEntity,
    dealRepo: Repository<DealEntity>,
    orderRepo: Repository<OrderEntity>,
    telegramService: TelegramService,
    sendBotEvent: (eventPayload: BotEventData) => void,
  ) {
    switch (config.botType) {
      case BOT_TRADING_TYPE.DCA:
        return new DCABot(config, dealRepo, orderRepo, telegramService);
      case BOT_TRADING_TYPE.REDUCE:
        return new ReduceBot(
          config,
          dealRepo,
          orderRepo,
          telegramService,
          sendBotEvent,
        );
      default:
        throw new Error('Can not find exchange name :' + config.botType);
    }
  }
}

export class BotInstances {
  private static botInstances: Map<number, BaseBotTrading> = new Map();

  static has(botId: number) {
    return BotInstances.botInstances.has(botId);
  }

  static delete(id: number) {
    BotInstances.botInstances.delete(id);
  }

  static set(id: number, newBot: BaseBotTrading) {
    BotInstances.botInstances.set(id, newBot);
  }

  static getBotById(id: number) {
    if (BotInstances.botInstances.has(id)) {
      return BotInstances.botInstances.get(id);
    }
    return null;
  }
  static getAllInstances() {
    return BotInstances.botInstances;
  }
}

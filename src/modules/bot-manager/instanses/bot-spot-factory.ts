import {
  BOT_SPOT_TYPE,
  BotSpotEntity,
} from 'src/modules/entities/bot.spot.extity';

import { BotSpotBase } from './spot/bot-spot-base';
import { BotSpotInvest } from './spot/bot-spot-invest';
import { DealSpotEntity } from 'src/modules/entities/deal.spot.entity';
import { OrderSpotEntity } from 'src/modules/entities/order.spot.entity';
import { Repository } from 'typeorm';
import { TelegramService } from 'src/modules/telegram/telegram.service';

export class BotSpotFactory {
  static createBot(
    config: BotSpotEntity,
    dealRepo: Repository<DealSpotEntity>,
    orderRepo: Repository<OrderSpotEntity>,
    telegramService: TelegramService,
  ) {
    switch (config.botType) {
      case BOT_SPOT_TYPE.INVEST:
        return new BotSpotInvest(config, dealRepo, orderRepo, telegramService);

      default:
        throw new Error('Can not create BOT SPOT  :' + config.botType);
    }
  }
}

export class BotSpotInstances {
  private static instances: Map<number, BotSpotBase> = new Map();

  static has(botId: number) {
    return BotSpotInstances.instances.has(botId);
  }

  static delete(id: number) {
    BotSpotInstances.instances.delete(id);
  }

  static set(id: number, newBot: BotSpotBase) {
    BotSpotInstances.instances.set(id, newBot);
  }

  static getBotById(id: number) {
    if (BotSpotInstances.instances.has(id)) {
      return BotSpotInstances.instances.get(id);
    }
    return null;
  }
  static getAllInstances() {
    return BotSpotInstances.instances;
  }
}

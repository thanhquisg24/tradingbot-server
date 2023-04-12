import {
  BOT_TRADING_TYPE,
  BotTradingEntity,
} from 'src/modules/entities/bot.entity';
import { DealEntity } from 'src/modules/entities/deal.entity';
import { OrderEntity } from 'src/modules/entities/order.entity';
import { TelegramService } from 'src/modules/telegram/telegram.service';
import { Repository } from 'typeorm';
import { DCABot } from './bot-dca';

export class BotFactory {
  static createBot(
    config: BotTradingEntity,
    dealRepo: Repository<DealEntity>,
    orderRepo: Repository<OrderEntity>,
    telegramService: TelegramService,
  ) {
    switch (config.botType) {
      case BOT_TRADING_TYPE.DCA:
      case BOT_TRADING_TYPE.REDUCE:
        const newBot = new DCABot(config, dealRepo, orderRepo, telegramService);
        return newBot;
      default:
        throw new Error('Can not find exchange name :' + config.botType);
    }
  }
}

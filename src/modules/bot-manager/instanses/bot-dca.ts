import { DealEntity } from 'src/modules/entities/deal.entity';
import { BaseBotTrading } from './bot-trading';
import { OrderStatus } from 'binance-api-node';
import { TelegramService } from 'src/modules/telegram/telegram.service';
import { OrderEntity } from 'src/modules/entities/order.entity';
import { Repository } from 'typeorm';
import { BotTradingEntity } from 'src/modules/entities/bot.entity';

export class DCABot extends BaseBotTrading {
  constructor(
    config: BotTradingEntity,
    dealRepo: Repository<DealEntity>,
    orderRepo: Repository<OrderEntity>,
    telegramService: TelegramService,
  ) {
    super(config, dealRepo, orderRepo, telegramService);
  }
  async processExchangeDeal(deal: DealEntity) {
    const binanceUSDM = this._exchangeRemote.getCcxtExchange();
    // binanceUSDM.setSandboxMode(true);
    for (let i = 0; i < deal.orders.length; i++) {
      const order = deal.orders[i];
      if (
        order.status === OrderStatus.NEW ||
        order.status === OrderStatus.PARTIALLY_FILLED
      ) {
        // this.logger.debug(JSON.stringify(order));
        // this.logger.debug(JSON.stringify(binanceUSDM));
        const exchangeOrder = await binanceUSDM.fetchOrder(
          order.binanceOrderId,
          order.pair,
        );
        console.log(
          'order.binanceOrderId ' + JSON.stringify(exchangeOrder.info),
        );
        if (exchangeOrder.info) {
          await this.refreshDealOnOrderUpdate(deal, exchangeOrder.info);
        }
      }
    }
  }

  async processActivePosition(activeDeals: DealEntity[]) {
    try {
      for (let index = 0; index < activeDeals.length; index++) {
        const deal = activeDeals[index];
        await this.processExchangeDeal(deal);
      }
    } catch (ex) {
      return;
    }
  }
}

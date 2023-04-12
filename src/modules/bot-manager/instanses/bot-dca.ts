import { DealEntity } from 'src/modules/entities/deal.entity';
import { BaseBotTrading } from './bot-trading';
import { OrderStatus } from 'binance-api-node';

export class DCABot extends BaseBotTrading {
  async processExchangeDeal(deal: DealEntity) {
    const binanceUSDM = this._exchangeRemote.getCcxtExchange();
    for (let i = 0; i < deal.orders.length; i++) {
      const order = deal.orders[i];
      if (
        order.status === OrderStatus.NEW ||
        order.status === OrderStatus.PARTIALLY_FILLED
      ) {
        const exchangeOrder = await binanceUSDM.fetchOrder(
          order.binanceOrderId,
          order.pair,
        );
        if (exchangeOrder.info) {
          await this.refreshDealOnOrderUpdate(deal, exchangeOrder.info);
        }
      }
    }
  }

  async processActivePosition(activeDeals: DealEntity[]) {
    for (let index = 0; index < activeDeals.length; index++) {
      const deal = activeDeals[index];
      await this.processExchangeDeal(deal);
    }
  }
}

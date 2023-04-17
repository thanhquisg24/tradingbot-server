import { DealEntity } from 'src/modules/entities/deal.entity';
import { BaseBotTrading } from './bot-trading';
import { OrderStatus } from 'binance-api-node';
import { TelegramService } from 'src/modules/telegram/telegram.service';
import { OrderEntity } from 'src/modules/entities/order.entity';
import { Repository } from 'typeorm';
import { BotTradingEntity } from 'src/modules/entities/bot.entity';
import { wrapExReq } from 'src/modules/exchange/remote-api/exchange.helper';
import { botLogger } from 'src/common/bot-logger';

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
        const exchangeOrder = await wrapExReq(
          binanceUSDM.fetchOrder(order.binanceOrderId, order.pair),
          botLogger,
        );
        console.log(
          `[${order.pair}] [${
            order.binanceOrderId
          }]: fetch binance ${JSON.stringify(exchangeOrder.info)}`,
        );
        if (exchangeOrder.info) {
          await this.refreshDealOnOrderUpdate(deal, exchangeOrder.info);
        }
      } //end if
    } //end for
  } //end processExchangeDeal()

  async processActivePosition(activeDeals: DealEntity[]) {
    if (this.isWatchingPosition === false) {
      this.isWatchingPosition = true;
      for (let index = 0; index < activeDeals.length; index++) {
        const deal = activeDeals[index];
        try {
          await this.processExchangeDeal(deal);
        } catch (ex) {
          botLogger.error(
            `[${deal.pair}] [${deal.id}] processExchangeDeal() error ${ex.message}`,
            this.logLabel,
          );
        }
        await this.doTryPlacingOrder(deal.id);
      }
      this.isWatchingPosition = false;
    }
  }
}

import { BaseBotTrading } from './bot-trading';
import { BotTradingEntity } from 'src/modules/entities/bot.entity';
import { CombineReduceEventTypes } from 'src/common/event/reduce_events';
import { DealEntity } from 'src/modules/entities/deal.entity';
import { OrderEntity } from 'src/modules/entities/order.entity';
import { OrderStatus } from 'binance-api-node';
import { Repository } from 'typeorm';
import { TelegramService } from 'src/modules/telegram/telegram.service';
import { botLogger } from 'src/common/bot-logger';
import { createStopLossOrder } from './bot-utils-calc';
import { sortBy } from 'lodash';
import { wrapExReq } from 'src/modules/exchange/remote-api/exchange.helper';

export class DCABot extends BaseBotTrading {
  constructor(
    config: BotTradingEntity,
    dealRepo: Repository<DealEntity>,
    orderRepo: Repository<OrderEntity>,
    telegramService: TelegramService,
  ) {
    super(config, dealRepo, orderRepo, telegramService);
  }

  processBotEventAction(payload: CombineReduceEventTypes) {
    return;
    // throw new Error('Method not implemented.');
  }

  async handleLastSO(
    deal: DealEntity,
    currentOrder: OrderEntity,
  ): Promise<void> {
    this.sendMsgTelegram(`[${deal.pair}] [${deal.id}]: Have Last SO 😱`);
    if (deal.useStopLoss) {
      const stlOrder = createStopLossOrder(deal, currentOrder);
      const binanceStl = await this.placeBinanceOrder(stlOrder, true);
      if (binanceStl) {
        stlOrder.status = OrderStatus.NEW;
        stlOrder.binanceOrderId = `${binanceStl.orderId}`;
        stlOrder.placedCount = stlOrder.placedCount + 1;
        await this.orderRepo.save(stlOrder);
        this.sendMsgTelegram(
          `[${stlOrder.pair}] [${stlOrder.binanceOrderId}]: Place new Stop Loss Order. Price: ${stlOrder.price}, Amount: ${stlOrder.quantity}`,
        );
      }
    }
  }

  async processExchangeDeal(deal: DealEntity) {
    const binanceUSDM = this._exchangeRemote.getCcxtExchange();
    // binanceUSDM.setSandboxMode(true);
    //sort asc order by sequence
    deal.orders = sortBy(deal.orders, (e: OrderEntity) => {
      return e.sequence;
    });
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
        await this.doTryPlacingOrder(deal.id);
        try {
          await this.processExchangeDeal(deal);
        } catch (ex) {
          console.log(
            '🚀 ~ file: bot-dca.ts:89 ~ DCABot ~ processActivePosition ~ ex:',
            ex,
          );
          botLogger.error(
            `[${deal.pair}] [${deal.id}] processExchangeDeal() error ${ex.message}`,
            this.logLabel,
          );
        }
      }
      this.isWatchingPosition = false;
    }
  }
}

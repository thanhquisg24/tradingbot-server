import { sortBy } from 'lodash';
import {
  FuturesOrder as BinanceOrder,
  OrderStatus,
  OrderType,
  FuturesOrderType_LT,
  OrderSide,
} from 'binance-api-node';
import {
  CLIENT_DEAL_TYPE,
  DEAL_STATUS,
  DealEntity,
} from 'src/modules/entities/deal.entity';
import { TelegramService } from 'src/modules/telegram/telegram.service';
import {
  CLIENT_ORDER_TYPE,
  OrderEntity,
} from 'src/modules/entities/order.entity';
import { Raw, Repository } from 'typeorm';
import { BotTradingEntity } from 'src/modules/entities/bot.entity';
import { wrapExReq } from 'src/modules/exchange/remote-api/exchange.helper';
import { botLogger } from 'src/common/bot-logger';
import {
  ORDER_ACTION_ENUM,
  createStopLossOrder,
  getOrderSide,
} from './bot-utils-calc';
import { BotEventData } from 'src/common/event/reduce_events';
import { DCABot } from './bot-dca';

export class ReduceBot extends DCABot {
  private sendBotEvent: (eventPayload: BotEventData) => void;

  constructor(
    config: BotTradingEntity,
    dealRepo: Repository<DealEntity>,
    orderRepo: Repository<OrderEntity>,
    telegramService: TelegramService,
    _sendBotEvent: (eventPayload: BotEventData) => void,
  ) {
    super(config, dealRepo, orderRepo, telegramService);
    this.sendBotEvent = _sendBotEvent;
  }

  async processReduceDealUpdate(
    deal: DealEntity,
    executionReportEvt: BinanceOrder,
  ): Promise<void> {
    const {
      clientOrderId,
      orderId,
      status: orderStatus,
      price,
      avgPrice,
      executedQty,
    } = executionReportEvt;
    try {
      const filledPrice = Number(price) > 0 ? price : avgPrice;
      const currentOrder = await this.orderRepo.findOne({
        relations: ['deal'],
        where: {
          id: clientOrderId,
          deal: {
            status: DEAL_STATUS.ACTIVE,
          },
          status: Raw((status) => `${status} in ('NEW','PARTIALLY_FILLED')`),
        },
      });
      if (!currentOrder) {
        botLogger.info(`Order ${clientOrderId} not found`, this.logLabel);
        return;
      }

      const _buyOrderSide = getOrderSide(
        deal.strategyDirection,
        ORDER_ACTION_ENUM.OPEN_POSITION,
      );
      const _sellOrderSide = getOrderSide(
        deal.strategyDirection,
        ORDER_ACTION_ENUM.CLOSE_POSITION,
      );
      if (currentOrder.side === _buyOrderSide) {
        switch (orderStatus) {
          case 'NEW':
            if (currentOrder.status === 'CREATED') {
              currentOrder.binanceOrderId = `${orderId}`;
              currentOrder.status = OrderStatus.NEW;
              await this.orderRepo.save(currentOrder);
              botLogger.info(
                `[${currentOrder.pair}] [${currentOrder.binanceOrderId}]:${currentOrder.clientOrderType} NEW buy order. Price: ${filledPrice}, Amount: ${currentOrder.quantity}`,
                this.logLabel,
              );
            }
            break;
          case 'FILLED':
            if (
              currentOrder.status === 'CREATED' ||
              currentOrder.status === 'NEW' ||
              currentOrder.status === 'PARTIALLY_FILLED'
            ) {
              currentOrder.binanceOrderId = `${orderId}`;
              currentOrder.status = OrderStatus.FILLED;
              currentOrder.filledPrice = Number(filledPrice);
              currentOrder.filledQuantity = Number(executedQty);
              await this.orderRepo.save(currentOrder);
              const title = 'REDUCE DEMO';
              await this.sendMsgTelegram(
                `[${currentOrder.pair}] [${currentOrder.binanceOrderId}]: ${title} order ${currentOrder.side} has been FILLED. Price: ${filledPrice}, Amount: ${currentOrder.quantity}`,
              );
            }
            break;
          case 'PARTIALLY_FILLED':
          case 'CANCELED':
          case 'REJECTED':
          case 'EXPIRED':
            currentOrder.filledQuantity = Number(executedQty);
            if (currentOrder.status !== orderStatus) {
              currentOrder.status = orderStatus;
              await this.orderRepo.save(currentOrder);
            }
            botLogger.info(
              `[${currentOrder.pair}] [${currentOrder.binanceOrderId}]: Buy order is ${orderStatus}. Price: ${price}, Amount: ${currentOrder.quantity}`,
              this.logLabel,
            );
            break;

          default:
            botLogger.error(
              `Invalid order status : ${orderStatus}`,
              this.logLabel,
            );
        }
      } else {
        if (orderStatus !== 'NEW' && currentOrder.status !== orderStatus) {
          currentOrder.status = orderStatus;
          currentOrder.binanceOrderId = `${orderId}`;
          currentOrder.filledPrice = Number(filledPrice);
          currentOrder.filledQuantity = Number(executedQty);
          await this.orderRepo.update(currentOrder.id, {
            status: orderStatus,
            binanceOrderId: `${orderId}`,
            filledPrice: currentOrder.filledPrice,
            filledQuantity: currentOrder.filledQuantity,
          });
          botLogger.info(
            `[${currentOrder.pair}] [${currentOrder.binanceOrderId}]: ${currentOrder.clientOrderType} order is ${orderStatus}. Current Sell order is ${currentOrder.status}`,
            this.logLabel,
          );
        }
        if (
          orderStatus === 'FILLED' &&
          currentOrder.clientOrderType === CLIENT_ORDER_TYPE.REDUCE_END
        ) {
          await this.closeDeal(deal.id);
        }
      }
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async handleLastSO(
    deal: DealEntity,
    currentOrder: OrderEntity,
  ): Promise<void> {
    await this.sendMsgTelegram(`[${deal.pair}] [${deal.id}]: Have Last SO 😱`);
    const deviationMoveTrigger = deal.priceDeviationPercentage / 2;
    if (deal.useStopLoss) {
      const stlOrder = createStopLossOrder(deal, currentOrder);
      const binanceStl = await this.placeBinanceOrder(stlOrder);
      if (binanceStl) {
        stlOrder.status = OrderStatus.NEW;
        stlOrder.binanceOrderId = `${binanceStl.orderId}`;
        stlOrder.placedCount = stlOrder.placedCount + 1;
        await this.sendMsgTelegram(
          `[${stlOrder.pair}] [${stlOrder.binanceOrderId}]: Place new Stop Loss Order. Price: ${stlOrder.price}, Amount: ${stlOrder.quantity}`,
        );
      } else {
        stlOrder.status = 'PLACING';
        stlOrder.retryCount = stlOrder.retryCount + 1;
        await this.sendMsgTelegram(
          `[${stlOrder.pair}]:Error on placing a new Stop Loss Order. Price: ${stlOrder.price}, Amount: ${stlOrder.quantity}`,
        );
      }
      await this.orderRepo.save(stlOrder);
    }
  }

  async processExchangeDeal(deal: DealEntity) {
    const binanceUSDM = this._exchangeRemote.getCcxtExchange();
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
          if (deal.clientDealType === CLIENT_DEAL_TYPE.DCA) {
            await this.refreshDealOnOrderUpdate(deal, exchangeOrder.info);
          } else if (deal.clientDealType === CLIENT_DEAL_TYPE.REDUCE) {
            await this.processReduceDealUpdate(deal, exchangeOrder.info);
          }
        }
      } //end if
    } //end for
  } //end processExchangeDeal()
}

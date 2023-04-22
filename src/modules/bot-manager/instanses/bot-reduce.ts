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
  BuyOrder,
  CLIENT_ORDER_TYPE,
  OrderEntity,
} from 'src/modules/entities/order.entity';
import { Raw, Repository } from 'typeorm';
import {
  BotTradingEntity,
  STRATEGY_DIRECTION,
} from 'src/modules/entities/bot.entity';
import { wrapExReq } from 'src/modules/exchange/remote-api/exchange.helper';
import { botLogger } from 'src/common/bot-logger';
import {
  ORDER_ACTION_ENUM,
  calcDaviationBetween,
  calcReducePreparePayload,
  calcTp,
  createMarketOrder,
  createStopLossOrder,
  getOrderSide,
} from './bot-utils-calc';
import {
  BotEventData,
  CombineReduceEventTypes,
  IReduceBeginPayload,
  IReduceEndPayload,
  IReducePreparePayload,
  REDUCE_EV_TYPES,
} from 'src/common/event/reduce_events';
import { DCABot } from './bot-dca';
import BigNumber from 'bignumber.js';
import { getNewUUid } from 'src/common/utils/hash-util';

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

  private simulateTp(
    direction: STRATEGY_DIRECTION,
    curAvgPrice: BigNumber,
    curQty: BigNumber,
    triger_price: BigNumber,
    qtyToCutOff: number,
    targetPercent: BigNumber,
  ) {
    const oriQty = curQty.minus(qtyToCutOff);
    const newAvgPrice = curAvgPrice
      .multipliedBy(oriQty)
      .plus(triger_price.multipliedBy(qtyToCutOff))
      .dividedBy(curQty);
    const targetTp = calcTp(
      direction,
      newAvgPrice,
      new BigNumber(targetPercent),
    );
    return targetTp;
  }

  private sendPrepareEvent(
    deal: DealEntity,
    toBotId: number,
    triggerPrice: number,
    avgPrice: number,
    qty: number,
  ) {
    const percentNextMove = deal.priceDeviationPercentage / 2;
    const prepareEvent = calcReducePreparePayload(
      {
        fromStrategyDirection: this.botConfig.strategyDirection,
        fromDealId: deal.id,
        toBotId,
        pair: deal.pair,
        quantity: qty,
        avgPrice,
        currentPrice: triggerPrice,
        percentNextMove,
        round_count: deal.curReduceCount + 1,
      },
      this._exchangeRemote.getCcxtExchange(),
    );
    this.sendBotEvent(prepareEvent);
    botLogger.info(
      `[${deal.pair}] [${deal.id}]: Prepare Open Cover Deal to bot#${toBotId}`,
      this.logLabel,
    );
  }

  private createReduceOrderEntity(
    buyOrder: BuyOrder,
    deal: DealEntity,
    clientOrderType: CLIENT_ORDER_TYPE,
  ) {
    const order = new OrderEntity();
    order.pair = buyOrder.pair;
    order.clientOrderType = clientOrderType;
    order.sequence = buyOrder.sequence;
    order.volume = buyOrder.volume;
    order.deviation = buyOrder.deviation;
    order.side = buyOrder.side;
    order.price = buyOrder.price;
    order.quantity = buyOrder.quantity;
    order.totalQuantity = buyOrder.totalQuantity;
    order.averagePrice = buyOrder.averagePrice;
    order.exitPrice = buyOrder.exitPrice;
    order.status = 'CREATED';
    order.deal = deal;
    order.botId = deal.botId;
    order.exchangeId = deal.exchangeId;
    order.userId = deal.userId;
    return order;
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
    let filledBuyVolume = new BigNumber(0);
    let totalBuyQantity = 0;
    const buyOrderSide = getOrderSide(
      deal.strategyDirection,
      ORDER_ACTION_ENUM.OPEN_POSITION,
    );

    for (let index = 0; index < deal.orders.length; index++) {
      const order = deal.orders[index];
      if (order.filledQuantity > 0) {
        if (order.side === buyOrderSide) {
          filledBuyVolume = filledBuyVolume.plus(
            new BigNumber(order.filledPrice).multipliedBy(order.filledQuantity),
          );
          totalBuyQantity += order.filledQuantity;
        }
      }
    }
    const avgPrice = filledBuyVolume.dividedBy(totalBuyQantity);
    await this.dealRepo.update(deal.id, {
      curQuantity: totalBuyQantity,
      curAvgPrice: avgPrice.toNumber(),
    });
    this.sendPrepareEvent(
      deal,
      this.botConfig.refBotId,
      currentOrder.filledPrice,
      avgPrice.toNumber(),
      totalBuyQantity,
    );
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

  private async handlePrepareRound(payload: IReducePreparePayload) {
    const deal = new DealEntity();
    deal.userId = this.botConfig.userId;
    deal.botId = this.botConfig.id;
    deal.exchangeId = this.botConfig.exchange.id;
    deal.pair = payload.pair;
    deal.baseOrderSize = this.botConfig.baseOrderSize;
    deal.safetyOrderSize = this.botConfig.safetyOrderSize;
    deal.strategyDirection = this.botConfig.strategyDirection;
    deal.startOrderType = this.botConfig.startOrderType;
    deal.dealStartCondition = this.botConfig.dealStartCondition;
    deal.targetProfitPercentage = this.botConfig.targetProfitPercentage;
    deal.targetStopLossPercentage = this.botConfig.targetStopLossPercentage;
    deal.maxSafetyTradesCount = this.botConfig.maxSafetyTradesCount;
    deal.maxActiveSafetyTradesCount = this.botConfig.maxActiveSafetyTradesCount;
    deal.priceDeviationPercentage = this.botConfig.priceDeviationPercentage;
    deal.safetyOrderVolumeScale = this.botConfig.safetyOrderVolumeScale;
    deal.safetyOrderStepScale = this.botConfig.safetyOrderStepScale;
    deal.useStopLoss = this.botConfig.useStopLoss;
    deal.maxReduceCount = this.botConfig.maxReduceCount;
    deal.status = DEAL_STATUS.CREATED;
    deal.startAt = new Date();
    deal.orders = [];
    deal.clientDealType = CLIENT_DEAL_TYPE.REDUCE;
    deal.refReduceDealId = payload.fromDealId;
    deal.curAvgPrice = payload.triger_price.toNumber();
    deal.curQuantity = payload.r_quantity.toNumber();
    const savedDeal = await this.dealRepo.save(deal);
    const vol = payload.r_quantity
      .multipliedBy(payload.triger_price)
      .toNumber();
    const exitPrice = Number(
      this._exchangeRemote
        .getCcxtExchange()
        .priceToPrecision(
          deal.pair,
          calcTp(
            deal.strategyDirection,
            payload.triger_price,
            payload.tp_deviation,
          ).toNumber(),
        ),
    );
    const buyOrder: BuyOrder = {
      side: getOrderSide(
        deal.strategyDirection,
        ORDER_ACTION_ENUM.OPEN_POSITION,
      ),
      pair: payload.pair,
      sequence: 0,
      deviation: 0,
      volume: vol,
      price: payload.triger_price.toNumber(),
      averagePrice: payload.triger_price.toNumber(),
      quantity: payload.r_quantity.toNumber(),
      totalQuantity: payload.r_quantity.toNumber(),
      totalVolume: vol,
      exitPrice,
    };
    const orderEntity = this.createReduceOrderEntity(
      buyOrder,
      savedDeal,
      CLIENT_ORDER_TYPE.REDUCE_BEGIN,
    );
    const savedOrder = await this.orderRepo.save(orderEntity);
    const binanceOrder = await this.placeBinanceOrder(savedOrder, true);
    if (binanceOrder) {
      savedOrder.status = OrderStatus.NEW;
      savedOrder.binanceOrderId = `${binanceOrder.orderId}`;
      savedOrder.placedCount = savedOrder.placedCount + 1;
      await this.orderRepo.save(savedOrder);
      await this.dealRepo.update(deal.id, { status: DEAL_STATUS.ACTIVE });
      await this.sendMsgTelegram(
        `[${savedOrder.pair}] [${savedOrder.binanceOrderId}]: Place Deal cover preference from ${deal.refReduceDealId}. Price: ${savedOrder.price}, Amount: ${savedOrder.quantity}`,
      );
    }
  }

  private async handleBeginRound(payload: IReduceBeginPayload) {
    const currentDeal = await this.getDeal(payload.toDealId);
    const existingSellOrder = currentDeal.orders.find(
      (o) =>
        o.clientOrderType === CLIENT_ORDER_TYPE.TAKE_PROFIT &&
        (o.status === 'NEW' || o.status === 'PARTIALLY_FILLED'),
    );
    if (existingSellOrder) {
      await this.cancelOrder(existingSellOrder);
      existingSellOrder.status = 'CANCELED';
      this.orderRepo.update(existingSellOrder.id, {
        status: existingSellOrder.status,
      });
    }
    const _tpDeviation = calcDaviationBetween(
      payload.fromStrategyDirection,
      new BigNumber(currentDeal.curAvgPrice),
      payload.triger_price,
    );
    const exitPrice = Number(
      this._exchangeRemote
        .getCcxtExchange()
        .priceToPrecision(
          currentDeal.pair,
          calcTp(
            currentDeal.strategyDirection,
            new BigNumber(currentDeal.curAvgPrice),
            _tpDeviation,
          ).toNumber(),
        ),
    );
    const vol = new BigNumber(currentDeal.curQuantity)
      .multipliedBy(currentDeal.curAvgPrice)
      .toNumber();
    const buyOrder: BuyOrder = {
      side: getOrderSide(
        currentDeal.strategyDirection,
        ORDER_ACTION_ENUM.CLOSE_POSITION,
      ),
      pair: payload.pair,
      sequence: currentDeal.orders.length,
      deviation: 0,
      volume: vol,
      price: exitPrice,
      averagePrice: exitPrice,
      quantity: currentDeal.curQuantity,
      totalQuantity: currentDeal.curQuantity,
      totalVolume: vol,
      exitPrice,
    };
    const orderEntity = this.createReduceOrderEntity(
      buyOrder,
      currentDeal,
      CLIENT_ORDER_TYPE.REDUCE_END,
    );
    const savedOrder = await this.orderRepo.save(orderEntity);
    const binanceOrder = await this.placeBinanceOrder(savedOrder, true);
    if (binanceOrder) {
      savedOrder.status = OrderStatus.NEW;
      savedOrder.binanceOrderId = `${binanceOrder.orderId}`;
      savedOrder.placedCount = savedOrder.placedCount + 1;
      await this.orderRepo.save(savedOrder);
      await this.sendMsgTelegram(
        `[${savedOrder.pair}] [${savedOrder.binanceOrderId}]: Place a ${CLIENT_ORDER_TYPE.REDUCE_END} order . Price: ${savedOrder.price}, Amount: ${savedOrder.quantity}`,
      );
    }
  }

  private async handleEndRound(payload: IReduceEndPayload) {
    const { toBotId, toDealId, pair, fromProfitQty, triger_price } = payload;
    const currentDeal = await this.dealRepo.findOneBy([
      {
        id: toDealId,
        status: DEAL_STATUS.ACTIVE,
        botId: toBotId,
      },
      {
        status: DEAL_STATUS.ACTIVE,
        botId: toBotId,
        refReduceDealId: toDealId,
      },
    ]);

    if (currentDeal) {
      const _exchange = this._exchangeRemote.getCcxtExchange();
      const _avgPrice = new BigNumber(currentDeal.curAvgPrice);
      const _qty = new BigNumber(currentDeal.curQuantity);
      const _targetTP = new BigNumber(
        currentDeal.targetProfitPercentage,
      ).dividedBy(100);
      const _daviation = calcDaviationBetween(
        currentDeal.strategyDirection,
        _avgPrice,
        triger_price,
      );
      const _drawdownQty = _qty.multipliedBy(_daviation);
      const _percentQty = calcDaviationBetween(
        STRATEGY_DIRECTION.LONG,
        fromProfitQty,
        _drawdownQty,
      );
      const _qtyToCutOff = Number(
        _exchange.amountToPrecision(
          currentDeal.pair,
          _qty.multipliedBy(_percentQty).toNumber(),
        ),
      );
      const cutOrderMarket = createMarketOrder(
        currentDeal,
        triger_price.toNumber(),
        _qtyToCutOff,
        ORDER_ACTION_ENUM.CLOSE_POSITION,
        CLIENT_ORDER_TYPE.COVER_CUT_QTY,
        currentDeal.orders.length,
      );
      const exOrder1 = await this.placeBinanceOrder(cutOrderMarket, true);
      if (exOrder1) {
        cutOrderMarket.status = exOrder1.status;
        cutOrderMarket.binanceOrderId = `${exOrder1.orderId}`;
        cutOrderMarket.price = Number(exOrder1.avgPrice);
        cutOrderMarket.filledPrice = cutOrderMarket.price;
        cutOrderMarket.filledQuantity = Number(exOrder1.executedQty);
        cutOrderMarket.placedCount = cutOrderMarket.placedCount + 1;
        await this.orderRepo.save(cutOrderMarket);
        currentDeal.curQuantity =
          currentDeal.curQuantity - cutOrderMarket.filledQuantity;
        await this.dealRepo.update(currentDeal.id, {
          curQuantity: currentDeal.curQuantity,
        });
      } //end if
      const addOrderMarket = createMarketOrder(
        currentDeal,
        triger_price.toNumber(),
        _qtyToCutOff,
        ORDER_ACTION_ENUM.CLOSE_POSITION,
        CLIENT_ORDER_TYPE.COVER_CUT_QTY,
        currentDeal.orders.length,
      );
      const exOrder2 = await this.placeBinanceOrder(addOrderMarket, true);
      if (exOrder2) {
        addOrderMarket.status = exOrder2.status;
        addOrderMarket.binanceOrderId = `${exOrder2.orderId}`;
        addOrderMarket.price = Number(exOrder2.avgPrice);
        addOrderMarket.filledPrice = addOrderMarket.price;
        addOrderMarket.filledQuantity = Number(exOrder2.executedQty);
        addOrderMarket.placedCount = addOrderMarket.placedCount + 1;
        await this.orderRepo.save(addOrderMarket);

        const _avgPrice =
          addOrderMarket.filledPrice * addOrderMarket.filledQuantity +
          (currentDeal.curQuantity * currentDeal.curAvgPrice) /
            (currentDeal.curQuantity + addOrderMarket.filledQuantity);
        currentDeal.curQuantity =
          currentDeal.curQuantity + addOrderMarket.filledQuantity;
        await this.dealRepo.update(currentDeal.id, {
          curQuantity: currentDeal.curQuantity,
          curAvgPrice: Number(
            _exchange.priceToPrecision(currentDeal.pair, _avgPrice),
          ),
        });
      } //end if

      //place a new TP LINE

      const tpPriceTmp = this.simulateTp(
        currentDeal.strategyDirection,
        _avgPrice,
        _qty,
        triger_price,
        _qtyToCutOff,
        _targetTP,
      );
      const _tpPrice = Number(
        _exchange.priceToPrecision(currentDeal.pair, tpPriceTmp.toNumber()),
      );
      const newTPOrder = new OrderEntity();
      newTPOrder.id = getNewUUid();
      newTPOrder.deal = currentDeal;
      newTPOrder.side = getOrderSide(
        currentDeal.strategyDirection,
        ORDER_ACTION_ENUM.CLOSE_POSITION,
      );
      newTPOrder.status = 'CREATED';
      newTPOrder.price = _tpPrice;
      newTPOrder.quantity = _qty.toNumber();
      newTPOrder.volume = _qty.multipliedBy(_tpPrice).toNumber();
      newTPOrder.sequence = 1000 + currentDeal.orders.length;
      newTPOrder.botId = currentDeal.botId;
      newTPOrder.exchangeId = currentDeal.exchangeId;
      newTPOrder.userId = currentDeal.userId;
      newTPOrder.clientOrderType = CLIENT_ORDER_TYPE.TAKE_PROFIT;
      newTPOrder.pair = currentDeal.pair;
      const savedTPOrder = await this.orderRepo.save(newTPOrder);
      const exTpOrder = await this.placeBinanceOrder(newTPOrder, true);
      if (exTpOrder) {
        savedTPOrder.status = OrderStatus.NEW;
        savedTPOrder.binanceOrderId = `${exTpOrder.orderId}`;
        savedTPOrder.placedCount = savedTPOrder.placedCount + 1;
        await this.orderRepo.save(savedTPOrder);
        await this.sendMsgTelegram(
          `[${savedTPOrder.pair}] [${savedTPOrder.binanceOrderId}]: Place new Take Profit Order. Price: ${savedTPOrder.price}, Amount: ${savedTPOrder.quantity}`,
        );
      }
    } //end if currentDeal
  }

  async processBotEventAction(data: CombineReduceEventTypes) {
    switch (data.type) {
      case REDUCE_EV_TYPES.PREPARE_ROUND:
        await this.handlePrepareRound(data.payload);
        break;
      case REDUCE_EV_TYPES.BEGIN_ROUND:
        await this.handleBeginRound(data.payload);
        break;
      case REDUCE_EV_TYPES.END_ROUND:
        await this.handleEndRound(data.payload);
        break;
      default:
        break;
    }
    return;
  }
}

import {
  AbstractExchangeAPI,
  ExchangeFactory,
} from 'src/modules/exchange/remote-api/exchange.remote.api';
import {
  FuturesOrder as BinanceOrder,
  FuturesOrderType_LT,
  OrderSide,
  OrderStatus,
  OrderType,
} from 'binance-api-node';
import {
  BotTradingEntity,
  DEAL_START_TYPE,
} from 'src/modules/entities/bot.entity';
import {
  BuyOrder,
  CLIENT_ORDER_TYPE,
  OrderEntity,
  createOrderEntity,
} from 'src/modules/entities/order.entity';
import {
  CLIENT_DEAL_TYPE,
  DEAL_STATUS,
  DealEntity,
} from 'src/modules/entities/deal.entity';
import {
  ORDER_ACTION_ENUM,
  calculateBuyDCAOrders,
  createCloseMarketOrder,
  createMarketBaseOrder,
  createNextTPOrder,
  getOrderSide,
} from './bot-utils-calc';
import { OnTVEventPayload, TVActionType } from 'src/common/event/tv_events';
import { Raw, Repository } from 'typeorm';

import BigNumber from 'bignumber.js';
import { Order as CCXTOrder } from 'ccxt';
import { CombineReduceEventTypes } from 'src/common/event/reduce_events';
import { TelegramService } from 'src/modules/telegram/telegram.service';
import { botLogger } from 'src/common/bot-logger';
import { decryptWithAES } from 'src/common/utils/hash-util';
import { wrapExReq } from 'src/modules/exchange/remote-api/exchange.helper';

interface IBaseBotTrading {
  isWatchingPosition: boolean;
  botConfig: BotTradingEntity;
  _exchangeRemote: AbstractExchangeAPI;
  watchPosition(): Promise<void>;
  updateConfig(partConfig: Partial<BotTradingEntity>): void;
  start(): Promise<boolean>;
  stop(): void;
  closeAtMarketPrice(dealId: number, userId: number): Promise<void>;
  processTvAction(tv: OnTVEventPayload): Promise<void>;
}
const MAX_RETRY = 55;

export abstract class BaseBotTrading implements IBaseBotTrading {
  botConfig: BotTradingEntity;

  _exchangeRemote: AbstractExchangeAPI;

  protected isRunning: boolean;

  protected readonly dealRepo: Repository<DealEntity>;

  protected readonly orderRepo: Repository<OrderEntity>;

  protected readonly telegramService: TelegramService;

  protected logLabel: {
    label: string;
  };

  isWatchingPosition: boolean;

  constructor(
    config: BotTradingEntity,
    dealRepo: Repository<DealEntity>,
    orderRepo: Repository<OrderEntity>,
    telegramService: TelegramService,
  ) {
    this.botConfig = config;
    this.isRunning = false;
    this.dealRepo = dealRepo;
    this.orderRepo = orderRepo;
    this.telegramService = telegramService;
    this.isWatchingPosition = false;
    this.logLabel = { label: `Bot#${config.id} ${config.name}` };
  }

  protected sendMsgTelegram(msg: string): void {
    botLogger.info(msg, this.logLabel);
    if (this.botConfig.exchange.user.telegramChatId) {
      this.telegramService.sendMessageToUser(
        this.botConfig.exchange.user.telegramChatId,
        `[${this.logLabel.label}] ${msg}`,
      );
    }
  }
  private async checkMaxActiveDeal() {
    const countActiveDeal = await this.dealRepo.countBy({
      status: DEAL_STATUS.ACTIVE,
      botId: this.botConfig.id,
    });
    return countActiveDeal < this.botConfig.maxActiveDeal;
  }

  private async checkValidPair(pair: string) {
    if (this.botConfig.allowDealSamePair) {
      return true;
    }
    const countActiveDealByPair = await this.dealRepo.countBy({
      status: DEAL_STATUS.ACTIVE,
      botId: this.botConfig.id,
      pair,
    });
    return countActiveDealByPair === 0;
  }

  protected async placeBinanceOrder(
    order: OrderEntity | null,
    isRetry?: boolean,
  ): Promise<BinanceOrder | undefined> {
    try {
      let params: any = {
        positionSide: this.botConfig.strategyDirection,
        newClientOrderId: order.id,
      };
      let ex_orderType: FuturesOrderType_LT = OrderType.LIMIT;

      switch (order.clientOrderType) {
        case CLIENT_ORDER_TYPE.BASE:
          if (this.botConfig.startOrderType !== OrderType.LIMIT) {
            ex_orderType = OrderType.MARKET;
          }
          break;
        case CLIENT_ORDER_TYPE.SAFETY:
        case CLIENT_ORDER_TYPE.TAKE_PROFIT:
        case CLIENT_ORDER_TYPE.REDUCE_END:
          ex_orderType = OrderType.LIMIT;
          break;

        case CLIENT_ORDER_TYPE.REDUCE_BEGIN:
        case CLIENT_ORDER_TYPE.STOP_LOSS:
          ex_orderType = OrderType.STOP;
          params = { ...params, stopPrice: order.price };
          break;
        case CLIENT_ORDER_TYPE.COVER_ADD_QTY:
        case CLIENT_ORDER_TYPE.COVER_CUT_QTY:
        case CLIENT_ORDER_TYPE.CLOSE_AT_MARKET:
          ex_orderType = OrderType.MARKET;
          break;
        default:
          ex_orderType = OrderType.LIMIT;
          break;
      }
      if (ex_orderType === OrderType.MARKET) {
        params = { ...params, newOrderRespType: 'RESULT' };
      }
      botLogger.info(
        `${order.pair} ${order.id} , ${JSON.stringify(params)}`,
        this.logLabel,
      );
      const symbol = order.pair;
      const side = order.side;
      const quantity = order.quantity;
      const price = order.price;
      const leverage = this.botConfig.leverage;
      await wrapExReq(
        this._exchangeRemote
          .getCcxtExchange()
          .setLeverage(leverage, symbol, { marginMode: 'cross' }),
        botLogger,
      );

      const newOrder = await wrapExReq(
        this._exchangeRemote
          .getCcxtExchange()
          .createOrder(
            symbol,
            ex_orderType as any,
            side as any,
            quantity,
            price,
            params,
          ),
        botLogger,
      );

      botLogger.info(
        `[${order.pair}][${newOrder.id}]: New ${order.side} order has been placed`,
        this.logLabel,
      );
      return newOrder.info;
    } catch (err) {
      botLogger.error(
        `[${order.pair}][${order.id}]Failed to place order  ${err.message}`,
        this.logLabel,
      );
      this.sendMsgTelegram(
        `[${order.pair}][${order.id}]Failed to place order  ${err.message}`,
      );
      if (isRetry) {
        order.status = 'PLACING';
        order.retryCount = order.retryCount + 1;
        await this.orderRepo.save(order);
        this.sendMsgTelegram(
          `[${order.pair}][${order.id}]:Error on placing ${
            order.clientOrderType
          }. Price: ${order.price}, Amount: ${order.quantity} .RetryCount: ${
            order.retryCount - 1
          }`,
        );
      }
      return null;
    }
  }

  async cancelOrder(order: OrderEntity): Promise<void> {
    try {
      const result = await wrapExReq(
        this._exchangeRemote
          .getCcxtExchange()
          .cancelOrder(order.binanceOrderId, order.pair, {}),
        botLogger,
      );

      botLogger.info(
        `[${order.pair}] :${order.side} Order ${order.binanceOrderId} has been cancelled, status ${result.status}`,
        this.logLabel,
      );
    } catch (err) {
      botLogger.error(
        err.message + ' Failed to cancel order ' + order.binanceOrderId,
        this.logLabel,
      );
    }
  }

  updateConfig(partConfig: Partial<BotTradingEntity>) {
    this.botConfig = { ...this.botConfig, ...partConfig };
  }

  async start(): Promise<boolean> {
    try {
      const exchangeRow = this.botConfig.exchange;
      const apiSerectDescrypt = decryptWithAES(exchangeRow.apiSecret);
      const _exchange = ExchangeFactory.createExchange(
        exchangeRow.id,
        exchangeRow.name,
        exchangeRow.apiKey,
        apiSerectDescrypt,
        exchangeRow.isTestNet,
      );
      const exInfo = await wrapExReq(
        _exchange.checkExchangeOnlineStatus(),
        botLogger,
      );
      if (exInfo) {
        this._exchangeRemote = _exchange;
        await this._exchangeRemote.getCcxtExchange().loadMarkets();
        this.isRunning = true;
        this.sendMsgTelegram('Bot is Starting #' + this.botConfig.id);
        // this._exchangeRemote.getCcxtExchange().getSib
        return true;
      }
      botLogger.error('Cannot connect to Exchange API!', this.logLabel);
      return false;
    } catch (ex) {
      botLogger.error('Start Bot error: ' + ex.message, this.logLabel);
      return false;
    }
  }

  async stop() {
    this.sendMsgTelegram('Bot is Stopped #' + this.botConfig.id);
    this.isRunning = false;
  }

  getActiveDeals(): Promise<DealEntity[] | undefined> {
    return this.dealRepo.find({
      where: { status: DEAL_STATUS.ACTIVE, botId: this.botConfig.id },
    });
  }

  getDeal(id: number): Promise<DealEntity | undefined> {
    return this.dealRepo.findOne({
      relations: ['orders'],
      where: {
        id,
        status: DEAL_STATUS.ACTIVE,
      },
    });
  }

  private async createDeal(
    buyOrders: BuyOrder[],
    baseClientOrderId?: string,
  ): Promise<DealEntity> {
    const deal = new DealEntity();
    deal.userId = this.botConfig.userId;
    deal.botId = this.botConfig.id;
    deal.exchangeId = this.botConfig.exchange.id;
    deal.clientDealType = CLIENT_DEAL_TYPE.DCA;
    deal.pair = buyOrders[0].pair;
    deal.baseOrderSize = this.botConfig.baseOrderSize;
    deal.safetyOrderSize = this.botConfig.safetyOrderSize;
    deal.strategyDirection = this.botConfig.strategyDirection;
    deal.startOrderType = this.botConfig.startOrderType;
    deal.dealStartCondition = this.botConfig.dealStartCondition;
    deal.targetProfitPercentage = this.botConfig.targetProfitPercentage;
    deal.targetStopLossPercentage = this.botConfig.targetStopLossPercentage;
    deal.maxSafetyTradesCount = this.botConfig.maxSafetyTradesCount;
    deal.maxActiveSafetyTradesCount = this.botConfig.maxActiveSafetyTradesCount;
    deal.reduceDeviationPercentage = this.botConfig.reduceDeviationPercentage;
    deal.priceDeviationPercentage = this.botConfig.priceDeviationPercentage;
    deal.safetyOrderVolumeScale = this.botConfig.safetyOrderVolumeScale;
    deal.safetyOrderStepScale = this.botConfig.safetyOrderStepScale;
    deal.useStopLoss = this.botConfig.useStopLoss;
    deal.maxReduceCount = this.botConfig.maxReduceCount;
    deal.status = DEAL_STATUS.CREATED;
    deal.startAt = new Date();
    deal.orders = [];
    const savedDeal = await this.dealRepo.save(deal);
    for (const buyOrder of buyOrders) {
      const order = createOrderEntity(buyOrder, savedDeal);
      if (
        baseClientOrderId &&
        order.clientOrderType === CLIENT_ORDER_TYPE.BASE
      ) {
        order.id = baseClientOrderId;
      }
      const newOrder = await this.orderRepo.save(order);
      deal.orders.push(newOrder);
    }
    return deal;
  }
  private createBuyOrder(symbol: string, currentPrice: BigNumber) {
    return calculateBuyDCAOrders(
      symbol,
      currentPrice,
      this.botConfig,
      this._exchangeRemote.getCcxtExchange(),
    );
  }
  private async createAndPlaceBaseOrder(
    symbol: string,
    currentPrice: BigNumber,
  ) {
    let newDealEntity: DealEntity | null = null;
    let baseOrderEntity: OrderEntity | null = null;
    const { strategyDirection, baseOrderSize } = this.botConfig;
    try {
      switch (this.botConfig.startOrderType) {
        case 'MARKET':
          const prepareBaseOrder = createMarketBaseOrder(
            this._exchangeRemote.getCcxtExchange(),
            strategyDirection,
            symbol,
            currentPrice,
            baseOrderSize,
          );

          const binanceMarketBaseOrder = await this.placeBinanceOrder(
            prepareBaseOrder,
          );
          if (binanceMarketBaseOrder) {
            const filledPrice =
              Number(binanceMarketBaseOrder.avgPrice) > 0
                ? binanceMarketBaseOrder.avgPrice
                : binanceMarketBaseOrder.price;
            const buyOrdersMarket = this.createBuyOrder(
              symbol,
              new BigNumber(filledPrice),
            );

            newDealEntity = await this.createDeal(
              buyOrdersMarket,
              prepareBaseOrder.id,
            );
            baseOrderEntity = newDealEntity.orders.find(
              (o) =>
                o.status === 'CREATED' &&
                o.clientOrderType === CLIENT_ORDER_TYPE.BASE,
            );
            if (baseOrderEntity) {
              baseOrderEntity.status = OrderStatus.NEW;
              baseOrderEntity.binanceOrderId = `${binanceMarketBaseOrder.orderId}`;
              baseOrderEntity.placedCount = baseOrderEntity.placedCount + 1;
            }
          }

          break;
        case 'LIMIT':
          const buyOrders = this.createBuyOrder(symbol, currentPrice);
          newDealEntity = await this.createDeal(buyOrders);
          baseOrderEntity = newDealEntity.orders.find(
            (o) =>
              o.status === 'CREATED' &&
              o.clientOrderType === CLIENT_ORDER_TYPE.BASE,
          );
          if (baseOrderEntity) {
            const binanceLimitBaseOrder = await this.placeBinanceOrder(
              baseOrderEntity,
            );
            if (binanceLimitBaseOrder) {
              baseOrderEntity.status = OrderStatus.NEW;
              baseOrderEntity.binanceOrderId = `${binanceLimitBaseOrder.orderId}`;
              baseOrderEntity.placedCount = baseOrderEntity.placedCount + 1;
            }
          }
          break;
      }

      if (
        newDealEntity !== null &&
        baseOrderEntity !== null &&
        baseOrderEntity.status === OrderStatus.NEW
      ) {
        await this.orderRepo.save(baseOrderEntity);
        await this.dealRepo.update(newDealEntity.id, {
          status: DEAL_STATUS.ACTIVE,
        });
        this.sendMsgTelegram(
          `[${baseOrderEntity.pair}] [${baseOrderEntity.binanceOrderId}]: Started a new Base Order. Price: ${baseOrderEntity.price}, Amount: ${baseOrderEntity.quantity}`,
        );
        return;
      }
    } catch (ex) {
      this.sendMsgTelegram(
        `[${symbol}]: Placing base Order error!  ${ex.message}`,
      );
      throw ex;
    }
  }

  async processTvAction(tv: OnTVEventPayload): Promise<void> {
    botLogger.log(
      `receive msg from tradingview ${JSON.stringify(tv)}`,
      this.logLabel,
    );
    try {
      if (this.botConfig.dealStartCondition !== DEAL_START_TYPE.TRADINGVIEW) {
        return;
      }
      if (tv.userId !== this.botConfig.userId) {
        this.sendMsgTelegram('User is not valid :' + JSON.stringify(tv));
        return;
      }
      if (tv.botId !== this.botConfig.id) {
        this.sendMsgTelegram('Bot is not valid :' + JSON.stringify(tv));
        return;
      }
      const existingPair = this.botConfig.pairs.find(
        (o) => o.commonPair === tv.pair,
      );
      if (!existingPair) {
        this.sendMsgTelegram('Pair is not valid :' + JSON.stringify(tv));
        return;
      }

      switch (tv.action) {
        case TVActionType.OPEN_DEAL:
          const isValidPair = await this.checkValidPair(
            existingPair.exchangePair,
          );
          const isValidMaxDeal = await this.checkMaxActiveDeal();
          if (isValidMaxDeal && isValidPair) {
            // const binanceUSDM = this._exchangeRemote.getCcxtExchange();
            // const ticker = await wrapExReq(
            //   binanceUSDM.fetchTicker(existingPair.exchangePair),
            //   botLogger,
            // );
            // const lastPrice = ticker.last;
            await this.createAndPlaceBaseOrder(
              existingPair.exchangePair,
              new BigNumber(tv.price),
            );
          }
          break;
        case TVActionType.CLOSE_DEAL:
          break;
        default:
          break;
      }
      return;
    } catch (ex) {
      botLogger.error(
        `[${tv.pair}] processTvAction() error ${ex.message}`,
        this.logLabel,
      );
      return;
    }
  }

  private async handleCancelNewSellOrderFirst(existingSellOrder: OrderEntity) {
    try {
      const exchangeSellOrder: CCXTOrder = await wrapExReq(
        this._exchangeRemote
          .getCcxtExchange()
          .fetchOrder(existingSellOrder.binanceOrderId, existingSellOrder.pair),
        botLogger,
      );
      existingSellOrder.status = exchangeSellOrder.info.status;
      existingSellOrder.filledQuantity = exchangeSellOrder.filled;

      botLogger.warn(
        '🚀 ~ file: bot-trading.ts:484 ~ BaseBotTrading ~ handleCancelNewSellOrderFirst ~ existingSellOrder:' +
          JSON.stringify(exchangeSellOrder),
        this.logLabel,
      );
      if (
        existingSellOrder.status === 'PARTIALLY_FILLED' ||
        existingSellOrder.status === 'NEW'
      ) {
        await this.cancelOrder(existingSellOrder);
        existingSellOrder.status = 'CANCELED';
      }
    } catch (error) {
      botLogger.error(
        `[${existingSellOrder.pair}] [${existingSellOrder.binanceOrderId}]: NEW buy order. Price: handleNewSellOrderFilledFirst ${error.message}`,
        this.logLabel,
      );
    }
    botLogger.warn(
      '🚀 ~ file: bot-trading.ts:501 ~ BaseBotTrading ~ handleCancelNewSellOrderFirst ~ save:' +
        JSON.stringify(existingSellOrder),
      this.logLabel,
    );
    const sellOrderEntity = await this.orderRepo.save(existingSellOrder);
    return sellOrderEntity;
  }
  abstract handleLastSO(
    deal: DealEntity,
    currentOrder: OrderEntity,
  ): Promise<void>;
  private async isInterruptWhenSellFilled(
    existingSellOrder: OrderEntity,
    currentBuyOrder: OrderEntity,
  ) {
    let isTrue = false;
    if (existingSellOrder) {
      //cancel sell order handle nen rau dai
      const newCancelSellOrder = await this.handleCancelNewSellOrderFirst(
        existingSellOrder,
      );
      // if (newCancelSellOrder.filledQuantity > 0) {
      //   currentBuyOrder.totalQuantity =
      //     currentBuyOrder.totalQuantity - newCancelSellOrder.filledQuantity;
      //   await this.orderRepo
      //     .createQueryBuilder()
      //     .update('order_entity')
      //     .set({
      //       total_quantity: Raw(
      //         (total_quantity) => `${total_quantity} - :prmSellQty`,
      //         {
      //           prmSellQty: newCancelSellOrder.filledQuantity,
      //         },
      //       ),
      //     })
      //     .where('order_entity.client_order_type = :prmClient_od_ty', {
      //       prmClient_od_ty: CLIENT_ORDER_TYPE.SAFETY,
      //     })
      //     .andWhere('order_entity.status = :prmStatus', {
      //       prmStatus: 'CREATED',
      //     })
      //     .execute();
      // }
      isTrue = newCancelSellOrder.status === OrderStatus.FILLED;
    }
    return isTrue;
  }

  async refreshDealOnOrderUpdate(
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
      if (!deal) {
        botLogger.warn(`Invalid deal ${currentOrder.deal.id}`, this.logLabel);
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
                `[${currentOrder.pair}] [${currentOrder.binanceOrderId}]: NEW buy order. Price: ${filledPrice}, Amount: ${currentOrder.quantity}`,
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
              const existingSellOrder = deal.orders.find(
                (o) => o.side === _sellOrderSide && o.status === 'NEW',
              );
              const isInterrupt = await this.isInterruptWhenSellFilled(
                existingSellOrder,
                currentOrder,
              );

              currentOrder.binanceOrderId = `${orderId}`;
              currentOrder.status = OrderStatus.FILLED;
              currentOrder.filledPrice = Number(filledPrice);
              currentOrder.filledQuantity = Number(executedQty);
              await this.orderRepo.save(currentOrder);
              const title = currentOrder.sequence > 0 ? 'Safety' : 'Base';
              this.sendMsgTelegram(
                `[${currentOrder.pair}] [${currentOrder.binanceOrderId}]: ${title} order ${currentOrder.side} has been FILLED. Price: ${filledPrice}, Amount: ${currentOrder.quantity}`,
              );
              // Cancel existing sell order (if any)
              // and create a new take-profit order
              if (isInterrupt) {
                const closeMarketOrder = createCloseMarketOrder(
                  currentOrder.deal,
                  currentOrder.totalQuantity,
                );
                const exOrder = await this.placeBinanceOrder(closeMarketOrder);
                if (exOrder) {
                  closeMarketOrder.status = exOrder.status;
                  closeMarketOrder.binanceOrderId = `${exOrder.orderId}`;
                  closeMarketOrder.price = Number(exOrder.avgPrice);
                  closeMarketOrder.averagePrice = closeMarketOrder.price;
                  closeMarketOrder.filledPrice = closeMarketOrder.price;
                  closeMarketOrder.volume = Number(exOrder.cumQuote);
                  closeMarketOrder.quantity = Number(exOrder.executedQty);
                  closeMarketOrder.filledQuantity = closeMarketOrder.quantity;
                  closeMarketOrder.placedCount =
                    closeMarketOrder.placedCount + 1;
                  await this.orderRepo.save(closeMarketOrder);
                  await this.closeDeal(currentOrder.deal.id);
                }
                return;
              }

              //placing TP line
              let newSellOrder = createNextTPOrder(deal, currentOrder);
              newSellOrder = await this.orderRepo.save(newSellOrder);
              const bSellOrder = await this.placeBinanceOrder(
                newSellOrder,
                true,
              );
              if (bSellOrder) {
                newSellOrder.status = OrderStatus.NEW;
                newSellOrder.binanceOrderId = `${bSellOrder.orderId}`;
                newSellOrder.placedCount = newSellOrder.placedCount + 1;
                await this.orderRepo.save(newSellOrder);
                this.sendMsgTelegram(
                  `[${newSellOrder.pair}] [${newSellOrder.binanceOrderId}]: Place new Take Profit Order. Price: ${newSellOrder.price}, Amount: ${newSellOrder.quantity}`,
                );
              }
              //end placing TP line
              //placing next safety
              const nextsafety = deal.orders.find(
                (o) =>
                  o.side === _buyOrderSide &&
                  o.status === 'CREATED' &&
                  o.sequence === currentOrder.sequence + 1,
              );

              if (nextsafety) {
                const binanceSafety = await this.placeBinanceOrder(
                  nextsafety,
                  true,
                );
                if (binanceSafety) {
                  nextsafety.status = OrderStatus.NEW;
                  nextsafety.binanceOrderId = `${binanceSafety.orderId}`;
                  nextsafety.placedCount = nextsafety.placedCount + 1;
                  await this.orderRepo.save(nextsafety);
                  await this.dealRepo.update(deal.id, {
                    curSafetyTradesCount: nextsafety.sequence,
                  });
                  this.sendMsgTelegram(
                    `[${nextsafety.pair}] [${nextsafety.binanceOrderId}]: Place new Safety Order. Price: ${nextsafety.price}, Amount: ${nextsafety.quantity}`,
                  );
                }
              }
              //end placing next safety

              //placing stoploss
              const isLastSO =
                currentOrder.sequence >= deal.maxSafetyTradesCount &&
                (currentOrder.clientOrderType === CLIENT_ORDER_TYPE.SAFETY ||
                  currentOrder.clientOrderType === CLIENT_ORDER_TYPE.BASE);
              if (isLastSO) {
                await this.handleLastSO(deal, currentOrder);
              }
              //end placing next stoploss
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
        // const _prevStatus = currentOrder.status;
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
            `[${currentOrder.pair}] [${currentOrder.binanceOrderId}]: Market Sell order is ${orderStatus}. Current Sell order is ${currentOrder.status}`,
            this.logLabel,
          );
        }
        if (orderStatus === 'FILLED') {
          // currentOrder.status = orderStatus;
          // currentOrder.binanceOrderId = `${orderId}`;
          // await this.orderRepo.save(currentOrder);
          // botLogger.info(
          //   `[${currentOrder.pair}] [${currentOrder.binanceOrderId}]: Sell order is ${orderStatus}. Price: ${filledPrice}, Amount: ${currentOrder.quantity}`,
          //   {
          //     label: this.logLabel,
          //   },
          // );
          await this.closeDeal(deal.id);
        }
      }
    } catch (error) {
      throw new Error(error.message);
    }
  }
  async doTryPlacingOrder(deal_Id: number): Promise<void> {
    const ordersOnPlacing = await this.orderRepo.findBy({
      deal: {
        id: deal_Id,
        status: DEAL_STATUS.ACTIVE,
      },
      status: 'PLACING',
      retryCount: Raw((alias) => `${alias} <:maxretry`, {
        maxretry: MAX_RETRY,
      }),
    });
    for (let index = 0; index < ordersOnPlacing.length; index++) {
      const order = ordersOnPlacing[index];
      const binanceOrder = await this.placeBinanceOrder(order, true);
      if (binanceOrder) {
        order.status = OrderStatus.NEW;
        order.binanceOrderId = `${binanceOrder.orderId}`;
        order.placedCount = order.placedCount + 1;
        await this.orderRepo.save(order);
        this.sendMsgTelegram(
          `[${order.pair}] [${order.binanceOrderId}]: Place a Retry Order. Price: ${order.price}, Amount: ${order.quantity}`,
        );
      }
    }
  }

  async closeDeal(dealId: number): Promise<void> {
    let deal = await this.getDeal(dealId);
    if (!deal) {
      botLogger.error(`Deal ${dealId} not found`, this.logLabel);
      return;
    }

    // while (deal?.orders.find((o) => o.status === OrderStatus.NEW)) {
    //   await delay(2000);
    //   deal = await this.dealRepo.findOne(dealId);
    // }
    // if (!deal) {
    //   this.logger.error(`Deal ${dealId} not found`);
    //   return;
    // }

    let filledBuyVolume = new BigNumber(0);
    let filledSellVolume = new BigNumber(0);
    const buyOrderSide = getOrderSide(
      deal.strategyDirection,
      ORDER_ACTION_ENUM.OPEN_POSITION,
    );
    for (const order of deal.orders) {
      if (
        // order.side === buyOrderSide &&
        order.status === 'NEW' &&
        order.binanceOrderId
      ) {
        await this.cancelOrder(order);
        order.status = 'CANCELED';
      }
      if (order.filledQuantity > 0) {
        if (order.side === buyOrderSide) {
          filledBuyVolume = filledBuyVolume.plus(
            new BigNumber(order.filledPrice).multipliedBy(order.filledQuantity),
          );
        } else {
          filledSellVolume = filledSellVolume.plus(
            new BigNumber(order.filledPrice).multipliedBy(
              new BigNumber(order.filledQuantity),
            ),
          );
        }
      }
    }
    const profitType = buyOrderSide === OrderSide.BUY ? 1 : -1;
    const profit = filledSellVolume
      .minus(filledBuyVolume)
      .multipliedBy(profitType)
      .toFixed();

    deal.status = DEAL_STATUS.CLOSED;
    deal.endAt = new Date();
    deal.profit = Number(profit);
    await this.dealRepo.save(deal);
    this.sendMsgTelegram(
      `[${deal.pair}]: Deal ${deal.id} closed, profit: ${profit} 💰`,
    );
  }

  async closeAtMarketPrice(dealId: number, userId: number): Promise<void> {
    if (userId !== this.botConfig.userId) {
      this.sendMsgTelegram(`closeAtMarketPrice error .User Id invalid!`);
      return;
    }
    try {
      const activeDeal = await this.dealRepo.findOneBy({
        id: dealId,
        status: DEAL_STATUS.ACTIVE,
        botId: this.botConfig.id,
        userId,
      });
      if (activeDeal) {
        const { totalFilledBuyQuantity } = await this.orderRepo
          .createQueryBuilder('order_entity')
          .select('SUM(order_entity.filled_quantity)', 'totalFilledBuyQuantity')
          .where('order_entity.deal_id = :deal_id', { deal_id: dealId })
          .andWhere('order_entity.side = :side', { side: OrderSide.BUY })
          .getRawOne();

        const { totalFilledSellQuantity } = await this.orderRepo
          .createQueryBuilder('order_entity')
          .select(
            'SUM(order_entity.filled_quantity)',
            'totalFilledSellQuantity',
          )
          .where('order_entity.deal_id = :deal_id', { deal_id: dealId })
          .andWhere('order_entity.side = :side', { side: OrderSide.SELL })
          .getRawOne();
        const filledQty =
          Number(totalFilledBuyQuantity) - Number(totalFilledSellQuantity);
        if (filledQty > 0) {
          const closeMarketOrder = createCloseMarketOrder(
            activeDeal,
            filledQty,
          );
          const exOrder = await this.placeBinanceOrder(closeMarketOrder);
          if (exOrder) {
            closeMarketOrder.status = exOrder.status;
            closeMarketOrder.binanceOrderId = `${exOrder.orderId}`;
            closeMarketOrder.price = Number(exOrder.avgPrice);
            closeMarketOrder.averagePrice = closeMarketOrder.price;
            closeMarketOrder.filledPrice = closeMarketOrder.price;
            closeMarketOrder.volume = Number(exOrder.cumQuote);
            closeMarketOrder.quantity = Number(exOrder.executedQty);
            closeMarketOrder.filledQuantity = closeMarketOrder.quantity;
            closeMarketOrder.placedCount = closeMarketOrder.placedCount + 1;
            console.log(
              '🚀 ~ file: bot-trading.ts:922 ~ BaseBotTrading ~ closeAtMarketPrice ~ closeMarketOrder:',
              closeMarketOrder,
            );
            await this.orderRepo.save(closeMarketOrder);
            await this.closeDeal(dealId);
          } else {
            throw new Error('closeAtMarketPrice() failed!');
          }
        }
      } else {
        this.sendMsgTelegram(`Deal ${dealId} not found`);
      }
    } catch (error) {
      this.sendMsgTelegram(
        `Deal ${dealId} close at market price error! ${error.message}`,
      );
      throw error;
    }
  }
  async watchPosition() {
    if (this.isRunning) {
      const deals = await this.getActiveDeals();
      await this.processActivePosition(deals);
      if (this.botConfig.dealStartCondition === DEAL_START_TYPE.ASAP) {
        await this.startDealASAP(deals);
      }
    }
  }

  private async startDealASAP(existDeals: DealEntity[]): Promise<void> {
    let pairNeedStart: string[] = [];
    const existExchangePair: any = existDeals.reduce((store, cur) => {
      return (store = { ...store, [cur.pair]: cur.pair });
    }, {});
    for (let index = 0; index < this.botConfig.pairs.length; index++) {
      const botPair = this.botConfig.pairs[index];
      if (!existExchangePair[botPair.exchangePair]) {
        pairNeedStart.push(botPair.exchangePair);
      }
    }
    for (let i = 0; i < pairNeedStart.length; i++) {
      try {
        const isValidPair = await this.checkValidPair(pairNeedStart[i]);
        const isValidActiveDealCount = await this.checkMaxActiveDeal();
        if (isValidActiveDealCount && isValidPair) {
          const pairItem = pairNeedStart[i];
          const binanceUSDM = this._exchangeRemote.getCcxtExchange();
          const funding = await wrapExReq(
            binanceUSDM.fetchFundingRate(pairItem),
            botLogger,
          );
          const markPrice = funding.markPrice;
          if (markPrice) {
            await this.createAndPlaceBaseOrder(
              pairItem,
              new BigNumber(markPrice),
            );
          }
        } //end if
      } catch (ex) {
        botLogger.error(
          `${pairNeedStart[i]} startDealASAP error${ex.message}`,
          this.logLabel,
        );
      } //end try
    } //end for
  }

  abstract processActivePosition(activeDeals: DealEntity[]);
  abstract processBotEventAction(payload: CombineReduceEventTypes);
}

import BigNumber from 'bignumber.js';
import {
  FuturesOrder as BinanceOrder,
  OrderSide,
  OrderStatus,
  OrderType,
  FuturesOrderType_LT,
} from 'binance-api-node';
import {
  BotTradingEntity,
  DEAL_START_TYPE,
} from 'src/modules/entities/bot.entity';
import {
  CLIENT_DEAL_TYPE,
  DEAL_STATUS,
  DealEntity,
} from 'src/modules/entities/deal.entity';
import {
  BuyOrder,
  CLIENT_ORDER_TYPE,
  OrderEntity,
  createOrderEntity,
} from 'src/modules/entities/order.entity';
import {
  AbstractExchangeAPI,
  ExchangeFactory,
} from 'src/modules/exchange/remote-api/exchange.remote.api';
import { TelegramService } from 'src/modules/telegram/telegram.service';
import { Repository } from 'typeorm';
import {
  calcPriceSpread,
  calculateBuyDCAOrders,
  createNextTPOrder,
  createStopLossOrder,
} from './bot-utils-calc';
import { ITVPayload, TVActionType } from '../dto/deal-tv.payload';
import { botLogger } from 'src/common/logger';

interface IBaseBotTrading {
  botConfig: BotTradingEntity;
  _exchangeRemote: AbstractExchangeAPI;
  watchPosition(): Promise<void>;
  updateConfig(partConfig: Partial<BotTradingEntity>): void;
  start(): Promise<boolean>;
  stop(): void;
}
const MAX_RETRY = 5;

export abstract class BaseBotTrading implements IBaseBotTrading {
  botConfig: BotTradingEntity;

  _exchangeRemote: AbstractExchangeAPI;

  protected isRunning: boolean;

  protected readonly dealRepo: Repository<DealEntity>;

  protected readonly orderRepo: Repository<OrderEntity>;

  protected readonly telegramService: TelegramService;

  protected logLabel: string;

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
    this.logLabel = `Bot#${config.id} ${config.name}`;
  }
  private sendMsgTelegram(msg: string): void {
    botLogger.info(msg, { label: this.logLabel });
    if (this.botConfig.exchange.user.telegramChatId) {
      this.telegramService.sendMessageToUser(
        this.botConfig.exchange.user.telegramChatId,
        msg,
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
  private async placeBinanceOrder(
    order: OrderEntity,
  ): Promise<BinanceOrder | undefined> {
    try {
      let params: any = {
        positionSide: this.botConfig.strategyDirection,
        newClientOrderId: order.id,
      };
      let ex_orderType: FuturesOrderType_LT = OrderType.LIMIT;

      switch (order.clientOrderType) {
        case CLIENT_ORDER_TYPE.BASE:
          if (this.botConfig.startOrderType !== 'LIMIT') {
            ex_orderType = OrderType.MARKET;
          }
          break;
        case CLIENT_ORDER_TYPE.SAFETY:
          ex_orderType = OrderType.LIMIT;
          break;
        case CLIENT_ORDER_TYPE.STOP_LOSS:
        case CLIENT_ORDER_TYPE.REDUCE:
          ex_orderType = OrderType.STOP;
          params = { ...params, stopPrice: order.price };
          break;
        case CLIENT_ORDER_TYPE.TAKE_PROFIT:
          ex_orderType = 'LIMIT';
          params = { ...params };
          break;
        default:
          ex_orderType = OrderType.LIMIT;
          break;
      }
      botLogger.info(`${order.id} , ${JSON.stringify(params)}`, {
        label: this.logLabel,
      });
      const symbol = order.pair;
      const side = order.side;
      const quantity = order.quantity;
      const price = order.price;
      const leverage = this.botConfig.leverage;
      this._exchangeRemote
        .getCcxtExchange()
        .setLeverage(leverage, symbol, { marginMode: 'cross' });
      const newOrder = await this._exchangeRemote
        .getCcxtExchange()
        .createOrder(
          symbol,
          ex_orderType as any,
          side as any,
          quantity,
          price,
          params,
        );

      botLogger.info(
        `${order.id}/${newOrder.id}: New ${order.side} order has been placed`,
        { label: this.logLabel },
      );
      return newOrder.info;
    } catch (err) {
      botLogger.error('Failed to place order' + err.message, {
        label: this.logLabel,
      });
    }
  }

  async cancelOrder(order: OrderEntity): Promise<void> {
    try {
      const result = await this._exchangeRemote
        .getCcxtExchange()
        .cancelOrder(order.binanceOrderId, order.pair, {});

      botLogger.info(
        `${result.side} order ${result.orderId} has been cancelled, status ${result.status}`,
        { label: this.logLabel },
      );
    } catch (err) {
      botLogger.error('Failed to cancel order ' + order.binanceOrderId, {
        label: this.logLabel,
      });
    }
  }

  updateConfig(partConfig: Partial<BotTradingEntity>) {
    this.botConfig = { ...this.botConfig, ...partConfig };
  }

  async start(): Promise<boolean> {
    try {
      const exchangeRow = this.botConfig.exchange;
      const _exchange = ExchangeFactory.createExchange(
        exchangeRow.name,
        exchangeRow.apiKey,
        exchangeRow.apiSecret,
        exchangeRow.isTestNet,
      );
      const exInfo = await _exchange.checkExchangeOnlineStatus();
      if (exInfo) {
        this._exchangeRemote = _exchange;
        this.isRunning = true;
        this.sendMsgTelegram('Bot is Starting #' + this.botConfig.id);
        // this._exchangeRemote.getCcxtExchange().getSib
        return true;
      }
      botLogger.error('Cannot connect to Exchange API!', {
        label: this.logLabel,
      });
      return false;
    } catch (ex) {
      botLogger.error('Start Bot error: ' + ex.message, {
        label: this.logLabel,
      });
      return false;
    }
  }

  stop() {
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
      where: {
        id,
      },
    });
  }

  private async createDeal(buyOrders: BuyOrder[]): Promise<DealEntity> {
    const deal = new DealEntity();
    deal.userId = this.botConfig.userId;
    deal.botId = this.botConfig.id;
    deal.exchangeId = this.botConfig.exchange.id;
    deal.clientDealType = CLIENT_DEAL_TYPE.DCA;
    deal.pair = buyOrders[0].pair;
    deal.baseOrderSize = this.botConfig.baseOrderSize;
    deal.safetyOrderSize = this.botConfig.safetyOrderSize;
    deal.strategyDirection = this.botConfig.strategyDirection;
    deal.startOrderType = OrderType.LIMIT;
    deal.dealStartCondition = this.botConfig.dealStartCondition;
    deal.targetProfitPercentage = this.botConfig.targetProfitPercentage;
    deal.targetStopLossPercentage = this.botConfig.targetStopLossPercentage;
    deal.maxSafetyTradesCount = this.botConfig.maxSafetyTradesCount;
    deal.maxActiveSafetyTradesCount = this.botConfig.maxActiveSafetyTradesCount;
    deal.priceDeviationPercentage = this.botConfig.priceDeviationPercentage;
    deal.safetyOrderVolumeScale = this.botConfig.safetyOrderVolumeScale;
    deal.safetyOrderStepScale = this.botConfig.safetyOrderStepScale;
    deal.useStopLoss = this.botConfig.useStopLoss;
    deal.status = DEAL_STATUS.CREATED;
    deal.startAt = new Date();
    deal.orders = [];
    await this.dealRepo.save(deal);
    for (const buyOrder of buyOrders) {
      const order = createOrderEntity(buyOrder, deal);
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
    const spread = new BigNumber(0.11).dividedBy(100);
    const newPrice =
      this.botConfig.startOrderType === 'LIMIT'
        ? currentPrice
        : calcPriceSpread(
            this.botConfig.strategyDirection,
            currentPrice,
            spread,
          );
    try {
      const buyOrders = this.createBuyOrder(symbol, newPrice);
      const newDealEntity = await this.createDeal(buyOrders);
      const baseOrderEntity = newDealEntity.orders.find(
        (o) =>
          o.side === 'BUY' &&
          o.status === 'CREATED' &&
          o.clientOrderType === CLIENT_ORDER_TYPE.BASE,
      );
      if (baseOrderEntity) {
        const binanceSafety = await this.placeBinanceOrder(baseOrderEntity);
        baseOrderEntity.status = OrderStatus.NEW;
        baseOrderEntity.binanceOrderId = `${binanceSafety.orderId}`;
        await this.orderRepo.save(baseOrderEntity);
        this.sendMsgTelegram(
          `${baseOrderEntity.pair}/${baseOrderEntity.binanceOrderId}: Started a new Base Order. Price: ${baseOrderEntity.price}, Amount: ${baseOrderEntity.quantity}`,
        );
        await this.dealRepo.update(newDealEntity.id, {
          status: DEAL_STATUS.ACTIVE,
        });
      }
    } catch (ex) {
      this.sendMsgTelegram(`${symbol}: Placing base Order error!`);
    }
  }

  async processTvAction(tv: ITVPayload): Promise<void> {
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
    const isValidMaxDeal = await this.checkMaxActiveDeal();
    if (isValidMaxDeal === false) {
      return;
    }
    switch (tv.action) {
      case TVActionType.OPEN_DEAL:
        await this.createAndPlaceBaseOrder(
          existingPair.exchangePair,
          new BigNumber(tv.price),
        );
        break;
      default:
        break;
    }
    return;
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
    } = executionReportEvt;
    const filledPrice = Number(price) > 0 ? price : avgPrice;
    const currentOrder = await this.orderRepo.findOne({
      relations: ['deal'],
      where: {
        id: clientOrderId,
      },
    });
    if (!currentOrder) {
      botLogger.info(`Order ${clientOrderId} not found`, {
        label: this.logLabel,
      });
      return;
    }
    if (!deal) {
      botLogger.warn(`Invalid deal ${currentOrder.deal.id}`, {
        label: this.logLabel,
      });
      return;
    }

    if (currentOrder.side === 'BUY') {
      switch (orderStatus) {
        case 'NEW':
          if (currentOrder.status === 'CREATED') {
            currentOrder.binanceOrderId = `${orderId}`;
            currentOrder.status = OrderStatus.NEW;
            await this.orderRepo.save(currentOrder);
            botLogger.info(
              `${currentOrder.pair}/${currentOrder.binanceOrderId}: NEW buy order. Price: ${filledPrice}, Amount: ${currentOrder.quantity}`,
              {
                label: this.logLabel,
              },
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
              (o) => o.side === 'SELL' && o.status === 'NEW',
            );
            if (existingSellOrder) {
              await this.cancelOrder(existingSellOrder);
            }

            currentOrder.binanceOrderId = `${orderId}`;
            currentOrder.status = OrderStatus.FILLED;
            currentOrder.filledPrice = Number(filledPrice);
            await this.orderRepo.save(currentOrder);
            const title = currentOrder.sequence > 0 ? 'Safety' : 'Base';
            this.sendMsgTelegram(
              `${currentOrder.pair}/${currentOrder.binanceOrderId}: ${title} order ${currentOrder.side} has been FILLED. Price: ${filledPrice}, Amount: ${currentOrder.quantity}`,
            );
            // Cancel existing sell order (if any)
            // and create a new take-profit order

            //placing TP line
            let newSellOrder = createNextTPOrder(deal, currentOrder);
            newSellOrder = await this.orderRepo.save(newSellOrder);
            const bSellOrder = await this.placeBinanceOrder(newSellOrder);
            if (bSellOrder) {
              newSellOrder.status = OrderStatus.NEW;
              newSellOrder.binanceOrderId = `${bSellOrder.orderId}`;
              this.sendMsgTelegram(
                `${newSellOrder.pair}/${newSellOrder.binanceOrderId}: Place new Take Profit Order. Price: ${newSellOrder.price}, Amount: ${newSellOrder.quantity}`,
              );
            } else {
              newSellOrder.status = 'PLACING';
              newSellOrder.retryCount = newSellOrder.retryCount + 1;
              this.sendMsgTelegram(
                `${newSellOrder.pair}:Error on placing a new Take Profit Order!. Price: ${newSellOrder.price}, Amount: ${newSellOrder.quantity}`,
              );
            }
            await this.orderRepo.save(newSellOrder);
            //end placing TP line

            //placing next safety
            const nextsafety = deal.orders.find(
              (o) =>
                o.side === 'BUY' &&
                o.status === 'CREATED' &&
                o.sequence === currentOrder.sequence + 1,
            );

            if (nextsafety) {
              const binanceSafety = await this.placeBinanceOrder(nextsafety);
              if (binanceSafety) {
                nextsafety.status = OrderStatus.NEW;
                nextsafety.binanceOrderId = `${binanceSafety.orderId}`;
                this.sendMsgTelegram(
                  `${nextsafety.pair}/${nextsafety.binanceOrderId}: Place new Safety Order. Price: ${nextsafety.price}, Amount: ${nextsafety.quantity}`,
                );
              } else {
                nextsafety.status = 'PLACING';
                nextsafety.retryCount = nextsafety.retryCount + 1;
                this.sendMsgTelegram(
                  `${nextsafety.pair}:Error on placing a new  Safety Order. Price: ${nextsafety.price}, Amount: ${nextsafety.quantity}`,
                );
              }
              await this.orderRepo.save(nextsafety);
            }
            //end placing next safety

            //placing stoploss
            const isLastSO = currentOrder.sequence >= deal.maxSafetyTradesCount;
            if (isLastSO && deal.useStopLoss) {
              const stlOrder = createStopLossOrder(deal, currentOrder);
              const binanceStl = await this.placeBinanceOrder(stlOrder);
              if (binanceStl) {
                stlOrder.status = OrderStatus.NEW;
                stlOrder.binanceOrderId = `${binanceStl.orderId}`;
                this.sendMsgTelegram(
                  `${stlOrder.pair}/${stlOrder.binanceOrderId}: Place new Stop Loss Order. Price: ${stlOrder.price}, Amount: ${stlOrder.quantity}`,
                );
              } else {
                stlOrder.status = 'PLACING';
                stlOrder.retryCount = stlOrder.retryCount + 1;
                this.sendMsgTelegram(
                  `${stlOrder.pair}:Error on placing a new Stop Loss Order. Price: ${stlOrder.price}, Amount: ${stlOrder.quantity}`,
                );
              }
              await this.orderRepo.save(stlOrder);
            }
            //end placing next stoploss
          }
          break;

        case 'PARTIALLY_FILLED':
        case 'CANCELED':
        case 'REJECTED':
        case 'EXPIRED':
          currentOrder.status = orderStatus;
          await this.orderRepo.save(currentOrder);
          botLogger.info(
            `${currentOrder.pair}/${currentOrder.binanceOrderId}: Buy order is ${orderStatus}. Price: ${price}, Amount: ${currentOrder.quantity}`,
            {
              label: this.logLabel,
            },
          );
          break;

        default:
          botLogger.error(`Invalid order status : ${orderStatus}`, {
            label: this.logLabel,
          });
      }
    } else {
      if (orderStatus !== 'NEW') {
        currentOrder.status = orderStatus;
        currentOrder.binanceOrderId = `${orderId}`;
        currentOrder.filledPrice = Number(filledPrice);
        await this.orderRepo.update(currentOrder.id, {
          status: orderStatus,
          binanceOrderId: `${orderId}`,
        });
        botLogger.info(
          `${currentOrder.pair}/${currentOrder.binanceOrderId}: Sell order is ${orderStatus}.`,
          {
            label: this.logLabel,
          },
        );
      }
      if (orderStatus === 'FILLED') {
        // currentOrder.status = orderStatus;
        // currentOrder.binanceOrderId = `${orderId}`;
        // await this.orderRepo.save(currentOrder);
        botLogger.info(
          `${currentOrder.pair}/${currentOrder.binanceOrderId}: Sell order is ${orderStatus}. Price: ${filledPrice}, Amount: ${currentOrder.quantity}`,
          {
            label: this.logLabel,
          },
        );
        await this.closeDeal(deal.id);
      }
    }
  }
  async doTryPlacingOrder(deal_Id: number): Promise<void> {
    const ordersOnPlacing = await this.orderRepo.findBy({
      deal: {
        id: deal_Id,
        status: DEAL_STATUS.ACTIVE,
      },
      status: 'PLACING',
    });
    for (let index = 0; index < ordersOnPlacing.length; index++) {
      const order = ordersOnPlacing[index];
      const binanceOrder = await this.placeBinanceOrder(order);
      if (binanceOrder) {
        order.status = OrderStatus.NEW;
        order.binanceOrderId = `${binanceOrder.orderId}`;
        this.sendMsgTelegram(
          `${order.pair}/${order.binanceOrderId}: Place a Retry Order. Price: ${order.price}, Amount: ${order.quantity}`,
        );
      } else {
        order.status = 'PLACING';
        order.retryCount = order.retryCount + 1;
        this.sendMsgTelegram(
          `${order.pair}:Error on placing a Retry Order!. Client Order ID#: ${
            order.id
          }, RetryCount: ${order.retryCount - 1}`,
        );
      }
      await this.orderRepo.save(order);
    }
  }

  async closeDeal(dealId: number): Promise<void> {
    let deal = await this.getDeal(dealId);
    if (!deal) {
      botLogger.error(`Deal ${dealId} not found`, {
        label: this.logLabel,
      });
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
    for (const order of deal.orders) {
      if (
        order.side === OrderSide.BUY &&
        order.status === 'NEW' &&
        order.binanceOrderId
      ) {
        await this.cancelOrder(order);
        order.status = 'CANCELED';
      }
      if (order.side === OrderSide.BUY) {
        if (order.status === 'FILLED') {
          filledBuyVolume = filledBuyVolume.plus(
            new BigNumber(order.filledPrice).multipliedBy(order.quantity),
          );
        }
      } else {
        if (order.status === 'FILLED') {
          filledSellVolume = filledSellVolume.plus(
            new BigNumber(order.price).multipliedBy(
              new BigNumber(order.quantity),
            ),
          );
        }
      }
    }
    const profit = filledSellVolume.minus(filledBuyVolume).toFixed();

    deal.status = DEAL_STATUS.CLOSED;
    deal.endAt = new Date();
    deal.profit = Number(profit);
    await this.dealRepo.save(deal);
    this.sendMsgTelegram(
      `${deal.pair} : Deal ${deal.id} closed, profit: ${profit}`,
    );
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
      const pairItem = pairNeedStart[i];
      const binanceUSDM = this._exchangeRemote.getCcxtExchange();
      const ticker = await binanceUSDM.fetchTicker(pairItem);
      const lastPrice = ticker.last;
      if (lastPrice) {
        await this.createAndPlaceBaseOrder(pairItem, new BigNumber(lastPrice));
      }
    }
  }

  abstract processActivePosition(activeDeals: DealEntity[]);
}

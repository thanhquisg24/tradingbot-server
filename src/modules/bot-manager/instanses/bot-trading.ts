import { Logger } from '@nestjs/common';
import BigNumber from 'bignumber.js';
import {
  Order as BinanceOrder,
  OrderSide,
  OrderStatus,
  OrderType,
} from 'binance-api-node';
import { getNewUUid } from 'src/common/utils/hash-util';
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
import { calculateBuyDCAOrders } from './bot-utils-calc';
import { ITVPayload, TVActionType } from '../dto/deal-tv.payload';

interface IBaseBotTrading {
  botConfig: BotTradingEntity;
  _exchangeRemote: AbstractExchangeAPI;
  watchPosition(): Promise<void>;
  updateConfig(partConfig: Partial<BotTradingEntity>): void;
  start(): Promise<boolean>;
  stop(): void;
}

export abstract class BaseBotTrading implements IBaseBotTrading {
  botConfig: BotTradingEntity;

  _exchangeRemote: AbstractExchangeAPI;

  protected isRunning: boolean;

  protected readonly dealRepo: Repository<DealEntity>;

  protected readonly orderRepo: Repository<OrderEntity>;

  protected readonly telegramService: TelegramService;

  protected logger: Logger;

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
  }
  private sendMsgTelegram(msg: string): void {
    this.logger.log(msg);
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
      let orderType: OrderType = OrderType.LIMIT;

      switch (order.clientOrderType) {
        case CLIENT_ORDER_TYPE.BASE:
        case CLIENT_ORDER_TYPE.SAFETY:
          orderType = OrderType.LIMIT;
          break;
        case CLIENT_ORDER_TYPE.STOP_LOSS:
        case CLIENT_ORDER_TYPE.REDUCE:
          orderType = OrderType.STOP;
          params = { ...params, stopPrice: order.price };
          break;
        case CLIENT_ORDER_TYPE.TAKE_PROFIT:
          orderType = OrderType.TAKE_PROFIT_MARKET;
          params = { ...params, stopPrice: order.price };
          break;
        default:
          orderType = OrderType.LIMIT;
          break;
      }

      const symbol = order.pair;
      const side = order.side;
      const quantity = order.quantity;
      const price = order.price;
      this._exchangeRemote
        .getCcxtExchange()
        .setLeverage(10, symbol, { marginMode: 'cross' });
      const newOrder = await this._exchangeRemote
        .getCcxtExchange()
        .createOrder(
          symbol,
          orderType as any,
          side as any,
          quantity,
          price,
          params,
        );

      this.logger.log(
        `${order.id}/${newOrder.id}: New ${order.side} order has been placed`,
      );
      return newOrder.info;
    } catch (err) {
      this.logger.error('Failed to place order', order, err);
    }
  }

  async cancelOrder(order: OrderEntity): Promise<void> {
    try {
      const result = await this._exchangeRemote
        .getCcxtExchange()
        .cancelOrder(order.binanceOrderId, order.pair, {});
      this.logger.log(
        `${result.side} order ${result.orderId} has been cancelled, status ${result.status}`,
      );
    } catch (err) {
      this.logger.error('Failed to cancel order', order, err);
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
      console.log(
        '🚀 ~ file: bot-trading.ts:169 ~ BaseBotTrading ~ start ~ exInfo:',
        exInfo,
      );
      if (exInfo) {
        this._exchangeRemote = _exchange;
        this.isRunning = true;
        this.logger = new Logger('Bot #' + this.botConfig.id);
        this.sendMsgTelegram('Bot is Starting #' + this.botConfig.id);
        // this._exchangeRemote.getCcxtExchange().getSib
        return true;
      }
      this.logger.error('Cannot connect to Exchange API!');
      return false;
    } catch (ex) {
      this.logger.error('Start Bot error: ' + ex.message);
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
    try {
      const buyOrders = this.createBuyOrder(symbol, currentPrice);
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
    } = executionReportEvt;
    const currentOrder = await this.orderRepo.findOne({
      relations: ['deal'],
      where: {
        id: clientOrderId,
      },
    });
    if (!currentOrder) {
      this.logger.log(`Order ${clientOrderId} not found`);
      return;
    }
    if (!deal) {
      this.logger.warn(`Invalid deal ${currentOrder.deal.id}`);
      return;
    }

    if (currentOrder.side === 'BUY') {
      switch (orderStatus) {
        case 'NEW':
          if (currentOrder.status === 'CREATED') {
            currentOrder.binanceOrderId = `${orderId}`;
            currentOrder.status = OrderStatus.NEW;
            await this.orderRepo.save(currentOrder);
            this.logger.log(
              `${currentOrder.pair}/${currentOrder.binanceOrderId}: NEW buy order. Price: ${price}, Amount: ${currentOrder.quantity}`,
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
            currentOrder.filledPrice = Number(price);
            await this.orderRepo.save(currentOrder);
            this.logger.log(
              `${currentOrder.pair}/${currentOrder.binanceOrderId}: Buy order ${currentOrder.side} has been FILLED. Price: ${price}, Amount: ${currentOrder.quantity}`,
            );
            // Cancel existing sell order (if any)
            // and create a new take-profit order

            let newSellOrder = new OrderEntity();
            newSellOrder.id = getNewUUid();
            newSellOrder.deal = deal;
            newSellOrder.side = OrderSide.SELL;
            newSellOrder.status = 'CREATED';
            newSellOrder.price = currentOrder.exitPrice;
            newSellOrder.quantity = currentOrder.totalQuantity;
            newSellOrder.volume = new BigNumber(currentOrder.exitPrice)
              .multipliedBy(currentOrder.totalQuantity)
              .toNumber();
            newSellOrder.sequence = 1000 + currentOrder.sequence;
            newSellOrder.botId = this.botConfig.id;
            newSellOrder.exchangeId = this.botConfig.exchange.id;
            newSellOrder.userId = this.botConfig.userId;
            newSellOrder.clientOrderType = CLIENT_ORDER_TYPE.TAKE_PROFIT;
            newSellOrder.pair = currentOrder.pair;
            newSellOrder = await this.orderRepo.save(newSellOrder);

            const bSellOrder = await this.placeBinanceOrder(newSellOrder);
            if (bSellOrder) {
              newSellOrder.status = OrderStatus.NEW;
              newSellOrder.binanceOrderId = `${bSellOrder.orderId}`;
              newSellOrder = await this.orderRepo.save(newSellOrder);
              this.logger.log(
                `${newSellOrder.pair}/${newSellOrder.binanceOrderId}: Place new Take Profit Order. Price: ${newSellOrder.price}, Amount: ${newSellOrder.quantity}`,
              );
            }
            const nextsafety = deal.orders.find(
              (o) =>
                o.side === 'BUY' &&
                o.status === 'CREATED' &&
                o.sequence === currentOrder.sequence + 1,
            );
            if (nextsafety) {
              const binanceSafety = await this.placeBinanceOrder(nextsafety);
              nextsafety.status = OrderStatus.NEW;
              nextsafety.binanceOrderId = `${binanceSafety.orderId}`;
              await this.orderRepo.save(nextsafety);
              this.logger.log(
                `${nextsafety.pair}/${nextsafety.binanceOrderId}: Place new Safety Order. Price: ${nextsafety.price}, Amount: ${nextsafety.quantity}`,
              );
            }
          }
          break;

        case 'PARTIALLY_FILLED':
        case 'CANCELED':
        case 'REJECTED':
        case 'EXPIRED':
          currentOrder.status = orderStatus;
          await this.orderRepo.save(currentOrder);
          this.logger.log(
            `${currentOrder.pair}/${currentOrder.binanceOrderId}: Buy order is ${orderStatus}. Price: ${price}, Amount: ${currentOrder.quantity}`,
          );
          break;

        default:
          this.logger.error('Invalid order status', orderStatus);
      }
    } else {
      // currentOrder.status = orderStatus;
      // currentOrder.binanceOrderId = `${orderId}`;
      // await this.orderRepo.save(currentOrder);
      // this.logger.log(
      //   `${currentOrder.pair}/${currentOrder.binanceOrderId}: Sell order is ${orderStatus}. Price: ${price}, Amount: ${currentOrder.quantity}`,
      // );

      if (orderStatus === 'FILLED') {
        await this.closeDeal(deal.id);
      }
    }
  }

  async closeDeal(dealId: number): Promise<void> {
    let deal = await this.getDeal(dealId);
    if (!deal) {
      this.logger.error(`Deal ${dealId} not found`);
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
    this.logger.log(`Deal ${deal.id} closed, profit: ${profit}`);
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

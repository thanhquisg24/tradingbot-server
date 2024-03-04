import {
  BuyOrder,
  OrderEntity,
  createOrderEntity,
} from 'src/modules/entities/order.entity';
import {
  DEAL_STATUS,
  STRATEGY_DIRECTION,
} from 'src/modules/entities/enum-type';
import {
  ORDER_ACTION_ENUM,
  createMarketBaseOrder,
  getOrderSide,
} from './bot-utils-calc';

import { BaseBotTrading } from './bot-trading';
import BigNumber from 'bignumber.js';
import { BotTradingEntity } from 'src/modules/entities/bot.entity';
import { CombineReduceEventTypes } from 'src/common/event/reduce_events';
import { DealEntity } from 'src/modules/entities/deal.entity';
import { ICommonFundingStartDeal } from 'src/common/event/funding_events';
import { Repository } from 'typeorm';
import { TelegramService } from 'src/modules/telegram/telegram.service';
import { botLogger } from 'src/common/bot-logger';

export class FundingBot extends BaseBotTrading {
  constructor(
    config: BotTradingEntity,
    dealRepo: Repository<DealEntity>,
    orderRepo: Repository<OrderEntity>,
    telegramService: TelegramService,
  ) {
    super(config, dealRepo, orderRepo, telegramService);
  }
  handleLastSO(deal: DealEntity, currentOrder: OrderEntity): Promise<void> {
    return;
  }
  processActivePosition(activeDeals: DealEntity[]) {
    return;
  }
  async processBotEventAction(
    payload: CombineReduceEventTypes,
  ): Promise<boolean> {
    return false;
  }

  async watchPosition() {
    return;
  }

  async checkAndCloseMarketOrder(dealId: number) {
    await this.closeAtMarketPrice(dealId, this.botConfig.userId);
    // const binanceUSDM = this._exchangeRemote.getCcxtExchange();
    // const exchangeOrder = await wrapExReq(
    //   binanceUSDM.fetchOrder(stlOrder.binanceOrderId, stlOrder.pair),
    //   botLogger,
    // );
    // const orderStatus = exchangeOrder.info.status;
    // if (orderStatus === 'FILLED') {
    //   await this.closeDeal(stlOrder.deal.id);
    // } else {
    //   await this.closeAtMarketPrice(stlOrder.deal.id, this.botConfig.userId);
    // }
  }
  async createAndPlaceFundingDeal(payload: ICommonFundingStartDeal) {
    let newDealEntity: DealEntity | null = null;
    const { baseOrderSize } = this.botConfig;
    const _strategyDirection =
      payload.fundingData.fundingRate > 0
        ? STRATEGY_DIRECTION.SHORT
        : STRATEGY_DIRECTION.LONG;
    const symbol = payload.fundingData.symbol;
    const currentPrice = new BigNumber(payload.fundingData.indexPrice);
    const prepareBaseOrder = createMarketBaseOrder(
      this._exchangeRemote.getCcxtExchange(),
      _strategyDirection,
      symbol,
      currentPrice,
      baseOrderSize,
    );
    console.log(
      '🚀 ~ file: bot-funding.ts:75 ~ FundingBot ~ createAndPlaceFundingDeal ~ prepareBaseOrder:',
      JSON.stringify(prepareBaseOrder),
    );
    const binanceMarketBaseOrder = await this.placeBinanceOrder(
      prepareBaseOrder,
      _strategyDirection,
    );
    if (binanceMarketBaseOrder) {
      const filledPrice =
        Number(binanceMarketBaseOrder.avgPrice) > 0
          ? binanceMarketBaseOrder.avgPrice
          : binanceMarketBaseOrder.price;
      const _filledPrice = new BigNumber(filledPrice);
      const _quantity = new BigNumber(binanceMarketBaseOrder.executedQty);
      //buy
      const _buy_orderSide = getOrderSide(
        _strategyDirection,
        ORDER_ACTION_ENUM.OPEN_POSITION,
      );
      const b: BuyOrder = {
        side: _buy_orderSide,
        pair: symbol,
        sequence: 0,
        deviation: 0,
        volume: _quantity.multipliedBy(_filledPrice).toNumber(),
        price: 0,
        averagePrice: Number(filledPrice),
        quantity: _quantity.toNumber(),
        totalQuantity: _quantity.toNumber(),
        totalVolume: _quantity.multipliedBy(_filledPrice).toNumber(),
        exitPrice: 0,
      };

      newDealEntity = await this.createDeal([], symbol, _strategyDirection);
      const newBaseOrder = createOrderEntity(b, newDealEntity);
      newBaseOrder.status = 'FILLED';
      newBaseOrder.price = b.averagePrice;
      newBaseOrder.averagePrice = b.averagePrice;
      newBaseOrder.filledPrice = b.averagePrice;
      newBaseOrder.filledQuantity = b.totalQuantity;
      newBaseOrder.volume = b.totalVolume;
      newBaseOrder.quantity = b.totalQuantity;
      newBaseOrder.binanceOrderId = `${binanceMarketBaseOrder.orderId}`;
      newBaseOrder.placedCount = newBaseOrder.placedCount + 1;
      await this.orderRepo.save(newBaseOrder); //1 base
      await this.dealRepo.update(newDealEntity.id, {
        status: DEAL_STATUS.ACTIVE,
      });

      // const createdSTLOrder = createStopLossOrder(newDealEntity, resBaseOrder);
      // if (this.botConfig.useStopLoss === false) {
      //   const priceStopCalc = calcPriceByDeviation(
      //     strategyDirection,
      //     _filledPrice,
      //     new BigNumber(Math.abs(payload.fundingData.fundingRate)),
      //   );
      //   const strTriggerPrice = this._exchangeRemote
      //     .getCcxtExchange()
      //     .priceToPrecision(symbol, priceStopCalc.toNumber());
      //   createdSTLOrder.price = Number(strTriggerPrice);
      // }
      // const binancePlaceStlOrder = await this.placeBinanceOrder(
      //   createdSTLOrder,
      // );
      // if (binancePlaceStlOrder) {
      //   createdSTLOrder.status = OrderStatus.NEW;
      //   createdSTLOrder.binanceOrderId = `${binanceMarketBaseOrder.orderId}`;
      //   createdSTLOrder.placedCount = createdSTLOrder.placedCount + 1;
      // }
      // const newStl = await this.orderRepo.save(createdSTLOrder); //2 stl

      setTimeout(
        async () => await this.checkAndCloseMarketOrder(newDealEntity.id),
        payload.closeAtMarketTimeOut,
      );
      this.sendMsgTelegram(
        `[${newBaseOrder.pair}] [${
          newBaseOrder.binanceOrderId
        }]: Place a Funding rate Order. Price: ${
          newBaseOrder.averagePrice
        }, Amount: ${newBaseOrder.quantity}. Rates: ${
          payload.fundingData.fundingRate * 100
        }`,
      );
    }
  }
  async startFundingDeal(payload: ICommonFundingStartDeal) {
    try {
      const exchangePair = payload.fundingData.symbol;
      const isValidPair = await this.checkValidPair(exchangePair);
      const isValidActiveDealCount = await this.checkMaxActiveDeal();
      //max trading fee = 0.04 %
      const MINIMUM_FUNDING_RATE_TO_STARTED = new BigNumber(
        this.botConfig.minFundingRateStart,
      ).dividedBy(100);
      // 0.0015; //0.005;
      const isValidRequiredMinRate =
        Math.abs(payload.fundingData.fundingRate) >=
        MINIMUM_FUNDING_RATE_TO_STARTED.toNumber();
      console.log(
        '🚀 ~ file: bot-funding.ts:166 ~ FundingBot ~ startFundingDeal ~ isValidActiveDealCount:',
        isValidActiveDealCount,
        isValidPair,
        isValidRequiredMinRate,
      );
      if (isValidActiveDealCount && isValidPair && isValidRequiredMinRate) {
        await this.createAndPlaceFundingDeal(payload);
      } //end if
    } catch (ex) {
      console.log(
        '🚀 ~ file: bot-funding.ts:166 ~ FundingBot ~ startFundingDeal ~ ex:',
        ex,
      );
      botLogger.error(
        `${payload.fundingData.symbol} startFundingDeal error${ex.message}`,
        this.logLabel,
      );
    } //end try
  }
}

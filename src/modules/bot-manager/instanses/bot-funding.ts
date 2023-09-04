import {
  BotTradingEntity,
  STRATEGY_DIRECTION,
} from 'src/modules/entities/bot.entity';
import { Repository } from 'typeorm';
import { BaseBotTrading } from './bot-trading';
import { DealEntity } from 'src/modules/entities/deal.entity';
import { TelegramService } from 'src/modules/telegram/telegram.service';
import {
  BuyOrder,
  OrderEntity,
  createOrderEntity,
} from 'src/modules/entities/order.entity';
import { CombineReduceEventTypes } from 'src/common/event/reduce_events';
import { ICommonFundingStartDeal } from 'src/common/event/funding_events';
import { botLogger } from 'src/common/bot-logger';
import {
  calcPriceByDeviation,
  createMarketBaseOrder,
  createStopLossOrder,
} from './bot-utils-calc';
import BigNumber from 'bignumber.js';
import { OrderSide, OrderStatus } from 'binance-api-node';
import { wrapExReq } from 'src/modules/exchange/remote-api/exchange.helper';

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
  processBotEventAction(payload: CombineReduceEventTypes) {
    return;
  }

  async watchPosition() {
    return;
  }

  async checkAndCloseMarketOrder(stlOrder: OrderEntity) {
    const binanceUSDM = this._exchangeRemote.getCcxtExchange();
    const exchangeOrder = await wrapExReq(
      binanceUSDM.fetchOrder(stlOrder.binanceOrderId, stlOrder.pair),
      botLogger,
    );
    const orderStatus = exchangeOrder.info.status;
    if (orderStatus === 'FILLED') {
      await this.closeDeal(stlOrder.deal.id);
    } else {
      await this.closeAtMarketPrice(stlOrder.deal.id, this.botConfig.userId);
    }
  }
  async createAndPlaceFundingDeal(payload: ICommonFundingStartDeal) {
    let newDealEntity: DealEntity | null = null;
    const { baseOrderSize } = this.botConfig;
    const strategyDirection =
      payload.fundingData.fundingRate > 0
        ? STRATEGY_DIRECTION.SHORT
        : STRATEGY_DIRECTION.LONG;
    const symbol = payload.fundingData.symbol;
    const currentPrice = new BigNumber(payload.fundingData.indexPrice);
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
      const _filledPrice = new BigNumber(filledPrice);
      const _quantity = new BigNumber(binanceMarketBaseOrder.executedQty);
      //buy
      const b: BuyOrder = {
        side: OrderSide.BUY,
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

      newDealEntity = await this.createDeal([], prepareBaseOrder.id);
      const newBaseOrder = createOrderEntity(b, newDealEntity);
      newBaseOrder.status = 'FILLED';
      newBaseOrder.binanceOrderId = `${binanceMarketBaseOrder.orderId}`;
      newBaseOrder.placedCount = newBaseOrder.placedCount + 1;
      const resBaseOrder = await this.orderRepo.save(newBaseOrder); //1 base

      const createdSTLOrder = createStopLossOrder(newDealEntity, resBaseOrder);
      if (this.botConfig.useStopLoss === false) {
        const priceStopCalc = calcPriceByDeviation(
          strategyDirection,
          _filledPrice,
          new BigNumber(Math.abs(payload.fundingData.fundingRate)),
        );
        const strTriggerPrice = this._exchangeRemote
          .getCcxtExchange()
          .priceToPrecision(symbol, priceStopCalc.toNumber());
        createdSTLOrder.price = Number(strTriggerPrice);
      }
      const binancePlaceStlOrder = await this.placeBinanceOrder(
        createdSTLOrder,
      );
      if (binancePlaceStlOrder) {
        createdSTLOrder.status = OrderStatus.NEW;
        createdSTLOrder.binanceOrderId = `${binanceMarketBaseOrder.orderId}`;
        createdSTLOrder.placedCount = createdSTLOrder.placedCount + 1;
      }
      const newStl = await this.orderRepo.save(createdSTLOrder); //2 stl

      setTimeout(
        async () => await this.checkAndCloseMarketOrder(newStl),
        payload.closeAtMarketTimeOut,
      );
    }
  }
  async startFundingDeal(payload: ICommonFundingStartDeal) {
    try {
      const exchangePair = payload.fundingData.symbol;
      const isValidPair = await this.checkValidPair(exchangePair);
      const isValidActiveDealCount = await this.checkMaxActiveDeal();
      //max trading fee = 0.04 %
      const MINIMUM_FUNDING_RATE_TO_STARTED = 0.005;
      const isValidRequiredMinRate =
        Math.abs(payload.fundingData.fundingRate) >=
        MINIMUM_FUNDING_RATE_TO_STARTED;
      if (isValidActiveDealCount && isValidPair && isValidRequiredMinRate) {
        await this.createAndPlaceFundingDeal(payload);
      } //end if
    } catch (ex) {
      botLogger.error(
        `${payload.fundingData.symbol} startFundingDeal error${ex.message}`,
        this.logLabel,
      );
    } //end try
  }
}

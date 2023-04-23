import BigNumber from 'bignumber.js';
import { OrderSide } from 'binance-api-node';
import { Exchange } from 'ccxt';
import { last } from 'lodash';
import {
  IReducePreparePayload,
  createReducePrepareEvent,
} from 'src/common/event/reduce_events';
import { getNewUUid } from 'src/common/utils/hash-util';
import {
  BotTradingEntity,
  STRATEGY_DIRECTION,
} from 'src/modules/entities/bot.entity';
import { DealEntity } from 'src/modules/entities/deal.entity';
import {
  BuyOrder,
  CLIENT_ORDER_TYPE,
  OrderEntity,
} from 'src/modules/entities/order.entity';

export enum ORDER_ACTION_ENUM {
  CLOSE_POSITION = 'CLOSE_POSITION',
  OPEN_POSITION = 'OPEN_POSITION',
}
export const getOrderSide = (
  strategyDirection: STRATEGY_DIRECTION,
  actionType: ORDER_ACTION_ENUM,
) => {
  let orderSide = OrderSide.BUY;
  switch (actionType) {
    case ORDER_ACTION_ENUM.OPEN_POSITION:
      orderSide =
        strategyDirection === STRATEGY_DIRECTION.LONG
          ? OrderSide.BUY
          : OrderSide.SELL;
      break;
    case ORDER_ACTION_ENUM.CLOSE_POSITION:
      orderSide =
        strategyDirection === STRATEGY_DIRECTION.LONG
          ? OrderSide.SELL
          : OrderSide.BUY;
      break;
  }
  return orderSide;
};

export function calcPositionQuantity(usdtAmt: number, positionPrice: number) {
  return usdtAmt / positionPrice;
}

export function calcPriceSpread(
  direction: STRATEGY_DIRECTION,
  _price: BigNumber,
  _spread: BigNumber,
) {
  if (direction === STRATEGY_DIRECTION.LONG) {
    return _price.multipliedBy(_spread.plus(1));
  }
  return _price.multipliedBy(BigNumber(1).minus(_spread));
}
export function calcDaviationBetween(
  direction: STRATEGY_DIRECTION,
  price1: BigNumber,
  price2: BigNumber,
) {
  const priceHigher: BigNumber = price1.isGreaterThan(price2) ? price1 : price2;
  const priceLower: BigNumber = price1.isLessThan(price2) ? price1 : price2;
  if (direction === STRATEGY_DIRECTION.LONG) {
    return priceHigher
      .minus(priceLower)
      .dividedBy(priceHigher)
      .decimalPlaces(2);
  }
  return priceHigher.minus(priceLower).dividedBy(priceLower).decimalPlaces(2);
}
export function calcTp(
  direction: STRATEGY_DIRECTION,
  avg_price: BigNumber,
  target_profit_percent: BigNumber,
) {
  if (direction === STRATEGY_DIRECTION.LONG) {
    return avg_price.multipliedBy(target_profit_percent.plus(1));
  }
  return avg_price.multipliedBy(BigNumber(1).minus(target_profit_percent));
}

export function calcPriceByDeviation(
  direction: STRATEGY_DIRECTION,
  currentPrice: BigNumber,
  deviation: BigNumber,
) {
  if (direction === STRATEGY_DIRECTION.LONG) {
    return currentPrice.multipliedBy(new BigNumber(1).minus(deviation));
  }
  return currentPrice.multipliedBy(new BigNumber(1).plus(deviation));
}
export function calcPriceByPrevDeviation(
  direction: STRATEGY_DIRECTION,
  prevPrice: BigNumber,
  preDeviation: BigNumber,
  nextDeviation: BigNumber,
) {
  if (direction === STRATEGY_DIRECTION.LONG) {
    return prevPrice
      .multipliedBy(new BigNumber(1).minus(nextDeviation))
      .dividedBy(new BigNumber(1).minus(preDeviation));
  }
  return prevPrice
    .multipliedBy(new BigNumber(1).plus(nextDeviation))
    .dividedBy(new BigNumber(1).plus(preDeviation));
}

export const calculateBuyDCAOrders = (
  symbol: string,
  currentPrice: BigNumber,
  config: BotTradingEntity,
  exchange: Exchange,
): BuyOrder[] => {
  const baseOrderSize = new BigNumber(config.baseOrderSize);
  const safetyOrderSize = new BigNumber(config.safetyOrderSize);
  const targetProfit = new BigNumber(config.targetProfitPercentage).dividedBy(
    100,
  );
  const priceDeviation = new BigNumber(
    config.priceDeviationPercentage,
  ).dividedBy(100);
  const { maxSafetyTradesCount, strategyDirection } = config;
  const safetyOrderVolumeScale = new BigNumber(config.safetyOrderVolumeScale);
  const safetyOrderStepScale = new BigNumber(config.safetyOrderStepScale);
  const side = getOrderSide(strategyDirection, ORDER_ACTION_ENUM.OPEN_POSITION);
  const orders: BuyOrder[] = [];
  for (
    let safeTypeTradeCount = 0;
    safeTypeTradeCount <= maxSafetyTradesCount;
    safeTypeTradeCount++
  ) {
    if (!safeTypeTradeCount) {
      const quantity = Number(
        exchange.amountToPrecision(
          symbol,
          baseOrderSize.dividedBy(currentPrice).toNumber(),
        ),
      );

      orders.push({
        side,
        pair: symbol,
        sequence: 0,
        deviation: 0,
        volume: currentPrice.multipliedBy(quantity).toNumber(),
        price: currentPrice.toNumber(),
        averagePrice: currentPrice.toNumber(),
        quantity,
        totalQuantity: quantity,
        totalVolume: currentPrice.multipliedBy(quantity).toNumber(),
        exitPrice: Number(
          exchange.priceToPrecision(
            symbol,
            calcTp(strategyDirection, currentPrice, targetProfit).toNumber(),
          ),
        ),
      });
    } else {
      const volume = safetyOrderSize.multipliedBy(
        safetyOrderVolumeScale.exponentiatedBy(safeTypeTradeCount - 1),
      );
      const deviation = priceDeviation.multipliedBy(
        new BigNumber(1)
          .minus(safetyOrderStepScale.exponentiatedBy(safeTypeTradeCount))
          .dividedBy(new BigNumber(1).minus(safetyOrderStepScale)),
      );
      const price = Number(
        exchange.priceToPrecision(
          symbol,
          calcPriceByDeviation(strategyDirection, currentPrice, deviation),
        ),
      );
      const quantity = Number(
        exchange.amountToPrecision(symbol, volume.dividedBy(price)),
      );
      const revisedVolume = new BigNumber(price).multipliedBy(quantity);
      const totalVolume = BigNumber.sum(
        ...[...orders.map((o) => o.volume), revisedVolume],
      );
      const totalQuantity = new BigNumber(quantity).plus(
        last(orders)?.totalQuantity ?? 0,
      );
      const averagePrice = totalVolume.dividedBy(totalQuantity);

      orders.push({
        side,
        pair: symbol,
        sequence: safeTypeTradeCount,
        deviation: deviation.multipliedBy(100).toNumber(),
        volume: revisedVolume.toNumber(),
        price,
        quantity,
        totalQuantity: totalQuantity.toNumber(),
        totalVolume: totalVolume.toNumber(),
        averagePrice: averagePrice.toNumber(),
        exitPrice: Number(
          exchange.priceToPrecision(
            symbol,
            calcTp(strategyDirection, averagePrice, targetProfit).toNumber(),
          ),
        ),
      });
    }
  }

  return orders;
};

export const createMarketBaseOrder = (
  exchange: Exchange,
  strategyDirection: STRATEGY_DIRECTION,
  pair: string,
  price: BigNumber,
  baseOrderSize: number,
) => {
  const quantity = Number(
    exchange.amountToPrecision(
      pair,
      new BigNumber(baseOrderSize).dividedBy(price).toNumber(),
    ),
  );
  let newBaseOrder = new OrderEntity();
  newBaseOrder.id = getNewUUid();
  newBaseOrder.side = getOrderSide(
    strategyDirection,
    ORDER_ACTION_ENUM.OPEN_POSITION,
  );
  newBaseOrder.status = 'CREATED';
  newBaseOrder.price = price.toNumber();
  newBaseOrder.quantity = quantity;
  newBaseOrder.volume = 0;
  newBaseOrder.sequence = 0;
  newBaseOrder.botId = 0;
  newBaseOrder.exchangeId = 0;
  newBaseOrder.userId = 0;
  newBaseOrder.clientOrderType = CLIENT_ORDER_TYPE.BASE;
  newBaseOrder.pair = pair;
  return newBaseOrder;
};

export const createCloseMarketOrder = (
  deal: DealEntity,
  totalQuantity: number,
) => {
  let newSellOrder = new OrderEntity();
  newSellOrder.id = getNewUUid();
  newSellOrder.deal = deal;
  newSellOrder.side = getOrderSide(
    deal.strategyDirection,
    ORDER_ACTION_ENUM.CLOSE_POSITION,
  );
  newSellOrder.status = 'CREATED';
  newSellOrder.price = 0;
  newSellOrder.quantity = totalQuantity;
  newSellOrder.volume = 0;
  newSellOrder.sequence = 9999;
  newSellOrder.botId = deal.botId;
  newSellOrder.exchangeId = deal.exchangeId;
  newSellOrder.userId = deal.userId;
  newSellOrder.clientOrderType = CLIENT_ORDER_TYPE.CLOSE_AT_MARKET;
  newSellOrder.pair = deal.pair;
  return newSellOrder;
};

export const createMarketOrder = (
  deal: DealEntity,
  price: number,
  qty: number,
  orderAction: ORDER_ACTION_ENUM,
  clientOrderType: CLIENT_ORDER_TYPE,
  sequence: number,
) => {
  let newOrder = new OrderEntity();
  newOrder.id = getNewUUid();
  newOrder.deal = deal;
  newOrder.side = getOrderSide(deal.strategyDirection, orderAction);
  newOrder.status = 'CREATED';
  newOrder.price = price;
  newOrder.quantity = qty;
  newOrder.volume = price * qty;
  newOrder.averagePrice = price;
  newOrder.sequence = sequence;
  newOrder.botId = deal.botId;
  newOrder.exchangeId = deal.exchangeId;
  newOrder.userId = deal.userId;
  newOrder.clientOrderType = clientOrderType;
  newOrder.pair = deal.pair;
  return newOrder;
};

export const createNextTPOrder = (
  deal: DealEntity,
  currentOrder: OrderEntity,
  _clientOrderType?: CLIENT_ORDER_TYPE,
) => {
  let newSellOrder = new OrderEntity();
  newSellOrder.id = getNewUUid();
  newSellOrder.deal = deal;
  newSellOrder.side = getOrderSide(
    deal.strategyDirection,
    ORDER_ACTION_ENUM.CLOSE_POSITION,
  );
  newSellOrder.status = 'CREATED';
  newSellOrder.price = currentOrder.exitPrice;
  newSellOrder.quantity = currentOrder.totalQuantity;
  newSellOrder.volume = new BigNumber(currentOrder.exitPrice)
    .multipliedBy(currentOrder.totalQuantity)
    .toNumber();
  newSellOrder.sequence = 1000 + currentOrder.sequence;
  newSellOrder.botId = deal.botId;
  newSellOrder.exchangeId = deal.exchangeId;
  newSellOrder.userId = deal.userId;
  newSellOrder.clientOrderType =
    _clientOrderType || CLIENT_ORDER_TYPE.TAKE_PROFIT;
  newSellOrder.pair = currentOrder.pair;
  return newSellOrder;
};

export const createStopLossOrder = (deal: DealEntity, lastSO: OrderEntity) => {
  const prevDeviation = new BigNumber(lastSO.deviation).dividedBy(100);
  const nextDeviation = new BigNumber(deal.targetStopLossPercentage).dividedBy(
    100,
  );
  let newSTLOrder = new OrderEntity();
  newSTLOrder.id = getNewUUid();
  newSTLOrder.deal = deal;
  newSTLOrder.side = getOrderSide(
    deal.strategyDirection,
    ORDER_ACTION_ENUM.CLOSE_POSITION,
  );
  newSTLOrder.status = 'CREATED';
  newSTLOrder.price = calcPriceByPrevDeviation(
    deal.strategyDirection,
    new BigNumber(lastSO.price),
    prevDeviation,
    nextDeviation,
  ).toNumber();
  newSTLOrder.quantity = lastSO.totalQuantity;
  newSTLOrder.volume = new BigNumber(newSTLOrder.price)
    .multipliedBy(lastSO.totalQuantity)
    .toNumber();
  newSTLOrder.sequence = 1000 + lastSO.sequence;
  newSTLOrder.botId = deal.botId;
  newSTLOrder.exchangeId = deal.exchangeId;
  newSTLOrder.userId = deal.userId;
  newSTLOrder.clientOrderType = CLIENT_ORDER_TYPE.STOP_LOSS;
  newSTLOrder.pair = lastSO.pair;
  return newSTLOrder;
};

export const calcReducePreparePayload = (
  data: {
    fromStrategyDirection: STRATEGY_DIRECTION;
    fromDealId: number;
    toBotId: number;
    pair: string;
    quantity: number;
    avgPrice: number;
    currentPrice: number;
    percentNextMove: number;
    round_count: number;
  },
  exchange: Exchange,
) => {
  const {
    fromStrategyDirection,
    fromDealId,
    toBotId,
    pair,
    quantity,
    avgPrice,
    currentPrice,
    percentNextMove,
    round_count,
  } = data;
  console.log('🚀 ~ file: bot-utils-calc.ts:381 ~ data:', data);
  const _percentNextMove = new BigNumber(percentNextMove).dividedBy(100);
  const _avgPrice = new BigNumber(avgPrice);
  const _currentPrice = new BigNumber(currentPrice);
  const triggerPriceCalc = calcPriceByDeviation(
    fromStrategyDirection,
    _currentPrice,
    _percentNextMove,
  );
  const strTriggerPrice = exchange.priceToPrecision(pair, triggerPriceCalc);
  const _triggerPriceExchange = new BigNumber(strTriggerPrice);
  const _tpDeviation = calcDaviationBetween(
    fromStrategyDirection,
    _avgPrice,
    _triggerPriceExchange,
  );
  const payload: IReducePreparePayload = {
    fromDealId,
    pair,
    r_quantity: new BigNumber(quantity),
    tp_deviation: _tpDeviation,
    triger_price: _triggerPriceExchange,
    round_count: round_count,
    toBotId,
  };
  return createReducePrepareEvent(payload);
};

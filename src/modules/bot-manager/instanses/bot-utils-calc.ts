import BigNumber from 'bignumber.js';
import { OrderSide } from 'binance-api-node';
import { Exchange } from 'ccxt';
import { last } from 'lodash';
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

export const createNextTPOrder = (
  deal: DealEntity,
  currentOrder: OrderEntity,
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
  newSellOrder.clientOrderType = CLIENT_ORDER_TYPE.TAKE_PROFIT;
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

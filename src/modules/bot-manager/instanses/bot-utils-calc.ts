import BigNumber from 'bignumber.js';
import { Exchange } from 'ccxt';
import { last } from 'lodash';
import {
  BotTradingEntity,
  STRATEGY_DIRECTION,
} from 'src/modules/entities/bot.entity';
import { BuyOrder } from 'src/modules/entities/order.entity';

export function calcPositionQuantity(usdtAmt: number, positionPrice: number) {
  return usdtAmt / positionPrice;
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

export function calcPriceByDevation(
  direction: STRATEGY_DIRECTION,
  currentPrice: BigNumber,
  deviation: BigNumber,
) {
  if (direction === STRATEGY_DIRECTION.LONG) {
    return currentPrice.multipliedBy(new BigNumber(1).minus(deviation));
  }
  return currentPrice.multipliedBy(new BigNumber(1).plus(deviation));
}

export const calculateBuyOrders = (
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
          calcPriceByDevation(strategyDirection, currentPrice, deviation),
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

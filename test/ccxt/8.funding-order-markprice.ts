// Example code in typescript
// Based on /examples/js/fetch-from-many-exchanges-simultaneously.js

import * as ccxt from 'ccxt';
import BigNumber from 'bignumber.js';
import { OrderType } from 'binance-api-node';
interface IPERCENT_PRICE_FILTER {
  multiplierDown: string;
  multiplierUp: string;
  multiplierDecimal: string;
  filterType: 'PERCENT_PRICE';
}

export function calcPriceByDeviation(
  direction: 'LONG' | 'SHORT',
  currentPrice: BigNumber,
  deviation: BigNumber,
) {
  if (direction === 'LONG') {
    return currentPrice.multipliedBy(new BigNumber(1).minus(deviation));
  }
  return currentPrice.multipliedBy(new BigNumber(1).plus(deviation));
}

function getDecidePositionQuantity(usdtAmt: number, positionPrice: number) {
  return usdtAmt / positionPrice;
}
function percentPriceFilter(
  percentFilter: IPERCENT_PRICE_FILTER,
  markPrice: number,
  side: 'BUY' | 'SELL',
): BigNumber {
  let price: BigNumber = new BigNumber(markPrice);
  if (side === 'BUY') {
    //BUY: price <= markPrice * multiplierUp is valid
    const markPriceUp = price.multipliedBy(
      new BigNumber(percentFilter.multiplierUp),
    );
    //price greater than markPriceUp
    price = price.comparedTo(markPriceUp) === 1 ? markPriceUp : price;
  } else {
    //SELL: price >= markPrice * multiplierDown
    const markPriceDown = price.multipliedBy(
      new BigNumber(percentFilter.multiplierDown),
    );
    //price less than markPriceUp
    price = price.comparedTo(markPriceDown) === -1 ? markPriceDown : price;
  }
  return price;
}
const createOrder = async () => {
  const binanceUSDM = new ccxt.binanceusdm({
    enableRateLimit: true,
    apiKey: '6daad7c6adaef564f0aefe6d444d03319d97f004a700e315df79442641dd9466',
    secret: 'adb86ea2f7250a8fcd6059336544ee5a5efc047418a7966047da41713d91d705',
  });
  binanceUSDM.setSandboxMode(true);
  await binanceUSDM.loadMarkets();
  const symbol = 'BTC/USDT:USDT';
  const fun = await binanceUSDM.fetchFundingRate(symbol);

  const qty = 0.1;
  const params = { positionSide: 'LONG', newOrderRespType: 'RESULT' };
  binanceUSDM.setLeverage(10, symbol, { marginMode: 'isolated' });
  const ex_orderType = OrderType.MARKET;
  const side = 'BUY';
  const newOrder = await binanceUSDM.createOrder(
    symbol,
    ex_orderType as any,
    side as any,
    qty,
    fun.markPrice,
    params,
  );

  if (newOrder) {
    const stlPercent = new BigNumber(5).dividedBy(100);
    const priceStopCalc = calcPriceByDeviation(
      'LONG',
      new BigNumber(newOrder.average),
      stlPercent,
    );
    const stlPrice = binanceUSDM.priceToPrecision(symbol, priceStopCalc);
    const stoplossOrder = await binanceUSDM.createOrder(
      symbol,
      OrderType.STOP,
      'SELL',
      qty,
      stlPrice,
      { positionSide: 'LONG', stopPrice: stlPrice, newOrderRespType: 'RESULT' },
    );

    console.log(
      '🚀 ~ file: 2.create-order.ts:24 ~ stoplossOrder ~ newOrder:',
      stoplossOrder,
    );
    if (stoplossOrder) {
      setTimeout(async () => {
        const closeMartket = await binanceUSDM.createOrder(
          symbol,
          OrderType.MARKET,
          'SELL',
          qty,
          fun.markPrice,
          { positionSide: 'LONG', newOrderRespType: 'RESULT' },
        );
        console.log(
          '🚀 ~ file: 8.funding-order-markprice.ts:107 ~ setTimeout ~ closeMartket:',
          closeMartket,
        );
        if (closeMartket) {
          console.log(
            '🚀 ~ file: 8.funding-order-markprice.ts:113 ~ setTimeout ~ stoplossOrder.id:',
            stoplossOrder.id,
          );
          await binanceUSDM.cancelOrder(stoplossOrder.id, symbol);
        }
      }, 15000);
    }
  }
};
createOrder().then();

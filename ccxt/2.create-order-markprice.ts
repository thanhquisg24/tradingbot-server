// Example code in typescript
// Based on /examples/js/fetch-from-many-exchanges-simultaneously.js

import * as ccxt from 'ccxt';
import BigNumber from 'bignumber.js';
interface IPERCENT_PRICE_FILTER {
  multiplierDown: string;
  multiplierUp: string;
  multiplierDecimal: string;
  filterType: 'PERCENT_PRICE';
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
  const symbol = 'MANA/USDT:USDT';
  const marketFilter = binanceUSDM.market(symbol);
  const fun = await binanceUSDM.fetchFundingRate(symbol);
  const { markPrice } = fun;
  const percentFilter = marketFilter.info.filters.find(
    (o) => o.filterType === 'PERCENT_PRICE',
  );
  const _price = percentPriceFilter(percentFilter, markPrice, 'SELL');
  const amount = 200;
  const params = { positionSide: 'LONG', newOrderRespType: 'RESULT' };
  binanceUSDM.setLeverage(10, symbol, { marginMode: 'cross' });
  const newOrder = await binanceUSDM.createMarketBuyOrder(
    symbol,
    amount,
    params,
  );
  console.log(
    '🚀 ~ file: 2.create-order.ts:24 ~ createOrder ~ newOrder:',
    newOrder,
  );
};
createOrder().then();

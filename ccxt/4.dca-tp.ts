// Example code in typescript
// Based on /examples/js/fetch-from-many-exchanges-simultaneously.js

import ccxt from 'ccxt';

function getDecidePositionQuantity(usdtAmt: number, positionPrice: number) {
  return usdtAmt / positionPrice;
}
const createExchange = () => {
  const binanceUSDM = new ccxt.pro.binanceusdm({
    enableRateLimit: true,
    apiKey: '6daad7c6adaef564f0aefe6d444d03319d97f004a700e315df79442641dd9466',
    secret: 'adb86ea2f7250a8fcd6059336544ee5a5efc047418a7966047da41713d91d705',
  });
  binanceUSDM.setSandboxMode(true);
  return binanceUSDM;
};
const exchange = createExchange();
const bookOrder = async () => {
  const symbol = 'BTC/USDT:USDT';
  exchange.setLeverage(10, symbol, { marginMode: 'cross' });
  const orderbook = await exchange.fetchOrderBook(symbol, 5);
  const bid = orderbook.bids.length ? orderbook.bids[0][0] : undefined;
  if (bid) {
    const price = bid;
    const amount = getDecidePositionQuantity(300, price);
    const params = { positionSide: 'LONG' };
    const newOrder = await exchange.createLimitBuyOrder(
      symbol,
      amount,
      price,
      params,
    );
    console.log(
      '🚀 ~ file: 2.create-order.ts:24 ~ createOrder ~ newOrder:',
      newOrder,
    );
    return newOrder;
  }
};

// const watchDogOrder()

// dcaTp().then();

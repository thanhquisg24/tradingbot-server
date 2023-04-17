// Example code in typescript
// Based on /examples/js/fetch-from-many-exchanges-simultaneously.js

import * as ccxt from 'ccxt';

function getDecidePositionQuantity(usdtAmt: number, positionPrice: number) {
  return usdtAmt / positionPrice;
}

const createOrder = async () => {
  const binanceUSDM = new ccxt.binanceusdm({
    enableRateLimit: true,
    apiKey: '6daad7c6adaef564f0aefe6d444d03319d97f004a700e315df79442641dd9466',
    secret: 'adb86ea2f7250a8fcd6059336544ee5a5efc047418a7966047da41713d91d705',
  });
  binanceUSDM.setSandboxMode(true);
  const symbol = 'BTC/USDT:USDT';
  const price = 27900;
  const amount = getDecidePositionQuantity(300, price);
  const params = { positionSide: 'SHORT', newOrderRespType: 'RESULT' };
  binanceUSDM.setLeverage(10, symbol, { marginMode: 'cross' });
  const newOrder = await binanceUSDM.createMarketSellOrder(
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

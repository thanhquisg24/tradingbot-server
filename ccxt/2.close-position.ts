// Example code in typescript
// Based on /examples/js/fetch-from-many-exchanges-simultaneously.js

import * as ccxt from 'ccxt';

function getDecidePositionQuantity(usdtAmt: number, positionPrice: number) {
  return usdtAmt / positionPrice;
}

const closePosition = async () => {
  const binanceUSDM = new ccxt.binanceusdm({
    enableRateLimit: true,
    apiKey: '6daad7c6adaef564f0aefe6d444d03319d97f004a700e315df79442641dd9466',
    secret: 'adb86ea2f7250a8fcd6059336544ee5a5efc047418a7966047da41713d91d705',
  });
  binanceUSDM.setSandboxMode(true);
  const symbol = 'BTC/USDT:USDT';
  const price = 28130;
  const amount = getDecidePositionQuantity(150, price);
  const params = { positionSide: 'SHORT' };
  const side = 'buy';
  binanceUSDM.setLeverage(10, symbol, { marginMode: 'cross' });
  const newOrder = await binanceUSDM.createOrder(
    symbol,
    'limit',
    side,
    amount,
    price,
    params,
  );
  console.log(
    '🚀 ~ file: 2.create-order.ts:24 ~ closePosition ~ newOrder:',
    newOrder,
  );
};
closePosition().then();

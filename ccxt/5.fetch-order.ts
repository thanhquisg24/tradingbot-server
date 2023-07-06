// Example code in typescript
// Based on /examples/js/fetch-from-many-exchanges-simultaneously.js

import * as ccxt from 'ccxt';

function getDecidePositionQuantity(usdtAmt: number, positionPrice: number) {
  return usdtAmt / positionPrice;
}

const fetch = async () => {
  const binanceUSDM = new ccxt.binanceusdm({
    enableRateLimit: true,
    apiKey: '6daad7c6adaef564f0aefe6d444d03319d97f004a700e315df79442641dd9466',
    secret: 'adb86ea2f7250a8fcd6059336544ee5a5efc047418a7966047da41713d91d705',
  });
  binanceUSDM.setSandboxMode(true);
  const symbol = 'SOL/USDT:USDT';
  const orderId = '51785297';
  const oeder = await binanceUSDM.fetchOrder(orderId, symbol);
  console.log('🚀 ~ file: 5.fetch-order.ts:20 ~ fetch ~ oeder:', oeder);
};
fetch().then();

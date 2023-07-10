// Example code in typescript
// Based on /examples/js/fetch-from-many-exchanges-simultaneously.js

import * as ccxt from 'ccxt';

function getDecidePositionQuantity(usdtAmt: number, positionPrice: number) {
  return usdtAmt / positionPrice;
}
const editCancel = async () => {
  const binanceUSDM = new ccxt.binanceusdm({
    enableRateLimit: true,
    apiKey: '6daad7c6adaef564f0aefe6d444d03319d97f004a700e315df79442641dd9466',
    secret: 'adb86ea2f7250a8fcd6059336544ee5a5efc047418a7966047da41713d91d705',
  });
  binanceUSDM.setSandboxMode(true);
  const order_id = '3307290769';
  const symbol = 'BTC/USDT:USDT';
  const cancelOrder = await binanceUSDM.cancelOrder(order_id, symbol, {});
  console.log(
    '🚀 ~ file: 3.edit-cancel-order.ts:18 ~ editCancel ~ cancelOrder:',
    cancelOrder,
  );
};
editCancel().then();

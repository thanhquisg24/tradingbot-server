// Example code in typescript
// Based on /examples/js/fetch-from-many-exchanges-simultaneously.js

import * as ccxt from 'ccxt';

import BigNumber from 'bignumber.js';
import { get } from 'lodash';

const createOrder = async () => {
  const binanceSpot = new ccxt.binance({
    enableRateLimit: true,
    apiKey: 'HDBjHPLl1MeBvoXL2dH5OjpDeIhGCZfFFLuyQXjo3tU6dOSQCxCgxQ65JyR4u4Vp',
    secret: 'KjXKtIhceOLqaR4SGrIhoRA69It6gxHHI3KbC3swYX23tx6Dl13yWKBC1dxWsssE',
    options: {
      defaultType: 'spot',
      adjustForTimeDifference: true,
    },
  });
  binanceSpot.setSandboxMode(true);

  await binanceSpot.loadMarkets();
  binanceSpot.verbose = true; // uncomment for debugging purposes if necessary
  const symbol = 'AAVE/USDT';
  const lastPriceObj = await binanceSpot.fetchLastPrices([symbol]);
  const lastprice = get(lastPriceObj, [symbol, 'price']);

  const amount = new BigNumber(2000);

  console.log(
    '🚀 ~ file: 1.create_order.ts:30 ~ createOrder ~ lastPrice:',
    lastPriceObj,
    lastprice,
  );
  const quantity = Number(
    binanceSpot.amountToPrecision(
      symbol,
      amount.dividedBy(lastprice).toNumber(),
    ),
  );
  const type = 'market';
  const side = 'buy';
  const params = { newOrderRespType: 'RESULT' };
  const newOrder = await binanceSpot.createOrder(
    symbol,
    type,
    side,
    quantity,
    lastprice,
    params,
  );
  //   const newOrder = await binanceSpot.createMarketBuyOrder(
  //     symbol,
  //     quantity,
  //     params,
  //   );
  console.log(
    '🚀 ~ file: 2.create-order.ts:24 ~ createOrder ~ newOrder:',
    newOrder,
  );
};
createOrder().then();

// const request = this.createOrderRequest (symbol, type, side, amount, price, params);
// let method = 'privatePostOrder';
// if (sor) {
//     method = 'privatePostSorOrder';
// } else if (market['linear']) {
//     method = 'fapiPrivatePostOrder';
// } else if (market['inverse']) {
//     method = 'dapiPrivatePostOrder';
// } else if (marketType === 'margin' || marginMode !== undefined) {
//     method = 'sapiPostMarginOrder';
// }
// if (market['option']) {
//     method = 'eapiPrivatePostOrder';
// }

// Example code in typescript
// Based on /examples/js/fetch-from-many-exchanges-simultaneously.js

import * as ccxt from 'ccxt';
import fs from 'fs';

const fetchAllOrder = async () => {
  const binanceUSDM = new ccxt.binanceusdm({
    enableRateLimit: true,
    // apiKey: '6daad7c6adaef564f0aefe6d444d03319d97f004a700e315df79442641dd9466',
    // secret: 'adb86ea2f7250a8fcd6059336544ee5a5efc047418a7966047da41713d91d705',
    apiKey: 'sw4WVu054BKMAeXGH5caNj1XI31sBtPC0nzhj0Vw0sArdXJP3TkKRDL5tPkhL6oV',
    secret: 'jxZdtOX9ryrOVwN9CGApO56mpQYXtXNRJrchseHuEhX54hVtABGYo1gl54JL3P0Y',
  });
  // binanceUSDM.setSandboxMode(true);
  // const acc = await binanceUSDM.fapiPrivateV2GetAccount();
  const allOrders = await binanceUSDM.fetchOpenOrders('AAVE/USDT:USDT');
  console.log('🚀 ~ fetchAllOrder ~ allOrders:', allOrders.length);
  // console.log('🚀 ~ file: 0.hello.ts:16 ~ fetchTickers ~ symbols:', acc);
  fs.writeFileSync(
    './test/test-allopen-order-info-by-symbol.txt',
    JSON.stringify(allOrders),
  );
  //   binanceUSDM.;
  //   const result = await Promise.all(
  //     exchanges.map(async (id: string): Promise<ccxt.Exchange> => {
  //       const CCXT = ccxt as any; // Hack!
  //       const exchange = new CCXT[id]({ enableRateLimit: true }) as ccxt.Exchange;
  //       const ticker = await exchange.fetchTicker(symbol);
  //       const exchangeExtended = exchange.extend(
  //         { exchange: id },
  //         ticker,
  //       ) as ccxt.Exchange;
  //       return exchangeExtended;
  //     }),
  //   );
  //   console.log('🚀 ~ file: 0.hello.ts:25 ~ fetchTickers ~ result:', result);
};

fetchAllOrder();

// Example code in typescript
// Based on /examples/js/fetch-from-many-exchanges-simultaneously.js

import * as ccxt from 'ccxt';
import fs from 'fs';

const fetchAllOrder = async () => {
  const binanceUSDM = new ccxt.binanceusdm({
    enableRateLimit: true,
    apiKey: 'CXtY79DtMNaPqUlLn1hjHyJRs6WKWtxAdpqNfiAeeAbQRrft40cq8CT7sfILSz53',
    secret: 'ahNrCQzJerTcJGy8GPz1x0AHse1HtyKVs1Nb0x0iPLxkiq1SMmMvai5LFUC3UT3l',
  });
  // binanceUSDM.setSandboxMode(true);
  // const acc = await binanceUSDM.fapiPrivateV2GetAccount();
  const allOrders = await binanceUSDM.fapiPrivateGetOpenOrders();
  console.log('🚀 ~ fetchAllOrder ~ allOrders:', allOrders.length);
  // console.log('🚀 ~ file: 0.hello.ts:16 ~ fetchTickers ~ symbols:', acc);
  fs.writeFileSync(
    './test/luat-allopen-order-info.txt',
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

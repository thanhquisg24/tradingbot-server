// Example code in typescript
// Based on /examples/js/fetch-from-many-exchanges-simultaneously.js

import * as ccxt from 'ccxt';

import fs from 'fs';

const fetchExchangeInfo = async () => {
  const binanceUSDM = new ccxt.binanceusdm({
    enableRateLimit: true,
  });
  binanceUSDM.setSandboxMode(true);

  const marketload = await binanceUSDM.loadMarkets();
  console.log(
    '🚀 ~ fetchExchangeInfo ~  binanceUSDM.rateLimit:',
    binanceUSDM.rateLimit,
  );
  const marketload2 = await binanceUSDM.publicGetExchangeInfo();
  // // marketload.
  console.log(
    '🚀 ~ file: 6.exchange-info.ts:12 ~ fetchExchangeInfo ~ marketload:',
    marketload2['rateLimits'],
  );
  // binanceUSDM.dapi
  // const symbolsUsdt = binanceUSDM.symbols.filter((e) => {
  //   return e.endsWith('USDT');
  // });
  // fs.writeFileSync('./test/exchange_symbols.txt', JSON.stringify(symbolsUsdt));
  // console.log(
  //   '🚀 ~ file: 6.exchange-info.ts:18 ~ fetchExchangeInfo ~ exinfo:',
  //   exinfo.info,
  // );
  // console.log(
  //   '🚀 ~ file: 6.exchange-info.ts:18 ~ fetchExchangeInfo ~ exinfo:',
  //   exinfo.info['rateLimits'],
  // );
  // const marketInfo = await binanceUSDM.fetchMarkets();
  // console.log(
  //   '🚀 ~ file: 6.exchange-info.ts:12 ~ fetchExchangeInfo ~ marketInfo:',
  //   marketInfo[0],
  // );

  // return ticker;
};

fetchExchangeInfo();

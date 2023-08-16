// Example code in typescript
// Based on /examples/js/fetch-from-many-exchanges-simultaneously.js

import * as ccxt from 'ccxt';

import fs from 'fs';

const fetchExchangeInfo = async () => {
  const binanceUSDM = new ccxt.binanceusdm({
    enableRateLimit: true,
  });
  binanceUSDM.setSandboxMode(true);
  // const marketload = await binanceUSDM.loadMarkets();
  // // marketload.
  // console.log(
  //   '🚀 ~ file: 6.exchange-info.ts:12 ~ fetchExchangeInfo ~ marketload:',
  //   marketload['rateLimits'],
  // );
  // binanceUSDM.dapi
  const exinfo = await binanceUSDM.fapiPublicGetExchangeInfo();
  console.log(
    '🚀 ~ file: 6.exchange-info.ts:18 ~ fetchExchangeInfo ~ exinfo:',
    exinfo,
  );
  fs.writeFileSync('exchange_info.txt', JSON.stringify(exinfo));
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

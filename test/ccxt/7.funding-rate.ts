// Example code in typescript
// Based on /examples/js/fetch-from-many-exchanges-simultaneously.js

import * as ccxt from 'ccxt';

import fs from 'fs';

const fetchFundingRate = async () => {
  const binanceUSDM = new ccxt.binanceusdm({
    enableRateLimit: true,
  });
  binanceUSDM.setSandboxMode(false);

  const symbols = ['ARKM/USDT:USDT', 'NMR/USDT:USDT', 'TRB/USDT:USDT'];
  const rates = await binanceUSDM.fetchFundingRates(symbols);
  console.log(
    '🚀 ~ file: 6.exchange-info.ts:18 ~ fetchFundingRate ~ exinfo:',
    rates,
  );
  fs.writeFileSync('./test/rates-info.txt', JSON.stringify(rates));
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
fetchFundingRate();

// Example code in typescript
// Based on /examples/js/fetch-from-many-exchanges-simultaneously.js

import * as ccxt from 'ccxt';

const fetchExchangeInfo = async () => {
  const binanceUSDM = new ccxt.binanceusdm({
    enableRateLimit: true,
  });
  binanceUSDM.setSandboxMode(true);
  await binanceUSDM.loadMarkets();
  // const ticker = await binanceUSDM.fetchTicker(symbol);
  // console.log('🚀 ~ file: 0.hello.ts:38 ~ fetchTicker ~ ticker:', ticker);
  const market = binanceUSDM.market(symbol);
  console.log('🚀 ~ file: 0.hello.ts:41 ~ fetchTicker ~ market:', market);
  console.log(
    '🚀 ~ file: 0.hello.ts:41 ~ fetchTicker ~ marketfilters:',
    market.info.filters,
  );
  const fun = await binanceUSDM.fetchFundingRate(symbol);
  console.log('🚀 ~ file: 0.hello.ts:47 ~ fetchTicker ~ fun:', fun);

  // return ticker;
};
fetchExchangeInfo();

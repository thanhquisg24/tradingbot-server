// Example code in typescript
// Based on /examples/js/fetch-from-many-exchanges-simultaneously.js

import * as ccxt from 'ccxt';
import fs from 'fs';

const fetchSymbol = async () => {
  const binanceUSDM = new ccxt.binanceusdm({
    enableRateLimit: true,
  });
  binanceUSDM.setSandboxMode(true);
  await binanceUSDM.loadMarkets();
  const symbols = binanceUSDM.symbols;
  console.log('🚀 ~ file: 0.hello.ts:16 ~ fetchTickers ~ symbols:', symbols);
  fs.writeFileSync('cctx/binanceUSDM_symbols-2.txt', JSON.stringify(symbols));
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

const fetchTicker = async (symbol: string) => {
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
fetchTicker('MANA/USDT:USDT');

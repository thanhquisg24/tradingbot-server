// Example code in typescript
// Based on /examples/js/fetch-from-many-exchanges-simultaneously.js

import * as ccxt from 'ccxt';

import fs from 'fs';

const fetchSymbol = async () => {
  const binanceSpot = new ccxt.binance({
    enableRateLimit: true,
    apiKey: 'ylMaqLJSBURXwQyeTfxFVA9k74YZuUC3lbtlnQbcPI8j7UHwrxAkSKKKVwQ7Mc4r',
    secret: 'uiWC7lLvkDo8XTnmWpzEb7EEJw5RNHl449twfqQu7zny48JmQ8KDsxgqzPnYErXj',
  });
  binanceSpot.setSandboxMode(true);

  await binanceSpot.loadMarkets();
  const symbolsSpotUsdt = binanceSpot.symbols.filter((e) => {
    return e.endsWith('/USDT');
  });

  fs.writeFileSync(
    './test/spot-symbol-info.txt',
    JSON.stringify(symbolsSpotUsdt),
  );
};

fetchSymbol();

// Example code in typescript
// Based on /examples/js/fetch-from-many-exchanges-simultaneously.js

import * as ccxt from 'ccxt';

const authAPIKey = async () => {
  const binanceUSDM = new ccxt.binanceusdm({
    enableRateLimit: true,
    apiKey: '6daad7c6adaef564f0aefe6d444d03319d97f004a700e315df79442641dd9466',
    secret: 'adb86ea2f7250a8fcd6059336544ee5a5efc047418a7966047da41713d91d705',
  });
  binanceUSDM.setSandboxMode(true);
  const acc = await binanceUSDM.fetchAccounts();
  console.log('🚀 ~ file: 1.auth.ts:14 ~ authAPIKey ~ acc:', acc);
  const bal = await binanceUSDM.fetchBalance({ currency: 'usdt' });
  console.log(
    '🚀 ~ file: 1.auth.ts:16 ~ authAPIKey ~ bal:',
    JSON.stringify(bal),
  );
};
authAPIKey().then();

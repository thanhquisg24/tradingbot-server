// Example code in typescript
// Based on /examples/js/fetch-from-many-exchanges-simultaneously.js

import { DealsParams } from '3commas-typescript/dist/types/types';
import { threecommas_api } from './3commasAPI';

const getActiveDeals = async () => {
  // const rs = await threecommas_api.ping();
  const longBotId = 12881444;
  // const account_id = 32682064;
  const dealParams: DealsParams = {
    scope: 'active',
    bot_id: longBotId,
    base: 'ARBUSDT',
    // quote: 'USDT',
    limit: 100,
  };
  const activeDeals = await threecommas_api.getDeals(dealParams);
  console.log('🚀 ~ pingaccount ~ activeDeals:', activeDeals);
  // return ticker;
};
getActiveDeals();

// Example code in typescript
// Based on /examples/js/fetch-from-many-exchanges-simultaneously.js

// import { DealsParams } from '3commas-typescript/dist/types/types';
import { threecommas_api } from './3commasAPI';

const getSafeTyorder = async () => {
  // const rs = await threecommas_api.ping();
  // const longBotId = 12881444;
  // const account_id = 32682064;
  // const dealParams: DealsParams = {
  //   scope: 'active',
  //   bot_id: longBotId,
  //   account_id,
  // };
  const deal_id = 2256072971; //SUI
  const dealItem = await threecommas_api.getDealSafetyOrders(deal_id);
  console.log('🚀 ~ pingaccount ~ dealItem:', dealItem);
  // return ticker;
};
getSafeTyorder();

// Example code in typescript
// Based on /examples/js/fetch-from-many-exchanges-simultaneously.js

import { threecommas_api } from './3commasAPI';

const pingaccount = async () => {
  const rs = await threecommas_api.ping();
  console.log('🚀 ~ pingaccount ~ rs:', rs);
  // return ticker;
};
pingaccount();

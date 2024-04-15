// Example code in typescript
// Based on /examples/js/fetch-from-many-exchanges-simultaneously.js

// import { DealsParams } from '3commas-typescript/dist/types/types';

const getspilit3commasOrderId = () => {
  const clientOrderId = 'x-Gxt73QE3_t_676397490_0';
  const spilitStr = clientOrderId.split('_');
  if (spilitStr && spilitStr.length > 3) {
    console.log(spilitStr[2]);
  }
};
getspilit3commasOrderId();

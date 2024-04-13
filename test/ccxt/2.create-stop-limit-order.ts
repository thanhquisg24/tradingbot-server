// Example code in typescript
// Based on /examples/js/fetch-from-many-exchanges-simultaneously.js

import { FuturesOrderType_LT, OrderSide, OrderType } from 'binance-api-node';
import * as ccxt from 'ccxt';
import { wrapExReq } from './exchange.helper';

const createOrder = async () => {
  try {
    const binanceUSDM = new ccxt.binanceusdm({
      enableRateLimit: true,
      apiKey:
        '6daad7c6adaef564f0aefe6d444d03319d97f004a700e315df79442641dd9466',
      secret:
        'adb86ea2f7250a8fcd6059336544ee5a5efc047418a7966047da41713d91d705',
    });
    binanceUSDM.setSandboxMode(true);
    const symbol = 'BTC/USDT:USDT';
    const price = 55000;
    const qty = 1;
    let params = {
      positionSide: 'LONG',
      newOrderRespType: 'RESULT',
      // stopPrice: price,
    };
    console.log(
      '🚀 ~ file: 2.create-order.ts:24 ~ createOrder ~ newOrder:',
      ccxt.OrderImmediatelyFillable.name,
    );
    const side = OrderSide.BUY;

    let ex_orderType: FuturesOrderType_LT = OrderType.MARKET;

    binanceUSDM.setLeverage(10, symbol, { marginMode: 'cross' });

    const newOrder = await wrapExReq(
      binanceUSDM.createOrder(symbol, ex_orderType, side, qty, price, params),
    );
    console.log('🚀 ~ createOrder ~ newOrder:', newOrder);
  } catch (e) {
    if (e instanceof ccxt.OrderImmediatelyFillable) {
      console.log(
        '🚀 ~ createOrder ~ OrderImmediatelyFillable________________:ok',
        e.name,
      );
    }
    console.log('🚀 ~ createOrder ~ e:', e);
  }
};
createOrder().then();

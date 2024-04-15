import { PositionSide_LT } from 'binance-api-node';
import { I3CommasDeal, I3CommasOrder } from './three-commas-type';
import { DealsParams } from '3commas-typescript/dist/types/types';
import BigNumber from 'bignumber.js';
import { find } from 'lodash';
import { threecommas_api } from './3commasAPI';

const threeCommasAPI = threecommas_api;

function calcAvgPriceFromArrayOrder(order: { price: number; qty: number }[]) {
  let totalQty = new BigNumber(0);
  let totalVol = new BigNumber(0);
  for (let index = 0; index < order.length; index++) {
    const o = order[index];
    const elementVol = new BigNumber(o.price).multipliedBy(o.qty);
    totalVol = totalVol.plus(elementVol);
    totalQty = totalQty.plus(o.qty);
  }
  if (totalQty.isGreaterThan(0)) {
    const avgPrice = totalVol.dividedBy(totalQty);
    return { avgPrice, totalQty };
  }
  return null;
}

async function fetch3CommasActiveDeals(
  baseSymbol: string,
  side: PositionSide_LT,
): Promise<I3CommasDeal[]> {
  try {
    const threeCommasLongBotId = 12881444;
    const threeCommasShortBotId = 12881479;
    const bot_id =
      side === 'LONG' ? threeCommasLongBotId : threeCommasShortBotId;
    const dealParams: DealsParams = {
      scope: 'active',
      bot_id,
      base: baseSymbol, //'ARBUSDT'
      limit: 100,
    };
    const activeDeals = await threeCommasAPI.getDeals(dealParams);
    return activeDeals;
  } catch (error) {
    console.log('🚀 ~ error:', error);

    return [];
  }
}

async function fetch3CommasOrder(
  three_commas_deal_id: number,
): Promise<I3CommasOrder[]> {
  try {
    const orders = await threeCommasAPI.getDealSafetyOrders(
      three_commas_deal_id,
    );
    return orders;
  } catch (error) {
    console.log('🚀 ~ error:', error);

    return [];
  }
}
const getSpilit3commasOrderId = (clientOrderId: string) => {
  const spilitStr = clientOrderId.split('_');
  if (spilitStr && spilitStr.length > 3) {
    return Number(spilitStr[2]);
  }
  return 0;
};

async function calcDealDataFrom3Commas(
  openOrder: {
    clientOrderId: string;
    symbol: string;
    positionSide: 'LONG' | 'SHORT';
    price: string;
    origQty: string;
  },
  ref3CommasOrderId: number,
) {
  const baseSymbol = openOrder.symbol;
  const side = openOrder.positionSide;
  const activeDeals = await fetch3CommasActiveDeals(baseSymbol, side);
  // console.log('🚀 ~ activeDeals:', activeDeals);
  for (let index = 0; index < activeDeals.length; index++) {
    const deal = activeDeals[index];
    //is Last SO
    if (deal.completed_safety_orders_count + 1 === deal.max_safety_orders) {
      const _orders = await fetch3CommasOrder(deal.id);
      console.log('🚀 ~ _orders:', _orders);
      const _lastSO = find(_orders, (_o) => {
        if (
          Number(_o.order_id) === Number(ref3CommasOrderId) &&
          _o.deal_order_type === 'Safety' &&
          _o.status_string === 'Active'
        ) {
          return true;
        }
        return false;
      });

      //   {
      //   order_id: ref3CommasOrderId,
      //   deal_order_type: 'Safety',
      // });
      // calcDealAveragePrice: Number(binanceUSDM.priceToPrecision(internalExchangeSymbol, calcDealAveragePrice)),
      // calcDealTotalQty: Number(binanceUSDM.amountToPrecision(internalExchangeSymbol, calcDealTotalQty)),
      console.log('🚀 ~ _lastSO:', _lastSO);
      if (_lastSO) {
        const ordersOfDeal = [
          {
            price: Number(deal.bought_average_price),
            qty: Number(deal.bought_amount),
          },
          { price: Number(openOrder.price), qty: Number(openOrder.origQty) },
        ];
        const calcResult = calcAvgPriceFromArrayOrder(ordersOfDeal);
        const rs = { ...calcResult, dealId: deal.id };
        return rs;
      }
    }
  }
  return null;
}

async function main() {
  const openOrder: {
    clientOrderId: string;
    symbol: string;
    positionSide: 'LONG' | 'SHORT';
    price: string;
    origQty: string;
  } = {
    symbol: 'FTMUSDT',
    positionSide: 'LONG',
    price: '0.644500',
    origQty: '38',
    clientOrderId: 'x-Gxt73QE3_t_741761422_0',
  };
  let ref3CommasDealId = 0;
  const ref3CommasOrderId = getSpilit3commasOrderId(openOrder.clientOrderId);
  console.log('🚀 ~ main ~ ref3CommasOrderId:', ref3CommasOrderId);
  let result3CommasCalc: null | {
    dealId: number;
    avgPrice: BigNumber;
    totalQty: BigNumber;
  } = null;
  if (threeCommasAPI !== null && threeCommasAPI !== undefined) {
    result3CommasCalc = await calcDealDataFrom3Commas(
      openOrder,
      ref3CommasOrderId,
    );
  }
  console.log('🚀 ~ main ~ result3CommasCalc:', {
    avgPrice: result3CommasCalc.avgPrice.toNumber(),
    totalQty: result3CommasCalc.totalQty.toNumber(),
    dealId: result3CommasCalc.dealId,
  });
  const timeoutss = setTimeout(async () => console.log('aaaaa'), 3000);
}
main();

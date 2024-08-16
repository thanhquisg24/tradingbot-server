import {
  I3CommasDeal,
  I3CommasDealWithOrders,
  I3CommasOrder,
} from './three-commas-type';

import { DealsParams } from '3commas-typescript/dist/types/types';
import fs from 'fs';
import { threecommas_api } from "./3commasAPI";

async function fetch3CommasOrder(
  three_commas_deal_id: number,
): Promise<I3CommasOrder[]> {
  try {
    const orders = await threecommas_api.getDealSafetyOrders(
      three_commas_deal_id,
    );
    return orders;
  } catch (error) {

    return [];
  }
}

async function fetchAll3CommasActiveDeals(): Promise<I3CommasDeal[]> {
  try {
    const dealParams: DealsParams = {
      scope: 'active',
      limit: 3,
    };
    const activeDeals = await threecommas_api.getDeals(dealParams);
    return activeDeals;
  } catch (error) {

    return [];
  }
}
async function fetchAllLastSO3CommasActiveDeals(): Promise<
  I3CommasDealWithOrders[]
> {
  try {
    const activeDeals = await fetchAll3CommasActiveDeals();
    // const activeDealsLastSO = activeDeals.filter(
    //   (e) => e.completed_safety_orders_count + 1 === e.max_safety_orders,
    // );
    const promises = activeDeals.map(
      async (deal): Promise<I3CommasDealWithOrders> => {
        const order_list = await fetch3CommasOrder(deal.id);
        return { ...deal, order_list };
      },
    );
    const withOrders: I3CommasDealWithOrders[] = await Promise.all(promises);
    return withOrders;
  } catch (error) {

    return [];
  }
}
const main = async () => {
    // const rs = await threecommas_api.ping();
    const soDeals = await fetchAllLastSO3CommasActiveDeals();
    console.log("🚀 ~ file: 6.test-all-active-lastSO.ts:62 ~ main ~ soDeals:", soDeals);
    fs.writeFileSync(
      './test/3commas/3commas-all-SO-active-deal.txt',
      JSON.stringify(soDeals),
    );
    // return ticker;
  };
  
  main();
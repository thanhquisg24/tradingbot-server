import BigNumber from 'bignumber.js';

export enum REDUCE_EV_TYPES {
  PREPARE_ROUND = 'PREPARE_ROUND',
  BEGIN_ROUND = 'BEGIN_ROUND',
  END_ROUND = 'END_ROUND',
}

interface ICommonReduce {
  toBotId: number;
}
interface IReduceEvent<P, T extends string = string> {
  type: T;
  payload: P;
}
export interface IReducePreparePayload extends ICommonReduce {
  fromDealId: number;
  pair: string;
  r_quantity: BigNumber;
  tp_deviation: BigNumber;
  triger_price: BigNumber;
  round_count: number;
}

export type ReducePrepareEvent = IReduceEvent<
  IReducePreparePayload,
  REDUCE_EV_TYPES.PREPARE_ROUND
>;
export const createReducePrepareEvent = (
  payload: IReducePreparePayload,
): ReducePrepareEvent => {
  return {
    type: REDUCE_EV_TYPES.PREPARE_ROUND,
    payload,
  };
};

export interface IReduceBeginPayload extends ICommonReduce {
  fromStrategyDirection: 'LONG' | 'SHORT' | any;
  toDealId: number;
  pair: string;
  triger_price: BigNumber;
}
export type ReduceBeginEvent = IReduceEvent<
  IReduceBeginPayload,
  REDUCE_EV_TYPES.BEGIN_ROUND
>;

export interface IReduceEndPayload extends ICommonReduce {
  toDealId: number;
  pair: string;
  triger_price: BigNumber;
  fromProfitQty: BigNumber;
}
export type ReduceEndEvent = IReduceEvent<
  IReduceEndPayload,
  REDUCE_EV_TYPES.END_ROUND
>;

export type CombineReduceEventTypes =
  | ReducePrepareEvent
  | ReduceBeginEvent
  | ReduceEndEvent;

export type BotEventData = CombineReduceEventTypes;
export const BOT_EVENT_KEY = 'BOT_EVENT_KEY';

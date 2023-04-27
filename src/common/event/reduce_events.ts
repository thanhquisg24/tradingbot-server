export enum REDUCE_EV_TYPES {
  PREPARE_ROUND = 'PREPARE_ROUND',
  BEGIN_ROUND = 'BEGIN_ROUND',
  END_ROUND = 'END_ROUND',
  CLOSED_TP = 'CLOSED_TP',
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
  r_quantity: string | number;
  tp_deviation: string | number;
  triger_price: string | number;
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
  triger_price: string | number;
}
export type ReduceBeginEvent = IReduceEvent<
  IReduceBeginPayload,
  REDUCE_EV_TYPES.BEGIN_ROUND
>;
export const createReduceBeginEvent = (
  payload: IReduceBeginPayload,
): ReduceBeginEvent => {
  return {
    type: REDUCE_EV_TYPES.BEGIN_ROUND,
    payload,
  };
};
export interface IReduceEndPayload extends ICommonReduce {
  toDealId: number;
  pair: string;
  triger_price: string | number;
  fromProfitQty: string | number;
}
export type ReduceEndEvent = IReduceEvent<
  IReduceEndPayload,
  REDUCE_EV_TYPES.END_ROUND
>;

export interface IReduceClosedTPPayload extends ICommonReduce {
  toDealId: number;
  pair: string;
}
export type ReduceClosedTPEvent = IReduceEvent<
  IReduceClosedTPPayload,
  REDUCE_EV_TYPES.CLOSED_TP
>;

export type CombineReduceEventTypes =
  | ReducePrepareEvent
  | ReduceBeginEvent
  | ReduceEndEvent
  | ReduceClosedTPEvent;

export type BotEventData = CombineReduceEventTypes;
export const BOT_EVENT_KEY = 'BOT_EVENT_KEY';

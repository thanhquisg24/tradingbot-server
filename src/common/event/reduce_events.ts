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
interface IReducePreparePayload extends ICommonReduce {
  fromDealId: number;
  pair: number;
  current_quantity: number;
  current_deviation: number;
  current_price: number;
  round_count: number;
}

export type ReducePrepareEvent = IReduceEvent<
  IReducePreparePayload,
  REDUCE_EV_TYPES.PREPARE_ROUND
>;

interface IReduceBeginPayload extends ICommonReduce {
  toDealId: number;
  pair: number;
  current_quantity: number;
  current_price: number;
  next_move_deviation: number;
  round_count: number;
}
export type ReduceBeginEvent = IReduceEvent<
  IReduceBeginPayload,
  REDUCE_EV_TYPES.BEGIN_ROUND
>;

interface IReduceEndPayload extends ICommonReduce {
  toDealId: number;
  pair: number;
  fromProfit: number;
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

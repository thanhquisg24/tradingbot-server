export enum REDUCE_EVENTS {
  PREPARE_ROUND = 'PREPARE_ROUND',
  BEGIN_ROUND = 'BEGIN_ROUND',
  END_ROUND = 'END_ROUND',
}

interface IReduceEvent<P, T extends string = string> {
  type: T;
  payload: P;
}
interface IReducePreparePayload {
  toBotId: number;
  fromDealId: number;
  pair: number;
  current_quantity: number;
  current_deviation: number;
  current_price: number;
  round_count: number;
}

export type ReducePrepareEvent = IReduceEvent<
  IReducePreparePayload,
  REDUCE_EVENTS.PREPARE_ROUND
>;

interface IReduceBeginPayload {
  toBotId: number;
  toDealId: number;
  pair: number;
  current_quantity: number;
  current_price: number;
  next_move_deviation: number;
  round_count: number;
}
export type ReduceBeginEvent = IReduceEvent<
  IReduceBeginPayload,
  REDUCE_EVENTS.BEGIN_ROUND
>;

interface IReduceEndPayload {
  toBotId: number;
  toDealId: number;
  pair: number;
  fromProfit: number;
}
export type ReduceEndEvent = IReduceEvent<
  IReduceBeginPayload,
  REDUCE_EVENTS.END_ROUND
>;

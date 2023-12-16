export enum TVActionType {
  OPEN_ORDER = 'OPEN_ORDER',
  CLOSE_ORDER = 'CLOSE_ORDER',
}

export interface ITVPayload {
  botId: number;
  pair: string;
  userId: number;
  action: TVActionType;
  price: number;
}

export type OnTVEventPayload = ITVPayload;

export const TV_DEAL_EVENT_KEY = 'TV_DEAL_EVENT_KEY';

export enum TVActionType {
  OPEN_DEAL = 'OPEN_DEAL',
  CLOSE_DEAL = 'CLOSE_DEAL',
}

export interface ITVPayload {
  botId: number;
  pair: string;
  userId: number;
  action: TVActionType;
  price: number;
}

export type OnTVEventPayload = ITVPayload;

export const TV_DEAL_EVENT = 'TV_DEAL_EVENT';

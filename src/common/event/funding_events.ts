import { IFundingSymbol } from '../dto/funding-symbol';

export enum FUNDING_EV_TYPES {
  START_DEAL = 'START_DEAL',
}

export interface ICommonFundingStartDeal {
  fundingData: IFundingSymbol;
  closeAtMarketTimeOut: number;
}

interface IFundingEvent<P, T extends string = string> {
  type: T;
  payload: P;
}
export type StartFundingDealEvent = IFundingEvent<
  ICommonFundingStartDeal,
  FUNDING_EV_TYPES.START_DEAL
>;

export const createstartFundingDealEvent = (
  payload: ICommonFundingStartDeal,
): StartFundingDealEvent => {
  return {
    type: FUNDING_EV_TYPES.START_DEAL,
    payload,
  };
};

type CombineFundingEvent = StartFundingDealEvent;

export type FundingEvent = CombineFundingEvent;

export const FUNDING_EVENT_KEY = 'FUNDING_EVENT_KEY';

export interface IFundingSymbol {
  symbol: string; // 'TRB/USDT:USDT';
  markPrice: number;
  indexPrice: number;
  interestRate: number;
  estimatedSettlePrice: number;
  timestamp: number; //1693652629000 UTC;
  datetime: string; //'2023-09-02T11:03:49.000Z';
  fundingRate: number; // -0.01208306;
  fundingTimestamp: number; //1693670400000;
  fundingDatetime: string; //'2023-09-02T16:00:00.000Z';
}

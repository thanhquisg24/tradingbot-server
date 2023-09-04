import { Injectable } from '@nestjs/common';
import { SchedulerRegistry, Timeout } from '@nestjs/schedule';
import { ExchangeFactory } from '../exchange/remote-api/exchange.remote.api';
import { ExchangesEnum } from '../entities/exchange.entity';
import { PairService } from '../pair/pair.service';
import {
  FUNDING_EVENT_KEY,
  ICommonFundingStartDeal,
  createstartFundingDealEvent,
} from 'src/common/event/funding_events';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Exchange } from 'ccxt';

interface IFundingExchangeItem {
  info: any;
  symbol: string;
  markPrice: number;
  indexPrice: number;
  interestRate: number;
  estimatedSettlePrice: number;
  timestamp: number;
  datetime: string;
  fundingRate: number;
  fundingTimestamp: number;
  fundingDatetime: string;
}

interface IFundingsExchangeData {
  [symbol: string]: IFundingExchangeItem;
}
const MAX_TIME_OUT_CLOSE_MARKET = 500; // 0.5s delay after fundingTime
const TIME_BEFORE_FUNDING = 2000;

@Injectable()
export class BotFetchFundingService {
  constructor(
    private schedulerRegistry: SchedulerRegistry,
    private readonly pairService: PairService,
    private eventEmitter: EventEmitter2,
  ) {}

  sendFundingDealEvent(payload: ICommonFundingStartDeal) {
    const event = createstartFundingDealEvent(payload);
    this.eventEmitter.emit(FUNDING_EVENT_KEY, event);
  }
  async processFundingDataItem(
    ccxtExchange: Exchange,
    fun: IFundingExchangeItem,
  ) {
    const minusTime = fun.fundingTimestamp - fun.timestamp;
    let timeScheduleToRefetch = minusTime + 1 - TIME_BEFORE_FUNDING;
    if (minusTime > TIME_BEFORE_FUNDING) {
      //set schedule to refech funding data before TIME_BEFORE_FUNDING
      timeScheduleToRefetch = minusTime + 1 - TIME_BEFORE_FUNDING;
    } else {
      // start a funding deal and MAX_TIME_OUT_CLOSE_MARKET for close market deal
      const payload: ICommonFundingStartDeal = {
        fundingData: {
          symbol: fun.symbol,
          markPrice: fun.markPrice,
          indexPrice: fun.indexPrice,
          interestRate: fun.interestRate,
          estimatedSettlePrice: fun.estimatedSettlePrice,
          timestamp: fun.timestamp,
          datetime: fun.datetime,
          fundingRate: fun.fundingRate,
          fundingTimestamp: fun.fundingTimestamp,
          fundingDatetime: fun.fundingDatetime,
        },
        closeAtMarketTimeOut: minusTime + MAX_TIME_OUT_CLOSE_MARKET,
      };
      this.sendFundingDealEvent(payload);
      //set schedule to refech refech next funding data
      timeScheduleToRefetch =
        TIME_BEFORE_FUNDING + MAX_TIME_OUT_CLOSE_MARKET + 1000;
    }
    const callback = async () => {
      const fundingData = await ccxtExchange.fetchFundingRate(fun.symbol);
      await this.processFundingDataItem(ccxtExchange, fundingData);
    };
    const timeout = setTimeout(callback, timeScheduleToRefetch);
    this.schedulerRegistry.addTimeout(
      `${fun.symbol}${timeScheduleToRefetch}`,
      timeout,
    );
  }

  @Timeout('initFundingData', 5000)
  async handleInitFundingData() {
    const publicExchange = ExchangeFactory.createExchange(
      0,
      ExchangesEnum.BINANCEUSDM,
      '',
      '',
      false,
      true,
    );
    const ccxtExchange = publicExchange.getCcxtExchange();

    const pairs = await this.pairService.getAllPairByExchange(
      ExchangesEnum.BINANCEUSDM,
    );

    const exchangeSymbols = pairs.reduce((store: string[], cur) => {
      return [...store, cur.exchangePair];
    }, []);
    const fundings: IFundingsExchangeData =
      await ccxtExchange.fetchFundingRates(exchangeSymbols);
    Object.values(fundings).forEach((fun) => {
      this.processFundingDataItem(ccxtExchange, fun).then();
    });
  }
}

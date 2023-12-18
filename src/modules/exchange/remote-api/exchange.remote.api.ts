import ccxt, { Exchange } from 'ccxt';

import { ExchangesEnum } from 'src/modules/entities/exchange.entity';

export abstract class AbstractExchangeAPI {
  exchange_remote: Exchange;
  getCcxtExchange() {
    return this.exchange_remote;
  }
  abstract checkExchangeOnlineStatus(): Promise<boolean>;
}

export class BinanceUSDMApi extends AbstractExchangeAPI {
  constructor(
    apiKey: string,
    apiSerect: string,
    isDemo: boolean,
    isPublic?: boolean,
  ) {
    super();
    if (isPublic) {
      this.exchange_remote = new ccxt.binanceusdm({
        // rateLimit: 1000, // unified exchange property
        enableRateLimit: true,
        options: {
          adjustForTimeDifference: true, // exchange-specific option
        },
      });
      this.exchange_remote.setSandboxMode(isDemo);
      this.exchange_remote.precisionMode = ccxt.DECIMAL_PLACES;
    } else {
      this.exchange_remote = new ccxt.binanceusdm({
        // rateLimit: 1000, // unified exchange property
        enableRateLimit: true,
        apiKey,
        secret: apiSerect,
        options: {
          adjustForTimeDifference: true, // exchange-specific option
        },
      });
      this.exchange_remote.setSandboxMode(isDemo);
      this.exchange_remote.precisionMode = ccxt.DECIMAL_PLACES;
    }
  }

  async checkExchangeOnlineStatus(): Promise<boolean> {
    const exchangeServerTime = await this.exchange_remote.fetchTime();
    return exchangeServerTime > 0;
  }
}

export class BinanceSpotApi extends AbstractExchangeAPI {
  constructor(
    apiKey: string,
    apiSerect: string,
    isDemo: boolean,
    isPublic?: boolean,
  ) {
    super();
    if (isPublic) {
      this.exchange_remote = new ccxt.binance({
        // rateLimit: 1000, // unified exchange property
        enableRateLimit: true,
        options: {
          adjustForTimeDifference: true, // exchange-specific option
        },
      });
      this.exchange_remote.setSandboxMode(isDemo);
      this.exchange_remote.precisionMode = ccxt.DECIMAL_PLACES;
    } else {
      this.exchange_remote = new ccxt.binance({
        // rateLimit: 1000, // unified exchange property
        enableRateLimit: true,
        apiKey,
        secret: apiSerect,
        options: {
          adjustForTimeDifference: true, // exchange-specific option
        },
      });
      this.exchange_remote.setSandboxMode(isDemo);
      this.exchange_remote.precisionMode = ccxt.DECIMAL_PLACES;
    }
  }
  async checkExchangeOnlineStatus(): Promise<boolean> {
    const exchangeServerTime = await this.exchange_remote.fetchTime();
    return exchangeServerTime > 0;
  }
}

export class ExchangeFactory {
  static exchangeInstances: Map<number, AbstractExchangeAPI> = new Map();
  // private static getExchangeById(id: number) {
  //   if (ExchangeFactory.exchangeInstances.has(id)) {
  //     return ExchangeFactory.exchangeInstances.get(id);
  //   }
  //   return null;
  // }
  static removeExchangeIns(exchangeId: number): void {
    ExchangeFactory.exchangeInstances.delete(exchangeId);
  }
  static createExchange(
    exchangeId: number,
    exchangeName: ExchangesEnum,
    apiKey: string,
    apiSerect: string,
    isDemo: boolean,
    isPublic?: boolean,
  ) {
    if (ExchangeFactory.exchangeInstances.has(exchangeId)) {
      return ExchangeFactory.exchangeInstances.get(exchangeId);
    }
    switch (exchangeName) {
      case ExchangesEnum.PAPER:
      case ExchangesEnum.BINANCEUSDM: {
        const _exchange = new BinanceUSDMApi(
          apiKey,
          apiSerect,
          isDemo,
          isPublic,
        );
        ExchangeFactory.exchangeInstances.set(exchangeId, _exchange);
        return _exchange;
      }
      case ExchangesEnum.BINANCE: {
        const _exchange = new BinanceSpotApi(
          apiKey,
          apiSerect,
          isDemo,
          isPublic,
        );
        ExchangeFactory.exchangeInstances.set(exchangeId, _exchange);
        return _exchange;
      }
    }
  }
  static createPuplicExchange(
    exchangeId: number,
    exchangeName: ExchangesEnum,
    isDemo: boolean,
  ) {
    const isPublic = true;
    return ExchangeFactory.createExchange(
      exchangeId,
      exchangeName,
      '',
      '',
      isDemo,
      isPublic,
    );
  }
}

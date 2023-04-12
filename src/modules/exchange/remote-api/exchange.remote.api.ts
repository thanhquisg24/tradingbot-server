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
  constructor(apiKey: string, apiSerect: string, isDemo: boolean) {
    super();
    this.exchange_remote = new ccxt.binanceusdm({
      enableRateLimit: true,
      apiKey,
      secret: apiSerect,
    });
    this.exchange_remote.setSandboxMode(isDemo);
  }

  async checkExchangeOnlineStatus(): Promise<boolean> {
    const exchangeServerTime = await this.exchange_remote.fetchTime();
    return exchangeServerTime > 0;
  }
}

export class ExchangeFactory {
  static createExchange(
    exchangeName: ExchangesEnum,
    apiKey: string,
    apiSerect: string,
    isDemo: boolean,
  ) {
    switch (exchangeName) {
      case ExchangesEnum.PAPER:
      case ExchangesEnum.BINANCEUSDM:
        const _exchange = new BinanceUSDMApi(apiKey, apiSerect, isDemo);
        return _exchange;
    }
    throw new Error('Can not find exchange name :' + exchangeName);
  }
}

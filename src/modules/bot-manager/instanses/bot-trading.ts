import { Logger } from '@nestjs/common';
import { BotTradingEntity } from 'src/modules/entities/bot.entity';
import { DEAL_STATUS, DealEntity } from 'src/modules/entities/deal.entity';
import { OrderEntity } from 'src/modules/entities/order.entity';
import {
  AbstractExchangeAPI,
  ExchangeFactory,
} from 'src/modules/exchange/remote-api/exchange.remote.api';
import { Repository } from 'typeorm';

interface IBaseBotTrading {
  botConfig: BotTradingEntity;
  _exchangeRemote: AbstractExchangeAPI;
}

export abstract class BaseBotTrading implements IBaseBotTrading {
  botConfig: BotTradingEntity;

  _exchangeRemote: AbstractExchangeAPI;

  private isRunning: boolean;

  private readonly dealRepo: Repository<DealEntity>;

  private readonly orderRepo: Repository<OrderEntity>;

  private logger: Logger;

  constructor(
    config: BotTradingEntity,
    dealRepo: Repository<DealEntity>,
    orderRepo: Repository<OrderEntity>,
  ) {
    this.botConfig = config;
    this.isRunning = false;
    this.dealRepo = dealRepo;
    this.orderRepo = orderRepo;
  }

  updateConfig(partConfig: Partial<BotTradingEntity>) {
    this.botConfig = { ...this.botConfig, ...partConfig };
  }

  async start(): Promise<boolean> {
    const exchangeRow = this.botConfig.exchange;
    const _exchange = ExchangeFactory.createExchange(
      exchangeRow.name,
      exchangeRow.apiKey,
      exchangeRow.apiSecret,
      exchangeRow.isTestNet,
    );
    const exInfo = await _exchange.checkExchangeOnlineStatus();
    if (exInfo) {
      this._exchangeRemote = _exchange;
      this.isRunning = true;
      this.logger = new Logger('Bot #' + this.botConfig.id);
      this.logger.log('Bot is Starting ');
      return true;
    }
    this.logger.log('Cannot connect to Exchange API!');
    return false;
  }

  stop() {
    console.log('Bot is Stoped');
    this.isRunning = false;
  }

  getActiveDeals(): Promise<DealEntity[] | undefined> {
    return this.dealRepo.find({ where: { status: DEAL_STATUS.ACTIVE } });
  }

  getDeal(id: number): Promise<DealEntity | undefined> {
    return this.dealRepo.findOne({
      where: {
        id,
      },
    });
  }
}

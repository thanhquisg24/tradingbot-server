import { Logger } from '@nestjs/common';
import {
  Binance,
  Order as BinanceOrder,
  SymbolLotSizeFilter,
  SymbolPriceFilter,
  ExecutionReport,
  Symbol as BinanceSymbol,
  OrderSide,
  OrderStatus,
  OrderType,
} from 'binance-api-node';
import {
  BotTradingEntity,
  DEAL_START_TYPE,
} from 'src/modules/entities/bot.entity';
import { DEAL_STATUS, DealEntity } from 'src/modules/entities/deal.entity';
import { OrderEntity } from 'src/modules/entities/order.entity';
import {
  AbstractExchangeAPI,
  ExchangeFactory,
} from 'src/modules/exchange/remote-api/exchange.remote.api';
import { TelegramService } from 'src/modules/telegram/telegram.service';
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

  private readonly telegramService: TelegramService;

  private logger: Logger;

  constructor(
    config: BotTradingEntity,
    dealRepo: Repository<DealEntity>,
    orderRepo: Repository<OrderEntity>,
    telegramService: TelegramService,
  ) {
    this.botConfig = config;
    this.isRunning = false;
    this.dealRepo = dealRepo;
    this.orderRepo = orderRepo;
    this.telegramService = telegramService;
  }
  private sendMsgTelegram(msg: string): void {
    this.logger.log(msg);
    if (this.botConfig.exchange.user.telegramChatId) {
      this.telegramService.sendMessageToUser(
        this.botConfig.exchange.user.telegramChatId,
        msg,
      );
    }
  }
  async placeBinanceOrder(
    order: OrderEntity,
  ): Promise<BinanceOrder | undefined> {
    try {
      const newOrder = await this.bClient.order({
        newClientOrderId: order.id,
        side: order.side,
        symbol: this.config.pair,
        type: OrderType.LIMIT,
        price: order.price,
        quantity: order.quantity,
      });

      this.logger.log(
        `${order.id}/${order.binanceOrderId}: New ${order.side} order has been placed`,
      );
      return newOrder;
    } catch (err) {
      this.logger.log('Failed to place order', order, err);
    }
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
      this.sendMsgTelegram('Bot is Starting #' + this.botConfig.id);
      return true;
    }
    this.logger.log('Cannot connect to Exchange API!');
    return false;
  }

  stop() {
    this.sendMsgTelegram('Bot is Stopped #' + this.botConfig.id);
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

  watchPosition() {
    if (this.isRunning) {
      this.processActivePosition();
    }
    if (this.botConfig.dealStartCondition === DEAL_START_TYPE.ASAP) {
      this.startDealASAP();
    }
  }
  startDealASAP() {}
  abstract processActivePosition();
}

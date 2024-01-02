import {
  AbstractExchangeAPI,
  ExchangeFactory,
} from 'src/modules/exchange/remote-api/exchange.remote.api';
import {
  Order as BinanceOrder,
  OrderSide,
  OrderType,
  OrderType_LT,
} from 'binance-api-node';
import {
  CLIENT_ORDER_SPOT_TYPE,
  OrderSpotEntity,
} from 'src/modules/entities/order.spot.entity';
import { ITVPayload, OnTVEventPayload } from 'src/common/event/tv_events';

import { BotSpotEntity } from 'src/modules/entities/bot.spot.extity';
import { DealSpotEntity } from 'src/modules/entities/deal.spot.entity';
import { Repository } from 'typeorm';
import { TelegramService } from 'src/modules/telegram/telegram.service';
import { botLogger } from 'src/common/bot-logger';
import { decryptWithAES } from 'src/common/utils/hash-util';
import { has } from 'lodash';
import { wrapExReq } from 'src/modules/exchange/remote-api/exchange.helper';

export interface IBaseBotSpot {
  isWatchingPosition: boolean;
  botConfig: BotSpotEntity;
  _exchangeRemote: AbstractExchangeAPI;
  watchPosition(): Promise<void>;
  updateConfig(partConfig: Partial<BotSpotEntity>): void;
  start(): Promise<boolean>;
  stop(): void;
  closeAtMarketPrice(dealId: number, userId: number): Promise<void>;
  processTvAction(tv: OnTVEventPayload): Promise<void>;
}
const MAX_RETRY = 10;
export abstract class BotSpotBase implements IBaseBotSpot {
  botConfig: BotSpotEntity;

  _exchangeRemote: AbstractExchangeAPI;

  protected isRunning: boolean;

  protected readonly dealRepo: Repository<DealSpotEntity>;

  protected readonly orderRepo: Repository<OrderSpotEntity>;

  protected readonly telegramService: TelegramService;

  protected logLabel: {
    label: string;
  };

  isWatchingPosition: boolean;

  constructor(
    config: BotSpotEntity,
    dealRepo: Repository<DealSpotEntity>,
    orderRepo: Repository<OrderSpotEntity>,
    telegramService: TelegramService,
  ) {
    this.botConfig = config;
    this.isRunning = false;
    this.dealRepo = dealRepo;
    this.orderRepo = orderRepo;
    this.telegramService = telegramService;
    this.isWatchingPosition = false;
    this.logLabel = {
      label: `Bot Spot ${config.botType}#${config.id} ${config.name}`,
    };
  }

  protected sendMsgTelegram(msg: string): void {
    botLogger.info(msg, this.logLabel);
    if (has(this.botConfig.exchange.user, 'telegramChatId')) {
      this.telegramService.sendMessageToUser(
        this.botConfig.exchange.user.telegramChatId,
        `[${this.logLabel.label}] ${msg}`,
      );
    }
  }
  protected async placeBuyOrder(
    order: OrderSpotEntity | null,
    isRetry?: boolean,
  ): Promise<BinanceOrder | undefined> {
    try {
      let params: any = {
        positionSide: OrderSide.BUY,
        newClientOrderId: order.id,
      };
      let ex_orderType: OrderType_LT = OrderType.LIMIT;

      switch (order.clientOrderType) {
        case CLIENT_ORDER_SPOT_TYPE.BASE:
          ex_orderType = OrderType.MARKET;
          break;
        case CLIENT_ORDER_SPOT_TYPE.TAKE_PROFIT:
          ex_orderType = OrderType.LIMIT;
          break;

        case CLIENT_ORDER_SPOT_TYPE.STOP_LOSS:
          ex_orderType = OrderType.STOP;
          params = { ...params, stopPrice: order.price };
          break;
        case CLIENT_ORDER_SPOT_TYPE.CLOSE_AT_MARKET:
          ex_orderType = OrderType.MARKET;
          break;
        default:
          ex_orderType = OrderType.LIMIT;
          break;
      }
      if (ex_orderType === OrderType.MARKET) {
        params = { ...params, newOrderRespType: 'RESULT' };
      }
      botLogger.info(
        `${order.pair} ${order.id} , ${JSON.stringify(params)}`,
        this.logLabel,
      );
      const symbol = order.pair;
      const side = order.side;
      const quantity = order.quantity;
      const price = order.price;

      const newOrder = await wrapExReq(
        this._exchangeRemote
          .getCcxtExchange()
          .createOrder(
            symbol,
            ex_orderType as any,
            side as any,
            quantity,
            price,
            params,
          ),
        botLogger,
      );

      botLogger.info(
        `[${order.pair}][${newOrder.id}]: New ${order.side} order has been placed`,
        this.logLabel,
      );
      return newOrder.info;
    } catch (err) {
      botLogger.error(
        `[${order.pair}][${order.id}]Failed to place order  ${err.message}`,
        this.logLabel,
      );
      this.sendMsgTelegram(
        `[${order.pair}][${order.id}]Failed to place order  ${err.message}`,
      );
      if (isRetry && order.retryCount < MAX_RETRY) {
        order.status = 'placing';
        order.retryCount = order.retryCount + 1;
        await this.orderRepo.save(order);
        this.sendMsgTelegram(
          `[${order.pair}][${order.id}]:Error on placing ${
            order.clientOrderType
          }. Price: ${order.price}, Amount: ${order.quantity} .RetryCount: ${
            order.retryCount - 1
          }`,
        );
      }
      return null;
    }
  }
  watchPosition(): Promise<void> {
    throw new Error('Method not implemented.');
  }
  updateConfig(partConfig: Partial<BotSpotEntity>): void {
    this.botConfig = { ...this.botConfig, ...partConfig };
  }
  async start(): Promise<boolean> {
    try {
      const exchangeRow = this.botConfig.exchange;
      const apiSerectDescrypt = decryptWithAES(exchangeRow.apiSecret);
      const _exchange = ExchangeFactory.createExchange(
        exchangeRow.id,
        exchangeRow.name,
        exchangeRow.apiKey,
        apiSerectDescrypt,
        exchangeRow.isTestNet,
      );
      const exInfo = await wrapExReq(
        _exchange.checkExchangeOnlineStatus(),
        botLogger,
      );
      if (exInfo) {
        this._exchangeRemote = _exchange;
        await this._exchangeRemote.getCcxtExchange().loadMarkets();
        this.isRunning = true;
        this.sendMsgTelegram('Bot is Starting #' + this.botConfig.id);
        // this._exchangeRemote.getCcxtExchange().getSib
        return true;
      }
      botLogger.error('Cannot connect to Exchange API!', this.logLabel);
      return false;
    } catch (ex) {
      botLogger.error('Start Bot error: ' + ex.message, this.logLabel);
      return false;
    }
  }
  stop(): void {
    this.sendMsgTelegram('Bot is Stopped #' + this.botConfig.id);
    this.isRunning = false;
  }
  closeAtMarketPrice(dealId: number, userId: number): Promise<void> {
    throw new Error('Method not implemented.');
  }
  processTvAction(tv: ITVPayload): Promise<void> {
    throw new Error('Method not implemented.');
  }
}

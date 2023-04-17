import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { COMMON_STATUS } from 'src/common/constants';
import { OnTVEventPayload, TV_DEAL_EVENT } from 'src/common/event/tv_events';
import { Repository } from 'typeorm';
import { DealEntity } from '../entities/deal.entity';
import { OrderEntity } from '../entities/order.entity';
import { UserEntity } from '../entities/user.entity';
import { TelegramService } from '../telegram/telegram.service';
import { BotManagerService } from './bot-manager.service';
import { CloseDealAtMarketPrice } from './dto/close-deal-market-price.payload';
import { BotFactory } from './instanses/bot-factory';
import { BaseBotTrading } from './instanses/bot-trading';
import { OnEvent } from '@nestjs/event-emitter';

export interface IBotManagerInstances {
  botInstances: Map<string, BaseBotTrading>;
}

@Injectable()
export class BotManagerInstances implements IBotManagerInstances {
  botInstances: Map<string, BaseBotTrading>;

  constructor(
    private readonly botManagerService: BotManagerService,

    @InjectRepository(DealEntity)
    private readonly dealRepo: Repository<DealEntity>,
    @InjectRepository(OrderEntity)
    private readonly orderRepo: Repository<OrderEntity>,

    private readonly telegramService: TelegramService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {
    this.botInstances = new Map();
    console.log('🚀 NEW ins BotManagerInstances ~:');
  }

  getBotById(id: number) {
    const strId = `${id}`;
    if (this.botInstances.has(strId)) {
      return this.botInstances.get(strId);
    }
    return null;
  }

  async addRunningBot(id: number, user: UserEntity) {
    const bot = this.getBotById(id);
    if (bot) {
      return 'already running bot#' + id;
    }
    this.telegramService.sendMessageToUser(
      user.telegramChatId,
      'add bot running #' + id,
    );
    const botConfig = await this.botManagerService.findOneRelations(id);
    if (botConfig) {
      botConfig.exchange.user = user;
      const newBot = BotFactory.createBot(
        botConfig,
        this.dealRepo,
        this.orderRepo,
        this.telegramService,
      );
      const isStartSuccess = await newBot.start();
      if (isStartSuccess) {
        this.botInstances.set(`${id}`, newBot);
        await this.botManagerService.updateStatus(id, COMMON_STATUS.ACTIVE);
      }
    }
    return 'add bot running #' + id;
  }

  async stopBotIns(id: number) {
    const bot = this.getBotById(id);
    if (bot) {
      await this.botInstances.get(`${id}`).stop();
      this.botInstances.delete(`${id}`);
      await this.botManagerService.updateStatus(id, COMMON_STATUS.DISABLED);
      return 'stop bot #' + id;
    }
    return 'bot not found';
  }
  async closeDealAtMarketPrice(payload: CloseDealAtMarketPrice) {
    const strId = `${payload.botId}`;
    if (this.botInstances.has(strId)) {
      await this.botInstances
        .get(strId)
        .closeAtMarketPrice(payload.dealId, payload.userId);
      return 'success';
    }
    return 'fail';
  }

  getAllRunning() {
    const obj = Object.fromEntries(this.botInstances);
    return Object.keys(obj);
  }

  async getRunningBotById(id: any) {
    if (this.botInstances.has(id)) {
      return this.getBotById(id).botConfig.id;
    }
    return 'bot not found';
  }

  @OnEvent(TV_DEAL_EVENT)
  async handleTvEvent(payload: OnTVEventPayload) {
    this.logger.log(
      `receive msg from tradingview ${JSON.stringify(payload)}`,
      BotManagerInstances.name,
    );
    const strId = `${payload.botId}`;
    if (this.botInstances.has(strId)) {
      await this.botInstances.get(strId).processTvAction(payload);
    }
  }

  @Cron(CronExpression.EVERY_10_SECONDS)
  // @Cron('*/20 * * * * *')
  async handleCron() {
    this.logger.log('Called every 10 seconds', BotManagerInstances.name);
    this.botInstances.forEach(async (bot) => {
      this.logger.log('Called every 10 seconds', 'BotId#' + bot.botConfig.id);
      await bot.watchPosition();
    });
  }
}

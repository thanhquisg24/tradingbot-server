import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { COMMON_STATUS } from 'src/common/constants';
import {
  OnTVEventPayload,
  TV_DEAL_EVENT_KEY,
} from 'src/common/event/tv_events';
import { Repository } from 'typeorm';
import { DealEntity } from '../entities/deal.entity';
import { OrderEntity } from '../entities/order.entity';
import { UserEntity } from '../entities/user.entity';
import { TelegramService } from '../telegram/telegram.service';
import { BotManagerService } from './bot-manager.service';
import { CloseDealAtMarketPrice } from './dto/close-deal-market-price.payload';
import { BotFactory } from './instanses/bot-factory';
import { BaseBotTrading } from './instanses/bot-trading';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { BOT_EVENT_KEY, BotEventData } from 'src/common/event/reduce_events';
import { UpdateBotDto } from './dto/update-bot.dto';
import { PairService } from '../pair/pair.service';
import { mappingBot } from './bot-utils';

export interface IBotManagerInstances {
  botInstances: Map<string, BaseBotTrading>;
}

@Injectable()
export class BotManagerInstances implements IBotManagerInstances {
  botInstances: Map<string, BaseBotTrading>;

  constructor(
    private eventEmitter: EventEmitter2,
    private readonly botManagerService: BotManagerService,
    private readonly pairService: PairService,
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

  async updateBotConfig(id: number, dto: UpdateBotDto) {
    let bot = await this.botManagerService.findOne(id);
    const pairs = await this.pairService.findByIds(dto.listPair);
    bot.pairs = pairs;
    bot = mappingBot(bot, dto);
    const newConfigBot = await this.botManagerService.saveBot(bot);
    const strId = `${id}`;
    if (this.botInstances.has(strId)) {
      this.botInstances.get(strId).updateConfig(newConfigBot);
    }
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
        this.sendBotEvent,
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

  sendBotEvent = (eventPayload: BotEventData) => {
    console.warn(
      '🚀 ~ file: bot-manager.instances.ts:133 ~ BotManagerInstances ~ sendBotEvent ~ eventPayload:',
      eventPayload,
    );
    this.eventEmitter.emit(BOT_EVENT_KEY, eventPayload);
  };

  @OnEvent(BOT_EVENT_KEY)
  async handleBotEvent(payload: BotEventData) {
    this.logger.log(
      `receive BOT_EVENT_KEY ${JSON.stringify(payload)}`,
      BotManagerInstances.name,
    );
    const strId = `${payload.payload.toBotId}`;
    if (this.botInstances.has(strId)) {
      await this.botInstances.get(strId).processBotEventAction(payload);
    }
  }

  @OnEvent(TV_DEAL_EVENT_KEY)
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

  // @Cron('*/20 * * * * *')
  @Cron(CronExpression.EVERY_10_SECONDS)
  async handleCron() {
    this.botInstances.forEach(async (bot) => {
      this.logger.log('Called every 10 seconds', 'BotId#' + bot.botConfig.id);
      await bot.watchPosition();
    });
  }
}

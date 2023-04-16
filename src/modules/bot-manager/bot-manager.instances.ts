import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { COMMON_STATUS } from 'src/common/constants';
import { Repository } from 'typeorm';
import { DealEntity } from '../entities/deal.entity';
import { OrderEntity } from '../entities/order.entity';
import { UserEntity } from '../entities/user.entity';
import { TelegramService } from '../telegram/telegram.service';
import { BotManagerService } from './bot-manager.service';
import { BotFactory } from './instanses/bot-factory';
import { BaseBotTrading } from './instanses/bot-trading';
import { CloseDealAtMarketPrice } from './dto/close-deal-market-price.payload';
import { OnEvent } from '@nestjs/event-emitter';
import { OnTVEventPayload, TV_DEAL_EVENT } from 'src/common/event/tv_events';

export interface IBotManagerInstances {
  botInstances: Map<number, BaseBotTrading>;
}

@Injectable()
export class BotManagerInstances implements IBotManagerInstances {
  botInstances: Map<number, BaseBotTrading> = new Map();

  constructor(
    private readonly botManagerService: BotManagerService,

    @InjectRepository(DealEntity)
    private readonly dealRepo: Repository<DealEntity>,
    @InjectRepository(OrderEntity)
    private readonly orderRepo: Repository<OrderEntity>,

    private readonly telegramService: TelegramService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {}

  getBotById(id: number) {
    if (this.botInstances.has(id)) {
      return this.botInstances.get(id);
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
        this.botInstances.set(id, newBot);
        await this.botManagerService.updateStatus(id, COMMON_STATUS.ACTIVE);
      }
    }
    return 'add bot running #' + id;
  }

  async stopBotIns(id: number) {
    const bot = this.getBotById(id);
    if (bot) {
      await bot.stop();
      this.botInstances.delete(id);
      await this.botManagerService.updateStatus(id, COMMON_STATUS.DISABLED);
      return 'stop bot #' + id;
    }
    return 'bot not found';
  }
  async closeDealAtMarketPrice(payload: CloseDealAtMarketPrice) {
    if (this.botInstances.has(payload.botId)) {
      await this.botInstances
        .get(payload.botId)
        .closeAtMarketPrice(payload.dealId, payload.userId);
    }
  }

  getAllRunning() {
    const obj = Object.fromEntries(this.botInstances);
    return obj;
  }

  getRunningBotById(id: number) {
    if (this.botInstances.has(id)) {
      return this.getBotById(id).botConfig.id;
    }
    return 'bot not found';
  }

  // @OnEvent(TV_DEAL_EVENT)
  handleTvEvent(payload: OnTVEventPayload) {
    console.log(
      '🚀 ~ file: bot-manager.instances.ts:104 ~ BotManagerInstances ~ handleTvEvent ~ payload:',
      payload,
    );
    this.botInstances.has(payload.botId);
    console.log(
      '🚀 ~ file: bot-manager.instances.ts:109 ~ BotManagerInstances ~ handleTvEvent ~ this.botInstances.has(payload.botId):',
      payload.botId,
      this.botInstances.has(payload.botId),
    );
    return this.getRunningBotById(payload.botId);
    // if (this.botInstances.has(payload.botId)) {
    //   console.log(
    //     '🚀 ~ file: bot-manager.instances.ts:109 ~ BotManagerInstances ~ handleTvEvent ~ payload.botId:',
    //     payload.botId,
    //   );
    //   await this.botInstances.get(payload.botId).processTvAction(payload);
    // }
  }

  @Cron(CronExpression.EVERY_10_SECONDS)
  // @Cron('*/20 * * * * *')
  async handleCron() {
    this.logger.log('Called every 10 seconds', BotManagerInstances.name);
    this.botInstances.forEach(async (bot) => {
      await bot.watchPosition();
    });
  }
}

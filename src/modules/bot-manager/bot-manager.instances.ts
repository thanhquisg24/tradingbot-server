import {
  BadRequestException,
  Inject,
  Injectable,
  LoggerService,
  NotFoundException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { COMMON_STATUS, EVENT_STATUS } from 'src/common/constants';
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
import { ProtectionEventService } from '../protection-event/protection-event.service';
import {
  FUNDING_EVENT_KEY,
  FundingEvent,
} from 'src/common/event/funding_events';
import { BOT_TRADING_TYPE } from '../entities/bot.entity';

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

    private readonly protectionEventService: ProtectionEventService,
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
    const updateData = await this.botManagerService.saveBot(bot);
    const newConfigBot = await this.botManagerService.findOneRelationsPair(
      updateData.id,
    );
    const strId = `${id}`;

    if (this.botInstances.has(strId)) {
      this.botInstances.get(strId).updateConfig(newConfigBot);
    }
    const result = await this.botManagerService.findOneRelationsExchangeAndPair(
      updateData.id,
    );
    return result;
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
    const botConfig =
      await this.botManagerService.findOneRelationsExchangeAndPair(id);
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

  async deleteBot(botId: number) {
    const bot = this.getBotById(botId);
    if (bot) {
      throw new BadRequestException(
        'please stop bot,already running bot#' + botId,
      );
    }
    await this.botManagerService.deleteBot(botId);
    await this.dealRepo.delete({
      botId: botId,
    });
  }

  async stopBotIns(id: number) {
    await this.botManagerService.updateStatus(id, COMMON_STATUS.DISABLED);
    const bot = this.getBotById(id);
    if (bot) {
      await this.botInstances.get(`${id}`).stop();
      this.botInstances.delete(`${id}`);
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
      return 'Success!';
    }
    throw new NotFoundException(`bot ${strId} is not running`);
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
    this.protectionEventService.createEventFromRaw(eventPayload).then(() => {
      this.eventEmitter.emit(BOT_EVENT_KEY, eventPayload);
    });
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
      await this.protectionEventService.updateEventStatus(
        payload.eventId,
        EVENT_STATUS.RECEIVED,
      );
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

  @OnEvent(FUNDING_EVENT_KEY)
  async handleFundingEvent(evt: FundingEvent) {
    this.logger.log(
      `receive FUNDING_EVENT_KEY ${JSON.stringify(evt)}`,
      BotManagerInstances.name,
    );
    this.botInstances.forEach(async (bot) => {
      if (bot.botConfig.botType === BOT_TRADING_TYPE.FUD_RATE) {
        await bot.startFundingDeal(evt.payload);
      }
    });
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

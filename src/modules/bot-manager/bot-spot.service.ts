import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { COMMON_STATUS } from 'src/common/constants';
import { Repository } from 'typeorm';
import { BotSpotEntity } from '../entities/bot.spot.extity';
import { DealSpotEntity } from '../entities/deal.spot.entity';
import { OrderSpotEntity } from '../entities/order.spot.entity';
import { UserEntity } from '../entities/user.entity';
import { ExchangeService } from '../exchange/exchange.service';
import { TelegramService } from '../telegram/telegram.service';
import { mappingBotSpot, mappingNewBotSpot } from './bot-utils';
import { CreateBotSpotPayload } from './dto/spot/create-bot-spot.payload';
import { UpdateBotSpotDto } from './dto/spot/update-bot-spot.payload';
import { BotSpotFactory } from './instanses/bot-spot-factory';
import { IBaseBotSpot } from './instanses/spot/bot-spot-base';

@Injectable()
export class BotSpotService {
  botInstances: Map<string, IBaseBotSpot>;
  constructor(
    @InjectRepository(BotSpotEntity)
    private readonly repo: Repository<BotSpotEntity>, // private readonly exchangeService: ExchangeService, // private readonly pairService: PairService,

    private readonly exchangeService: ExchangeService,
    @InjectRepository(DealSpotEntity)
    private readonly dealRepo: Repository<DealSpotEntity>,
    @InjectRepository(OrderSpotEntity)
    private readonly orderRepo: Repository<OrderSpotEntity>,

    private readonly telegramService: TelegramService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {
    this.botInstances = new Map();
  }

  getBotInsById(id: number) {
    const strId = `${id}`;
    if (this.botInstances.has(strId)) {
      return this.botInstances.get(strId);
    }
    return null;
  }

  async updateBotConfig(id: number, dto: UpdateBotSpotDto) {
    let bot = await this.findOne(id);
    bot = mappingBotSpot(bot, dto);
    const updateData = await this.saveBot(bot);
    const newConfigBot = await this.findOneRelationsExchange(updateData.id);
    const strId = `${id}`;

    if (this.botInstances.has(strId)) {
      this.botInstances.get(strId).updateConfig(newConfigBot);
    }
    return newConfigBot;
  }
  getRunningBotById(id: number) {
    const strId = `${id}`;
    if (this.botInstances.has(strId)) {
      return this.getBotInsById(id).botConfig.id;
    }
    return 'bot not found';
  }
  getAllRunning() {
    const obj = Object.fromEntries(this.botInstances);
    return Object.keys(obj);
  }
  async stopBotIns(id: number) {
    await this.updateStatus(id, COMMON_STATUS.DISABLED);
    const bot = this.getBotInsById(id);
    if (bot) {
      await this.botInstances.get(`${id}`).stop();
      this.botInstances.delete(`${id}`);
      return 'stop bot #' + id;
    }
    return 'bot not found';
  }
  async addRunningBot(id: number, user: UserEntity) {
    const bot = this.getBotInsById(id);
    if (bot) {
      return 'already running bot#' + id;
    }
    this.telegramService.sendMessageToUser(
      user.telegramChatId,
      'add bot running #' + id,
    );
    const botConfig = await this.findOneRelationsExchange(id);
    if (botConfig) {
      botConfig.exchange.user = user;
      const newBot = BotSpotFactory.createBot(
        botConfig,
        this.dealRepo,
        this.orderRepo,
        this.telegramService,
      );
      const isStartSuccess = await newBot.start();
      if (isStartSuccess) {
        this.botInstances.set(`${id}`, newBot);
        await this.updateStatus(id, COMMON_STATUS.ACTIVE);
      }
    }
    return 'add bot running #' + id;
  }
  async createWithPayload(payload: CreateBotSpotPayload) {
    const exchange = await this.exchangeService.findOne(payload.exchangeId);
    let newBot = mappingNewBotSpot(payload, exchange);
    newBot = this.repo.create(newBot);
    const saveBot = await this.repo.save(newBot);
    const saveBotWithExchange = await this.repo.findOne({
      relations: ['exchange'],
      where: {
        id: saveBot.id,
      },
    });

    return saveBotWithExchange;
  }
  async deleteBot(botId: number) {
    await this.repo.delete(botId);
  }
  async findByUser(userId: number) {
    const result = await this.repo.findAndCount({
      relations: ['exchange'],
      where: {
        userId,
      },
    });
    return {
      count: result[1],
      bots: result[0],
    };
  }

  async updateStatus(id: number, status: COMMON_STATUS) {
    return await this.repo.update(id, { status });
  }

  async findAll() {
    return await this.repo.find();
  }

  async findOne(id: number) {
    return await this.repo.findOne({
      where: {
        id,
      },
    });
  }

  async findOneRelationsExchange(id: number) {
    return await this.repo.findOne({
      relations: ['exchange'],
      where: {
        id,
      },
    });
  }

  async saveBot(bot: BotSpotEntity) {
    return this.repo.save(bot);
  }

  async remove(id: number) {
    return await this.repo.delete(id);
  }
}

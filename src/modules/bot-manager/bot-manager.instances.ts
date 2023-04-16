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

  getAllRunning() {
    const obj = Object.fromEntries(this.botInstances);
    return obj;
  }

  getRunningBotById(id: number) {
    if (this.botInstances.has(id)) {
      return this.getBotById(id);
    }
    return 'bot not found';
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

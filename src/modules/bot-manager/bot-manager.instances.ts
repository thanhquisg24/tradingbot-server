import { Injectable, Logger } from '@nestjs/common';
import { TelegramService } from '../telegram/telegram.service';
import { BotManagerService } from './bot-manager.service';
import { DealEntity } from '../entities/deal.entity';
import { Repository } from 'typeorm';
import { OrderEntity } from '../entities/order.entity';
import { BotFactory } from './instanses/bot-factory';
import { BaseBotTrading } from './instanses/bot-trading';
import { Cron, CronExpression } from '@nestjs/schedule';
import { COMMON_STATUS } from 'src/common/constants';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../entities/user.entity';

export interface IBotManagerInstances {
  botInstances: Map<number, BaseBotTrading>;
}

@Injectable()
export class BotManagerInstances implements IBotManagerInstances {
  botInstances: Map<number, BaseBotTrading> = new Map();

  private readonly logger = new Logger(BotManagerInstances.name);
  constructor(
    private readonly botManagerService: BotManagerService,

    @InjectRepository(DealEntity)
    private readonly dealRepo: Repository<DealEntity>,
    @InjectRepository(OrderEntity)
    private readonly orderRepo: Repository<OrderEntity>,

    private readonly telegramService: TelegramService,
  ) {}
  getBotById(id: number) {
    return this.botInstances.get(id);
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
      bot.stop();
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
    const bot = this.getBotById(id);
    if (bot) return bot;
    return 'bot not found';
  }

  // @Cron(CronExpression.EVERY_10_SECONDS)
  @Cron('*/20 * * * * *')
  async handleCron() {
    this.logger.debug('Called every 10 seconds');
    this.botInstances.forEach((bot) => {
      bot.watchPosition();
    });
  }
}

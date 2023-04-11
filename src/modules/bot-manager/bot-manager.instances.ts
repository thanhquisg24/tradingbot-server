import { Injectable, Logger } from '@nestjs/common';
import { BotTrading } from './bot-trading';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TEST_USER_ID, TelegramService } from '../telegram/telegram.service';

export interface IBotManagerInstances {
  botInstances: Map<string, BotTrading>;
}

@Injectable()
export class BotManagerInstances implements IBotManagerInstances {
  botInstances: Map<string, BotTrading> = new Map();

  constructor(private telegramService: TelegramService) {}
  private readonly logger = new Logger(BotManagerInstances.name);
  getBotById(id: string) {
    return this.botInstances.get(id);
  }

  addRunningBot(id: string) {
    const bot = this.getBotById(id);
    if (bot) {
      return 'already running bot#' + id;
    } else {
      const newBot = new BotTrading(id);
      newBot.start();
      this.botInstances.set(id, newBot);
      this.telegramService.sendMessageToUser(
        TEST_USER_ID,
        'add bot running #' + id,
      );
    }
    return 'add bot running #' + id;
  }

  stopBot(id: string) {
    const bot = this.getBotById(id);

    if (bot) {
      bot.stop();
      this.botInstances.delete(id);
      return 'stop bot #' + id;
    }
    return 'bot not found';
  }

  findAll() {
    const obj = Object.fromEntries(this.botInstances);
    return obj;
  }

  findOne(id: string) {
    const bot = this.getBotById(id);
    if (bot) return bot;
    return 'bot not found';
  }

  @Cron(CronExpression.EVERY_10_SECONDS)
  async handleCron() {
    this.logger.debug('Called every 10 seconds');
    this.botInstances.forEach((bot, key) => {
      bot.watchPosition();
    });
  }
}

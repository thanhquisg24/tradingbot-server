import { Injectable } from '@nestjs/common';
import { BotTrading } from './bot-trading';

export interface IBotManagerService {
  botInstances: Map<string, BotTrading>;
}

@Injectable()
export class BotManagerService implements IBotManagerService {
  botInstances: Map<string, BotTrading> = new Map();

  getBotById(id: string) {
    return this.botInstances.get(id);
  }

  addRunningBot(id: string) {
    const bot = this.getBotById(id);
    console.log(
      '🚀 ~ file: bot-manager.service.ts:18 ~ BotManagerService ~ addRunningBot ~ bot:',
      bot,
    );
    if (bot) {
      return 'already running bot#' + id;
    } else {
      const newBot = new BotTrading(id);
      newBot.executed();
      this.botInstances.set(id, newBot);
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
}

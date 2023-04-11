import { Logger } from '@nestjs/common';
import TelegramBot from 'node-telegram-bot-api'; // works after installing types

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;

export const TEST_USER_ID = '812358696';
export class TelegramService {
  private readonly bot: TelegramBot;

  constructor() {
    if (TELEGRAM_TOKEN) {
      this.bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

      this.sendMessageToUser(
        TEST_USER_ID,
        `Bot Server started at ${new Date()}`,
      );
    }
  }

  sendMessageToUser = (userId: string, message: string) => {
    this.bot.sendMessage(userId, message);
  };
}

// export const telegramService = new TelegramService();

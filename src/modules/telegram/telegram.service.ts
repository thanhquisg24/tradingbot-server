import { Injectable, Logger, Scope } from '@nestjs/common';
import TelegramBot from 'node-telegram-bot-api'; // works after installing types

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;

export const TEST_USER_ID = '812358696';
@Injectable()
export class TelegramService {
  private readonly bot: TelegramBot;
  private logger = new Logger(TelegramService.name);

  constructor() {
    this.bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

    this.bot.on('message', this.onReceiveMessage);

    this.sendMessageToUser(TEST_USER_ID, `Bot Server started at ${new Date()}`);
  }

  onReceiveMessage = (msg: any) => {
    this.logger.debug(msg);
  };

  sendMessageToUser = (userId: string, message: string) => {
    this.bot.sendMessage(userId, message);
  };
}

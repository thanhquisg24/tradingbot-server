import { Injectable } from '@nestjs/common';
import { InjectBot } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';
import { TelegrafContext } from './context.interface';

export const TEST_USER_ID = '812358696';
@Injectable()
export class TelegramService {
  constructor(@InjectBot() private bot: Telegraf<TelegrafContext>) {
    bot.telegram.sendMessage(
      TEST_USER_ID,
      `Bot Server started at ${new Date()}`,
    );
  }

  sendMessageToUser = (userId: string, message: string) => {
    try {
      this.bot.telegram.sendMessage(userId, message);
    } catch (ex) {
      console.log("Can't not send Msg Via telegram Bot");
    }
  };
}

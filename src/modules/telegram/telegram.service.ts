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
    bot.catch((err, ctx) => {
      console.log(`Ooops, encountered an error for ${ctx.updateType}`, err);
      throw err;
    });
  }

  sendMessageToUser = async (userId: string, message: string) => {
    try {
      await this.bot.telegram.sendMessage(userId, message);
    } catch (ex) {
      console.log("Can't not send Msg Via telegram Bot:" + ex.message);
    }
  };
}

import { BotTradingEntity } from 'src/modules/entities/bot.entity';

export interface IBotsAndCount {
  bots: BotTradingEntity[];
  count: number;
}

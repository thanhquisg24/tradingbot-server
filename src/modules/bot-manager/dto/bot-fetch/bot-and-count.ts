import { BotTradingBaseDTO } from 'src/modules/entity-to-dto/bot-dto';

export interface IBotsAndCount {
  bots: BotTradingBaseDTO[];
  count: number;
}

export class BotsAndCount implements IBotsAndCount {
  bots: BotTradingBaseDTO[];
  count: number;
}

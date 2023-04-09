import { BotTradingEntity } from 'src/modules/entities/bot.entity';

interface IBaseBotTrading {
  botConfig: BotTradingEntity;
}

export abstract class BaseBotTrading implements IBaseBotTrading {
  botConfig: BotTradingEntity;
  constructor(config: BotTradingEntity) {
    this.botConfig = config;
  }

  updateConfig(partConfig: Partial<BotTradingEntity>) {
    this.botConfig = { ...this.botConfig, ...partConfig };
  }
}

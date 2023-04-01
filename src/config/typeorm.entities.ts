import { BotTradingEntity } from '../modules/entities/bot.entity';
import { ExchangeEntity } from '../modules/entities/exchange.entity';
import { TokenEntity } from '../modules/entities/token.entity';
import { UserEntity } from '../modules/entities/user.entity';

const entities = [UserEntity, TokenEntity, ExchangeEntity, BotTradingEntity];

export default entities;

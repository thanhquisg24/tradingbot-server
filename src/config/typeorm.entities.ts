import { PairEntity } from '../modules/entities/pair.entity';
import { BotTradingEntity } from '../modules/entities/bot.entity';
import { ExchangeEntity } from '../modules/entities/exchange.entity';
import { TokenEntity } from '../modules/entities/token.entity';
import { UserEntity } from '../modules/entities/user.entity';
import { OrderEntity } from '../modules/entities/order.entity';
import { DealEntity } from '../modules/entities/deal.entity';

const entities = [
  UserEntity,
  TokenEntity,
  ExchangeEntity,
  BotTradingEntity,
  PairEntity,
  DealEntity,
  OrderEntity,
];

export default entities;

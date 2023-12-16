import { BotTradingEntity } from '../modules/entities/bot.entity';
import { DealEntity } from '../modules/entities/deal.entity';
import { DealSpotEntity } from '../modules/entities/deal.spot.entity';
import { ExchangeEntity } from '../modules/entities/exchange.entity';
import { OrderEntity } from '../modules/entities/order.entity';
import { OrderSpotEntity } from '../modules/entities/order.spot.entity';
import { PairEntity } from '../modules/entities/pair.entity';
import { ProtectionEventEntity } from '../modules/entities/protection-event.entity';
import { TokenEntity } from '../modules/entities/token.entity';
import { UserEntity } from '../modules/entities/user.entity';

const entities = [
  UserEntity,
  TokenEntity,
  ExchangeEntity,
  BotTradingEntity,
  PairEntity,
  DealEntity,
  OrderEntity,
  ProtectionEventEntity,
  OrderSpotEntity,
  DealSpotEntity,
];

export default entities;

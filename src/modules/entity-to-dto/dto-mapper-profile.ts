import { Mapper, createMap } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { BotTradingEntity } from '../entities/bot.entity';
import { BotTradingBaseDTO, BotTradingWithPairAndExchangeDTO } from './bot-dto';
import { DealEntity } from '../entities/deal.entity';
import { DealBaseDTO } from './deal-dto';
import { PairEntity } from '../entities/pair.entity';
import { PairDTO } from './pair-dto';
import { ExchangeEntity } from '../entities/exchange.entity';
import { ExchangeDTO } from './exchange-dto';

@Injectable()
export class DTOMapperProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper) => {
      createMap(mapper, BotTradingEntity, BotTradingBaseDTO);
      createMap(mapper, BotTradingEntity, BotTradingWithPairAndExchangeDTO);
      createMap(mapper, DealEntity, DealBaseDTO);
      createMap(mapper, PairEntity, PairDTO);
      createMap(mapper, ExchangeEntity, ExchangeDTO);
    };
  }
}

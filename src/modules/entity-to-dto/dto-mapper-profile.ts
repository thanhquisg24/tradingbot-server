import { Mapper, createMap } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { BotTradingEntity } from '../entities/bot.entity';
import { BotTradingBaseDTO } from './bot-dto';

@Injectable()
export class DTOMapperProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper) => {
      createMap(mapper, BotTradingEntity, BotTradingBaseDTO);
    };
  }
}

import { createMap, type Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { BotTradingEntity } from 'src/modules/entities/bot.entity';
import { BotTradingBaseDTO } from 'src/modules/entity-to-dto/bot-dto';

@Injectable()
export class BotMapperProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper) => {
      createMap(mapper, BotTradingEntity, BotTradingBaseDTO);
    };
  }
}

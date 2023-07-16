import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { createMap, type Mapper } from '@automapper/core';
import { Injectable } from '@nestjs/common';
import { CreateExchangePayload } from '../dto/create-exchange.payload';
import { CreateExchangeDto } from '../dto/create-exchange.dto';
import { UpdateExchangeDto } from '../dto/update-exchange.dto';

@Injectable()
export class ExchangeMapperProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper) => {
      createMap(mapper, CreateExchangePayload, CreateExchangeDto);
      createMap(mapper, CreateExchangePayload, UpdateExchangeDto);
    };
  }
}

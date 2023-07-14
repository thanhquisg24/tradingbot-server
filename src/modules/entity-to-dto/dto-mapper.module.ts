import { Global, Module } from '@nestjs/common';

import { AutomapperModule } from '@automapper/nestjs';
import { DTOMapperProfile } from './dto-mapper-profile';
import { TypeOrmModule } from '@nestjs/typeorm';
import entities from 'src/config/typeorm.entities';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature(entities), AutomapperModule],
  providers: [DTOMapperProfile],
  exports: [DTOMapperProfile],
})
export class DTOMapperModule {}

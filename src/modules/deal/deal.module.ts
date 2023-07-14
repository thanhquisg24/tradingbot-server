import { DTOMapperModule } from '../entity-to-dto/dto-mapper.module';
import { DealController } from './deal.controller';
import { DealService } from './deal.service';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import entities from 'src/config/typeorm.entities';

@Module({
  imports: [TypeOrmModule.forFeature(entities), DTOMapperModule],
  controllers: [DealController],
  providers: [DealService],
  exports: [DealService],
})
export class DealModule {}

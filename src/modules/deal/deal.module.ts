import { Module } from '@nestjs/common';
import { DealService } from './deal.service';
import { DealController } from './deal.controller';
import entities from 'src/config/typeorm.entities';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature(entities)],
  controllers: [DealController],
  providers: [DealService],
})
export class DealModule {}

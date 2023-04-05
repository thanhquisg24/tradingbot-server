import { Module } from '@nestjs/common';
import { SystemService } from './system.service';
import { SystemController } from './system.controller';
import { AutomapperModule } from '@automapper/nestjs';
import { TypeOrmModule } from '@nestjs/typeorm';
import entities from 'src/config/typeorm.entities';
import { ExchangeModule } from '../exchange/exchange.module';
import { ExchangeService } from '../exchange/exchange.service';
import { PairService } from '../pair/pair.service';
import { PairModule } from '../pair/pair.module';

@Module({
  imports: [
    AutomapperModule,
    TypeOrmModule.forFeature(entities),
    ExchangeModule,
    PairModule,
  ],
  controllers: [SystemController],
  providers: [SystemService, ExchangeService, PairService],
})
export class SystemModule {}

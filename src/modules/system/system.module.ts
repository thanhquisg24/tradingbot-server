import { AutomapperModule } from '@automapper/nestjs';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import entities from 'src/config/typeorm.entities';
import { ExchangeModule } from '../exchange/exchange.module';
import { PairModule } from '../pair/pair.module';
import { SystemController } from './system.controller';
import { SystemService } from './system.service';

@Module({
  imports: [
    AutomapperModule,
    TypeOrmModule.forFeature(entities),
    ExchangeModule,
    PairModule,
  ],
  controllers: [SystemController],
  providers: [SystemService],
  exports: [SystemService],
})
export class SystemModule {}

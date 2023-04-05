import { Module } from '@nestjs/common';
import { SystemService } from './system.service';
import { SystemController } from './system.controller';
import { AutomapperModule } from '@automapper/nestjs';
import { TypeOrmModule } from '@nestjs/typeorm';
import entities from 'src/config/typeorm.entities';
import { ExchangeModule } from '../exchange/exchange.module';
import { ExchangeService } from '../exchange/exchange.service';

@Module({
  imports: [
    AutomapperModule,
    TypeOrmModule.forFeature(entities),
    ExchangeModule,
  ],
  controllers: [SystemController],
  providers: [SystemService, ExchangeService],
})
export class SystemModule {}

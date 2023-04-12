import { AutomapperModule } from '@automapper/nestjs';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import entities from 'src/config/typeorm.entities';
import { ExchangeModule } from '../exchange/exchange.module';
import { ExchangeService } from '../exchange/exchange.service';
import { PairModule } from '../pair/pair.module';
import { PairService } from '../pair/pair.service';
import { TelegramService } from '../telegram/telegram.service';
import { BotManagerController } from './bot-manager.controller';
import { BotManagerInstances } from './bot-manager.instances';
import { BotManagerService } from './bot-manager.service';

@Module({
  imports: [
    ExchangeModule,
    PairModule,
    TypeOrmModule.forFeature(entities),
    AutomapperModule,
  ],
  controllers: [BotManagerController],
  providers: [
    BotManagerInstances,
    BotManagerService,
    ExchangeService,
    PairService,
    TelegramService,
  ],
})
export class BotManagerModule {}

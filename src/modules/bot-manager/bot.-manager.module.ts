import { AutomapperModule } from '@automapper/nestjs';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import entities from 'src/config/typeorm.entities';
import { ExchangeModule } from '../exchange/exchange.module';
import { PairModule } from '../pair/pair.module';
import { TelegramModule } from '../telegram/telegram.module';
import { BotManagerController } from './bot-manager.controller';
import { BotManagerInstances } from './bot-manager.instances';
import { BotManagerService } from './bot-manager.service';

@Module({
  imports: [
    TypeOrmModule.forFeature(entities),
    AutomapperModule,
    TelegramModule,
    ExchangeModule,
    PairModule,
  ],
  controllers: [BotManagerController],
  providers: [BotManagerInstances, BotManagerService],
  exports: [BotManagerInstances, BotManagerService],
})
export class BotManagerModule {}

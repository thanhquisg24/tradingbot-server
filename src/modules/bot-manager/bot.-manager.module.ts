import { Module } from '@nestjs/common';
import { BotManagerController } from './bot-manager.controller';
import { BotManagerInstances } from './bot-manager.instances';
import { BotManagerService } from './bot-manager.service';
import { ExchangeModule } from '../exchange/exchange.module';
import { ExchangeService } from '../exchange/exchange.service';
import { PairModule } from '../pair/pair.module';
import { PairService } from '../pair/pair.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BotTradingEntity } from '../entities/bot.entity';
import { AutomapperModule } from '@automapper/nestjs';
import { ExchangeEntity } from '../entities/exchange.entity';
import { PairEntity } from '../entities/pair.entity';

@Module({
  imports: [
    ExchangeModule,
    PairModule,
    TypeOrmModule.forFeature([BotTradingEntity, ExchangeEntity, PairEntity]),
    AutomapperModule,
  ],
  controllers: [BotManagerController],
  providers: [
    BotManagerInstances,
    BotManagerService,
    ExchangeService,
    PairService,
  ],
})
export class BotManagerModule {}

import { AutomapperModule } from '@automapper/nestjs';
import { BotManagerController } from './bot-manager.controller';
import { BotManagerInstances } from './bot-manager.instances';
import { BotManagerService } from './bot-manager.service';
import { BotMapperProfile } from './mapper/bot-mapper-profile';
import { DTOMapperModule } from '../entity-to-dto/dto-mapper.module';
import { ExchangeModule } from '../exchange/exchange.module';
import { Module } from '@nestjs/common';
import { PairModule } from '../pair/pair.module';
import { TelegramModule } from '../telegram/telegram.module';
import { TvWebhookController } from './tv-webhook/tv-webhook.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import entities from 'src/config/typeorm.entities';

@Module({
  imports: [
    TypeOrmModule.forFeature(entities),
    AutomapperModule,
    TelegramModule,
    ExchangeModule,
    PairModule,
    DTOMapperModule,
  ],
  controllers: [BotManagerController, TvWebhookController],
  providers: [BotManagerInstances, BotManagerService],
  exports: [BotManagerInstances, BotManagerService],
})
export class BotManagerModule {}

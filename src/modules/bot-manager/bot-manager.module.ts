import { AutomapperModule } from '@automapper/nestjs';
import { BotManagerController } from './bot-manager.controller';
import { BotManagerInstances } from './bot-manager.instances';
import { BotManagerService } from './bot-manager.service';
import { DTOMapperModule } from '../entity-to-dto/dto-mapper.module';
import { ExchangeModule } from '../exchange/exchange.module';
import { ManualWebhookController } from './manual-webhook/manual-webhook.controller';
import { Module } from '@nestjs/common';
import { PairModule } from '../pair/pair.module';
import { ProtectionEventModule } from '../protection-event/protection-event.module';
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
    ProtectionEventModule,
  ],
  controllers: [
    BotManagerController,
    TvWebhookController,
    ManualWebhookController,
  ],
  providers: [BotManagerInstances, BotManagerService],
  exports: [BotManagerInstances, BotManagerService],
})
export class BotManagerModule {}

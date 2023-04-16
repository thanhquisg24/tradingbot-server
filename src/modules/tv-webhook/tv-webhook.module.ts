import { Module } from '@nestjs/common';
import { BotManagerModule } from '../bot-manager/bot.-manager.module';
import { TvWebhookController } from './tv-webhook.controller';

@Module({
  imports: [BotManagerModule],
  controllers: [TvWebhookController],
})
export class TvWebhookModule {}

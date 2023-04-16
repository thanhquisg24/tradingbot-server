import { Module } from '@nestjs/common';
import { TvWebhookController } from './tv-webhook.controller';

@Module({
  controllers: [TvWebhookController],
})
export class TvWebhookModule {}

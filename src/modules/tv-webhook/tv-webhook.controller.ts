import { Body, Controller, Inject, LoggerService, Post } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ApiTags } from '@nestjs/swagger';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { BotManagerInstances } from '../bot-manager/bot-manager.instances';
import { TVPayload } from './dto/deal-tv.payload';
import { BotInstances } from '../bot-manager/instanses/bot-factory';

@ApiTags('Tv Webhook APIs')
@Controller('api/v1/tv-webhook')
export class TvWebhookController {
  constructor(
    private eventEmitter: EventEmitter2,
    private readonly instanses: BotManagerInstances,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {}

  @Post()
  closeDealAtMarketPrice(@Body() payload: TVPayload): void {
    // this.eventEmitter.emit(TV_DEAL_EVENT, payload);
    this.logger.log(
      `msg from tradingview ${JSON.stringify(payload)}`,
      TvWebhookController.name,
    );
    console.log(
      '🚀 ~ file: TvWebhookController',
      payload.botId,
      BotInstances.has(payload.botId),
    );
    console.log(
      '🚀 ~ file: TvWebhookController 2:',
      payload.botId,
      BotInstances.has(3),
    );
    this.instanses.handleTvEvent(payload);
  }
}

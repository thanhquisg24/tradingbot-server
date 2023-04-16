import { Body, Controller, Inject, LoggerService, Post } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ApiTags } from '@nestjs/swagger';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { TVPayload } from './dto/deal-tv.payload';
import { BotManagerInstances } from '../bot-manager.instances';

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
  handleTVSignal(@Body() payload: TVPayload): void {
    // this.eventEmitter.emit(TV_DEAL_EVENT, payload);
    this.logger.log(
      `msg from tradingview ${JSON.stringify(payload)}`,
      TvWebhookController.name,
    );

    this.instanses.handleTvEvent(payload);
  }
}

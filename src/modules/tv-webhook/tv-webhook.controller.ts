import { Body, Controller, Inject, LoggerService, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { TVPayload } from './dto/deal-tv.payload';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TV_DEAL_EVENT } from 'src/common/event/tv_events';

@ApiTags('Tv Webhook APIs')
@Controller('api/v1/tv-webhook')
export class TvWebhookController {
  constructor(
    private eventEmitter: EventEmitter2,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {}

  @Post()
  closeDealAtMarketPrice(@Body() payload: TVPayload): void {
    this.eventEmitter.emit(TV_DEAL_EVENT, payload);
    this.logger.log(
      `msg from tradingview ${JSON.stringify(payload)}`,
      TvWebhookController.name,
    );
  }
}

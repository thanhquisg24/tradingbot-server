import { Body, Controller, Post } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ApiTags } from '@nestjs/swagger';
import { TV_DEAL_EVENT } from 'src/common/event/tv_events';
import { TVPayload } from './dto/deal-tv.payload';

@ApiTags('Tv Webhook APIs')
@Controller('api/v1/tv-webhook')
export class TvWebhookController {
  constructor(private eventEmitter: EventEmitter2) {}

  @Post()
  handleTVSignal(@Body() payload: TVPayload) {
    this.eventEmitter.emit(TV_DEAL_EVENT, payload);
  }
}

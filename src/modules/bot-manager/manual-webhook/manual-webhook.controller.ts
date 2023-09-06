import { Body, Controller, Post } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ApiTags } from '@nestjs/swagger';
import {
  FUNDING_EVENT_KEY,
  ICommonFundingStartDeal,
  createstartFundingDealEvent,
} from 'src/common/event/funding_events';
import { FundingRateSignalPayload } from './dto/manual-tv.payload';

@ApiTags('Manual Webhook APIs')
@Controller('api/v1/manual-webhook')
export class ManualWebhookController {
  constructor(private eventEmitter: EventEmitter2) {}

  sendFundingDealEvent(payload: ICommonFundingStartDeal) {
    const event = createstartFundingDealEvent(payload);
    this.eventEmitter.emit(FUNDING_EVENT_KEY, event);
  }
  @Post('/funding-rate-signal')
  handleTVSignal(@Body() payload: FundingRateSignalPayload) {
    this.sendFundingDealEvent(payload);
  }
}

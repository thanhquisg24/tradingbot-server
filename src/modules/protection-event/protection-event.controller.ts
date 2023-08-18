import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Query, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { ProtectionEventService } from './protection-event.service';

@ApiTags('Protection Event APIs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/protection-event')
export class ProtectionEventController {
  constructor(
    private readonly protectionEventService: ProtectionEventService,
  ) {}

  @Get('/by-send-status')
  async getBySendStatus(
    @Query('dealId') dealId: number,
    @Query('botId') botId: number,
  ) {
    return this.protectionEventService.findSendEventByBotAndDeal(botId, dealId);
  }
}

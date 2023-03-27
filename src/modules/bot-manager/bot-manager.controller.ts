import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BotManagerService } from './bot-manager.service';

@Controller('api/v1/bot-manager')
@ApiTags('Bot Manager APIs')
export class BotManagerController {
  constructor(private readonly service: BotManagerService) {}

  @Get('/addRunningBot/:id')
  addRunningBot(@Param('id') id: string) {
    return this.service.addRunningBot(id);
  }

  @Get('/stopBot/:id')
  stopBot(@Param('id') id: string) {
    return this.service.stopBot(id);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }
}

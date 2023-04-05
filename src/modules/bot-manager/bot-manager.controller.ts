import {
  Controller,
  Get,
  Logger,
  Param,
  Post,
  UseGuards,
  Request,
  Body,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { BotManagerInstances } from './bot-manager.instances';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RequestWithUser } from '../auth/type';
import { BotManagerService } from './bot-manager.service';
import { CreateBotPayload } from './dto/create-bot.payload';

@Controller('api/v1/bot-manager')
@ApiTags('Bot Manager APIs')
export class BotManagerController {
  constructor(
    private readonly instanses: BotManagerInstances,
    private readonly service: BotManagerService,
  ) {}

  private logger = new Logger(BotManagerController.name);
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('/create-new-bot')
  createBot(
    @Request() req: RequestWithUser,
    @Body() createBotPayload: CreateBotPayload,
  ) {
    if (req.user.id !== createBotPayload.userId) {
      throw new Error('User is not valid !');
    }
    this.logger.debug(JSON.stringify(createBotPayload));
    return this.service.createWithPayload(createBotPayload);
  }

  @Get('/addRunningBot/:id')
  addRunningBot(@Param('id') id: string) {
    return this.instanses.addRunningBot(id);
  }

  @Get('/stopBot/:id')
  stopBot(@Param('id') id: string) {
    return this.instanses.stopBot(id);
  }

  @Get()
  findAll() {
    return this.instanses.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.instanses.findOne(id);
  }
}

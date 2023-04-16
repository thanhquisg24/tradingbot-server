import {
  Body,
  Controller,
  Get,
  Inject,
  LoggerService,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RequestWithUser } from '../auth/type';
import { BotManagerInstances } from './bot-manager.instances';
import { BotManagerService } from './bot-manager.service';
import { CreateBotPayload } from './dto/create-bot.payload';
import { BotPairsPayload } from './dto/update-bot.dto';
import { CloseDealAtMarketPrice } from './dto/close-deal-market-price.payload';
import { TVPayload } from './tv-webhook/dto/deal-tv.payload';
import { PostCommonPayload } from './dto/post-common';

@ApiTags('Bot Manager APIs')
@Controller('api/v1/bot-manager')
export class BotManagerController {
  constructor(
    private readonly instanses: BotManagerInstances,
    private readonly service: BotManagerService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {}

  // checkUser(req: RequestWithUser,userId:)

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
    this.logger.log(
      JSON.stringify(createBotPayload),
      BotManagerController.name,
    );
    return this.service.createWithPayload(createBotPayload);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('/close-deal-at-market-price')
  async closeDealAtMarketPrice(@Body() payload: CloseDealAtMarketPrice) {
    await this.instanses.closeDealAtMarketPrice(payload);
    return 'Action has been sent!';
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('/update-bot-pair')
  updateBotPairs(
    @Request() req: RequestWithUser,
    @Body() pairPayload: BotPairsPayload,
  ) {
    return this.service.updateBotPairs(req.user.id, pairPayload);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('/addRunningBot/:id')
  addRunningBot(@Request() req: RequestWithUser, @Param('id') id: number) {
    return this.instanses.addRunningBot(id, req.user);
  }

  @Get('/stopBot/:id')
  stopBot(@Param('id') id: number) {
    return this.instanses.stopBotIns(id);
  }

  @Get()
  findAll() {
    return this.instanses.getAllRunning();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.instanses.getRunningBotById(id);
  }
  @Post('/get-bot/:id')
  getBotId(@Param('id') id: number) {
    return this.instanses.getRunningBotById(id);
  }

  @Post('/get-bot-post')
  getBotIdPost(@Body() payload: PostCommonPayload) {
    return this.instanses.getRunningBotById(payload.id);
  }

  @Post('tv-webhooks')
  handleTVSignal(@Body() payload: TVPayload) {
    // this.eventEmitter.emit(TV_DEAL_EVENT, payload);

    console.log(
      '🚀 ~ file: bot-manager.controller.ts:98 ~ BotManagerController ~ handleTVSignal ~ payload:',
      payload,
    );
    const bot11 = this.instanses.getRunningBotById(3);
    console.log(
      '🚀 ~ file: bot-manager.controller.ts:99 ~ BotManagerController ~ handleTVSignal ~ bot11:',
      bot11,
    );
    return this.instanses.getRunningBotById(payload.botId);
    // return this.instanses.handleTvEvent(payload);
  }
}

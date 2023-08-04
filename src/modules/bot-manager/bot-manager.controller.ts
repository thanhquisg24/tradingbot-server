import {
  Body,
  Controller,
  Get,
  Inject,
  LoggerService,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RequestWithUser } from '../auth/type';
import { BotManagerInstances } from './bot-manager.instances';
import { BotManagerService } from './bot-manager.service';
import { CloseDealAtMarketPrice } from './dto/close-deal-market-price.payload';
import { CreateBotPayload } from './dto/create-bot.payload';
import { UpdateBotRefDto } from './dto/update-bot-ref';
import { BotPairsPayload, UpdateBotDto } from './dto/update-bot.dto';
import { IBotsAndCount } from './dto/bot-fetch/bot-and-count';
import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { BotTradingEntity, STRATEGY_DIRECTION } from '../entities/bot.entity';
import {
  BotTradingBaseDTO,
  BotTradingWithPairAndExchangeDTO,
} from '../entity-to-dto/bot-dto';

@ApiTags('Bot Manager APIs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/bot-manager')
export class BotManagerController {
  constructor(
    @InjectMapper() private readonly mapper: Mapper,
    private readonly instanses: BotManagerInstances,
    private readonly service: BotManagerService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {}

  // checkUser(req: RequestWithUser,userId:)

  @Post('/create-new-bot')
  async createBot(
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
    const data = await this.service.createWithPayload(createBotPayload);
    const botsDtos = this.mapper.map(data, BotTradingEntity, BotTradingBaseDTO);
    return botsDtos;
  }

  @Put('/update-bot')
  async updateBot(
    @Request() req: RequestWithUser,
    @Body() updateBotPayload: UpdateBotDto,
  ) {
    if (req.user.id !== updateBotPayload.userId) {
      throw new Error('User is not valid !');
    }
    this.logger.log(
      JSON.stringify(updateBotPayload),
      BotManagerController.name,
    );
    const data = await this.instanses.updateBotConfig(
      updateBotPayload.id,
      updateBotPayload,
    );
    const botsDtos = this.mapper.map(data, BotTradingEntity, BotTradingBaseDTO);
    return botsDtos;
  }

  @Post('/close-deal-at-market-price')
  async closeDealAtMarketPrice(@Body() payload: CloseDealAtMarketPrice) {
    const result = await this.instanses.closeDealAtMarketPrice(payload);
    return result;
  }

  @Put('/update-bot-pair')
  updateBotPairs(
    @Request() req: RequestWithUser,
    @Body() pairPayload: BotPairsPayload,
  ) {
    return this.service.updateBotPairs(req.user.id, pairPayload);
  }

  @Put('/add-running-bot/:id')
  addRunningBot(@Request() req: RequestWithUser, @Param('id') id: number) {
    return this.instanses.addRunningBot(id, req.user);
  }

  @Put('/stop-bot/:id')
  stopBot(@Param('id') id: number) {
    return this.instanses.stopBotIns(id);
  }

  @Get()
  findAll() {
    return this.instanses.getAllRunning();
  }

  @Get('/get-running-bot/:id')
  getBotId(@Param('id') id: number) {
    return this.instanses.getRunningBotById(id);
  }

  @Get('/get-bot-by-id/:id')
  async getBotWithExchangeAndPairs(@Param('id') id: number) {
    const data = await this.service.findOneRelationsExchangeAndPair(id);
    const dto = this.mapper.map(
      data,
      BotTradingEntity,
      BotTradingWithPairAndExchangeDTO,
    );
    return dto;
  }

  /**
   * update reduce bot reference
   * @param req
   * @param payload
   * @returns
   */

  @Put('/update-bot-ref')
  updateBotRef(
    @Request() req: RequestWithUser,
    @Body() payload: UpdateBotRefDto,
  ) {
    return this.service.updateBotRef(req.user.id, payload);
  }

  /**
   *
   * @param req
   * @returns
   */

  @Get('/get-all-bot-by-user')
  async getAllBotByUser(
    @Request() req: RequestWithUser,
  ): Promise<IBotsAndCount> {
    const data = await this.service.findByUser(req.user.id);
    const botsDtos = this.mapper.mapArray(
      data.bots,
      BotTradingEntity,
      BotTradingBaseDTO,
    );
    return {
      count: data.count,
      bots: botsDtos,
    };
  }

  @Get('/get-avai-protection-bots-by-user')
  async getAvaiableProtectionBotsByUser(
    @Request() req: RequestWithUser,
    @Query('direction') strategyDirection: STRATEGY_DIRECTION,
  ) {
    const data = await this.service.getAvaiableProtectionBotsByUser(
      req.user.id,
      strategyDirection,
    );
    const botsDtos = this.mapper.mapArray(
      data,
      BotTradingEntity,
      BotTradingBaseDTO,
    );
    return botsDtos;
  }
}

import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  LoggerService,
  NotFoundException,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RequestWithUser } from '../auth/type';
import { BotSpotEntity } from '../entities/bot.spot.extity';
import {
  BotSpotBaseDTO,
  BotSpotWithExchangeDTO,
} from '../entity-to-dto/bot-spot-dto';
import { BotSpotService } from './bot-spot.service';
import { CreateBotSpotPayload } from './dto/spot/create-bot-spot.payload';
import { UpdateBotDto } from './dto/update-bot.dto';

@ApiTags('Bot Spot APIs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/bot-spot')
export class BotSpotController {
  constructor(
    @InjectMapper() private readonly mapper: Mapper,
    private readonly service: BotSpotService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {}

  // checkUser(req: RequestWithUser,userId:)

  @Delete('/delete-bot/:id')
  async deleteBot(@Request() req: RequestWithUser, @Param('id') botId: number) {
    const bot = await this.service.findOne(botId);
    if (bot) {
      if (req.user.id !== bot.userId) {
        throw new BadRequestException('User is not valid !');
      }
      await this.service.deleteBot(botId);
      return 'success';
    }
    throw new NotFoundException('Bot not found');
  }

  @Post('/create-new-bot')
  async createBot(
    @Request() req: RequestWithUser,
    @Body() createBotPayload: CreateBotSpotPayload,
  ) {
    if (req.user.id !== createBotPayload.userId) {
      throw new BadRequestException('User is not valid !');
    }
    this.logger.log(JSON.stringify(createBotPayload), BotSpotController.name);
    const data = await this.service.createWithPayload(createBotPayload);
    const botsDtos = this.mapper.map(
      data,
      BotSpotEntity,
      BotSpotWithExchangeDTO,
    );
    return botsDtos;
  }

  @Put('/update-bot')
  async updateBot(
    @Request() req: RequestWithUser,
    @Body() updateBotPayload: UpdateBotDto,
  ) {
    if (req.user.id !== updateBotPayload.userId) {
      throw new BadRequestException('User is not valid !');
    }
    this.logger.log(JSON.stringify(updateBotPayload), BotSpotController.name);
    const data = await this.service.updateBotConfig(
      updateBotPayload.id,
      updateBotPayload,
    );
    const botsDtos = this.mapper.map(data, BotSpotEntity, BotSpotBaseDTO);
    return botsDtos;
  }

  @Put('/add-running-bot/:id')
  addRunningBot(@Request() req: RequestWithUser, @Param('id') id: number) {
    return this.service.addRunningBot(id, req.user);
  }

  @Put('/stop-bot/:id')
  stopBot(@Param('id') id: number) {
    return this.service.stopBotIns(id);
  }

  @Get()
  findAll() {
    return this.service.getAllRunning();
  }

  @Get('/get-running-bot/:id')
  getBotId(@Param('id') id: number) {
    return this.service.getRunningBotById(id);
  }

  @Get('/get-bot-by-id/:id')
  async getBotWithExchange(@Param('id') id: number) {
    const data = await this.service.findOneRelationsExchange(id);
    const dto = this.mapper.map(data, BotSpotEntity, BotSpotWithExchangeDTO);
    return dto;
  }

  /**
   *
   * @param req
   * @returns
   */

  @Get('/get-all-bot-by-user')
  async getAllBotByUser(@Request() req: RequestWithUser) {
    const data = await this.service.findByUser(req.user.id);
    const botsDtos = this.mapper.mapArray(
      data.bots,
      BotSpotEntity,
      BotSpotBaseDTO,
    );
    return {
      count: data.count,
      bots: botsDtos,
    };
  }
}

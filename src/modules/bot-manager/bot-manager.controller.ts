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
import { CreateExchangePayload } from '../exchange/dto/create-exchange.payload';

@Controller('api/v1/bot-manager')
@ApiTags('Bot Manager APIs')
export class BotManagerController {
  constructor(private readonly service: BotManagerInstances) {}

  private logger = new Logger(BotManagerController.name);
  //handle login
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  createBot(
    @Request() req: RequestWithUser,
    @Body() createExchangePayload: CreateExchangePayload,
  ) {
    const createExchangedto = this.mapper.map(
      createExchangePayload,
      CreateExchangePayload,
      CreateExchangeDto,
    );
    createExchangedto.user = req.user;
    this.logger.debug(JSON.stringify(createExchangePayload));
    this.logger.debug(JSON.stringify(createExchangedto));
    return this.exchangeService.create(createExchangedto);
  }

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

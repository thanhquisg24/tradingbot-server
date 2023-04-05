import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Logger,
  UseGuards,
  Request,
  NotFoundException,
} from '@nestjs/common';
import { SystemService } from './system.service';
import { CreateSystemDto } from './dto/create-system.dto';
import { UpdateSystemDto } from './dto/update-system.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { ExchangeService } from '../exchange/exchange.service';
import { RequestWithUser } from '../auth/type';
import { ExchangesEnum } from '../entities/exchange.entity';
import { ExchangeFactory } from '../exchange/remote-api/exchange.remote.api';

@Controller('api/v1/system')
@ApiTags('System APIs')
export class SystemController {
  constructor(
    private readonly systemService: SystemService,
    private readonly exChangeService: ExchangeService,
  ) {}

  private logger = new Logger(SystemController.name);
  //handle login
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('/init-binance-usdm-pair')
  async initBinancePairs(@Request() req: RequestWithUser) {
    // return this.systemService.create(createSystemDto);
    const exchangeRow = await this.exChangeService.findByUserAndExchangeName(
      req.user.id,
      ExchangesEnum.BINANCEUSDM,
    );
    if (exchangeRow) {
      const _exchange = ExchangeFactory.createExchange(
        exchangeRow.name,
        exchangeRow.apiKey,
        exchangeRow.apiSecret,
        exchangeRow.name === ExchangesEnum.PAPER,
      );
      const exInfo = await _exchange.checkExchangeOnlineStatus();
      console.log(
        '🚀 ~ file: system.controller.ts:51 ~ SystemController ~ initBinancePairs ~ exInfo:',
        exInfo,
      );
      this.logger.log('init-binance-usdm-pair OK!');
      return 'init-binance-usdm-pair OK!';
    }
    throw new NotFoundException(
      "Can't not found " + ExchangesEnum.BINANCEUSDM + ' row of current user!',
    );
  }

  @Post()
  create(@Body() createSystemDto: CreateSystemDto) {
    return this.systemService.create(createSystemDto);
  }

  @Get()
  findAll() {
    return this.systemService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.systemService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSystemDto: UpdateSystemDto) {
    return this.systemService.update(+id, updateSystemDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.systemService.remove(+id);
  }
}

import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  NotFoundException,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RequestWithUser } from '../auth/type';
import { ExchangesEnum } from '../entities/exchange.entity';
import { PairEntity } from '../entities/pair.entity';
import { ExchangeService } from '../exchange/exchange.service';
import { ExchangeFactory } from '../exchange/remote-api/exchange.remote.api';
import { PairService } from '../pair/pair.service';
import { CreateSystemDto } from './dto/create-system.dto';
import { UpdateSystemDto } from './dto/update-system.dto';
import { SystemService } from './system.service';

@Controller('api/v1/system')
@ApiTags('System APIs')
export class SystemController {
  constructor(
    private readonly systemService: SystemService,
    private readonly exChangeService: ExchangeService,
    private readonly pairService: PairService,
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
        exchangeRow.id,
        exchangeRow.name,
        exchangeRow.apiKey,
        exchangeRow.apiSecret,
        exchangeRow.isTestNet,
      );
      const exInfo = await _exchange.checkExchangeOnlineStatus();
      if (exInfo) {
        const ccxtExchange = _exchange.getCcxtExchange();
        await ccxtExchange.loadMarkets();
        const symbolsUsdt = ccxtExchange.symbols.filter((e) => {
          return e.endsWith(':USDT');
        });
        console.log(
          '🚀 ~ file: system.controller.ts:61 ~ SystemController ~ symbolsUsdt ~ symbolsUsdt:',
          symbolsUsdt,
        );
        const pairs: PairEntity[] = symbolsUsdt.reduce(
          (store: PairEntity[], cur: string) => {
            const commonPair = cur.split(':USDT')[0];
            const p = new PairEntity(exchangeRow.name, commonPair, cur);
            return [...store, p];
          },
          [],
        );
        await this.pairService.saveBatch(pairs);
        this.logger.log('init-binance-usdm-pair OK!');
        return 'init-binance-usdm-pair OK!';
      }
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

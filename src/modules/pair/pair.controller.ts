import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { PairService } from './pair.service';
import { CreatePairDto } from './dto/create-pair.dto';
import { UpdatePairDto } from './dto/update-pair.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { ExchangesEnum } from '../entities/exchange.entity';
import { PairDTO } from '../entity-to-dto/pair-dto';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { PairEntity } from '../entities/pair.entity';
import { ExchangeService } from '../exchange/exchange.service';

@ApiTags('Pair APIs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/pair')
export class PairController {
  constructor(
    @InjectMapper() private readonly mapper: Mapper,
    private readonly pairService: PairService,
    private readonly exchangeService: ExchangeService,
  ) {}

  @Post()
  create(@Body() createPairDto: CreatePairDto) {
    return this.pairService.create(createPairDto);
  }

  @Get('by-exchange/:fromExchange')
  async getAllPairByExchange(
    @Param('fromExchange') fromExchange: ExchangesEnum,
  ): Promise<PairDTO[]> {
    const data = await this.pairService.getAllPairByExchange(fromExchange);
    const dtos = this.mapper.mapArray(data, PairEntity, PairDTO);
    return dtos;
  }

  @Get('by-exchange-id/:exchangeId')
  async getAllPairByExchangeId(
    @Param('exchangeId') exchangeId: number,
  ): Promise<PairDTO[]> {
    const ex = await this.exchangeService.findOne(exchangeId);
    const fromExchange: ExchangesEnum = ex.name;
    const data = await this.pairService.getAllPairByExchange(fromExchange);
    const dtos = this.mapper.mapArray(data, PairEntity, PairDTO);
    return dtos;
  }

  @Get()
  findAll() {
    return this.pairService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pairService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePairDto: UpdatePairDto) {
    return this.pairService.update(+id, updatePairDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pairService.remove(+id);
  }
}

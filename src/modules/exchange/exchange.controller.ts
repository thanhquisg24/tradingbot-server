import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  LoggerService,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { ROLE } from 'src/common/constants';
import { HasRoles } from 'src/common/decorators/has-roles.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { RequestWithUser } from '../auth/type';
import { ExchangeEntity } from '../entities/exchange.entity';
import { ExchangeDTO } from '../entity-to-dto/exchange-dto';
import { CreateExchangeDto } from './dto/create-exchange.dto';
import { CreateExchangePayload } from './dto/create-exchange.payload';
import { UpdateExchangeDto } from './dto/update-exchange.dto';
import { ExchangeService } from './exchange.service';

@ApiBearerAuth()
@ApiTags('Exchange APIs')
@UseGuards(JwtAuthGuard)
@Controller('api/v1/exchange')
export class ExchangeController {
  constructor(
    @InjectMapper() private readonly mapper: Mapper,
    private readonly exchangeService: ExchangeService,

    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {}

  @Post()
  async create(
    @Request() req: RequestWithUser,
    @Body() createExchangePayload: CreateExchangePayload,
  ) {
    const createExchangedto = this.mapper.map(
      createExchangePayload,
      CreateExchangePayload,
      CreateExchangeDto,
    );
    createExchangedto.user = req.user;
    this.logger.log(
      `User #${req.user.id} Creating exchange row : ${
        (JSON.stringify(createExchangePayload), ExchangeController.name)
      }`,
    );
    const data = await this.exchangeService.create(createExchangedto);
    const exDtos = this.mapper.map(data, ExchangeEntity, ExchangeDTO);
    return exDtos;
  }

  @Get('get-all-exchange-by-user')
  async getAllExChangeByUser(@Request() req: RequestWithUser) {
    const data = await this.exchangeService.getAllExChangeByUser(req.user.id);
    const exDtos = this.mapper.mapArray(data, ExchangeEntity, ExchangeDTO);
    return exDtos;
  }

  @HasRoles(ROLE.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  findAll() {
    return this.exchangeService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.exchangeService.findOne(+id);
    const exDtos = this.mapper.map(data, ExchangeEntity, ExchangeDTO);
    return exDtos;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put(':id')
  update(
    @Request() req: RequestWithUser,
    @Param('id') id: string,
    @Body() createExchangePayload: CreateExchangePayload,
  ) {
    const updateExchangedto = this.mapper.map(
      createExchangePayload,
      CreateExchangePayload,
      UpdateExchangeDto,
    );
    updateExchangedto.user = req.user;
    updateExchangedto.id = +id;
    this.logger.log(
      `User #${req.user.id} Update exchange row : ${
        (JSON.stringify(createExchangePayload), ExchangeController.name)
      }`,
    );
    return this.exchangeService.update(+id, updateExchangedto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: RequestWithUser) {
    return this.exchangeService.removeByUser(+id, req.user.id);
  }
}

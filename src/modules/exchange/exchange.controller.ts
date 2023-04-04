import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Logger,
} from '@nestjs/common';
import { ExchangeService } from './exchange.service';
import { CreateExchangeDto } from './dto/create-exchange.dto';
import { UpdateExchangeDto } from './dto/update-exchange.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { HasRoles } from 'src/common/decorators/has-roles.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { ROLE } from 'src/common/constants';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { CreateExchangePayload } from './dto/create-exchange.payload';
import { RequestWithUser } from '../auth/type';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';

@Controller('api/v1/exchange')
@ApiTags('Exchange APIs')
export class ExchangeController {
  constructor(
    @InjectMapper() private readonly mapper: Mapper,
    private readonly exchangeService: ExchangeService,
  ) {}

  private logger = new Logger(ExchangeController.name);
  //handle login
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  create(
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

  @Get()
  findAll() {
    return this.exchangeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.exchangeService.findOne(+id);
  }

  @ApiBearerAuth()
  @HasRoles(ROLE.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTokenDto: UpdateExchangeDto) {
    return this.exchangeService.update(+id, updateTokenDto);
  }

  @ApiBearerAuth()
  @HasRoles(ROLE.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.exchangeService.remove(+id);
  }
}

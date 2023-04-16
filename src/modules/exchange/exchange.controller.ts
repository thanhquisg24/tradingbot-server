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
  Patch,
  Post,
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
import { CreateExchangeDto } from './dto/create-exchange.dto';
import { CreateExchangePayload } from './dto/create-exchange.payload';
import { UpdateExchangeDto } from './dto/update-exchange.dto';
import { ExchangeService } from './exchange.service';

@Controller('api/v1/exchange')
@ApiTags('Exchange APIs')
export class ExchangeController {
  constructor(
    @InjectMapper() private readonly mapper: Mapper,
    private readonly exchangeService: ExchangeService,

    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {}

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
    this.logger.log(
      `User #${req.user.id} Creating exchange row : ${
        (JSON.stringify(createExchangePayload), ExchangeController.name)
      }`,
    );
    return this.exchangeService.create(createExchangedto);
  }

  @ApiBearerAuth()
  @HasRoles(ROLE.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
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

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
import { ExchangeService } from './exchange.service';
import { CreateTokenDto } from './dto/create-exchange.dto';
import { UpdateTokenDto } from './dto/update-exchange.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { HasRoles } from 'src/common/decorators/has-roles.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { ROLE } from 'src/common/constants';
import { RolesGuard } from 'src/common/guards/roles.guard';

@Controller('api/v1/exchange')
@ApiTags('Exchange APIs')
export class ExchangeController {
  constructor(private readonly exchangeService: ExchangeService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  create(@Body() createTokenDto: CreateTokenDto) {
    return this.exchangeService.create(createTokenDto);
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
  update(@Param('id') id: string, @Body() updateTokenDto: UpdateTokenDto) {
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

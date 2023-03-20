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
import { ReceivedTokenScheduleService } from './received_token_schedule.service';
import { CreateReceivedTokenScheduleDto } from './dto/create-received_token_schedule.dto';
import { UpdateReceivedTokenScheduleDto } from './dto/update-received_token_schedule.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { ROLE } from 'src/common/constants';
import { HasRoles } from 'src/common/decorators/has-roles.decorator';

@Controller('api/v1/received-token-schedule')
export class ReceivedTokenScheduleController {
  constructor(
    private readonly receivedTokenScheduleService: ReceivedTokenScheduleService,
  ) {}

  @ApiBearerAuth()
  @HasRoles(ROLE.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  create(
    @Body() createReceivedTokenScheduleDto: CreateReceivedTokenScheduleDto,
  ) {
    return this.receivedTokenScheduleService.create(
      createReceivedTokenScheduleDto,
    );
  }

  @Get()
  findAll() {
    return this.receivedTokenScheduleService.findAll();
  }

  @ApiBearerAuth()
  @Get('/user/:userId')
  @UseGuards(JwtAuthGuard)
  findAllByUserId(@Param('userId') userId: number) {
    return this.receivedTokenScheduleService.findByUserId(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.receivedTokenScheduleService.findOne(+id);
  }

  @ApiBearerAuth()
  @HasRoles(ROLE.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateReceivedTokenScheduleDto: UpdateReceivedTokenScheduleDto,
  ) {
    return this.receivedTokenScheduleService.update(
      +id,
      updateReceivedTokenScheduleDto,
    );
  }

  @ApiBearerAuth()
  @HasRoles(ROLE.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.receivedTokenScheduleService.remove(+id);
  }
}

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
} from '@nestjs/common';
import { DealService } from './deal.service';
import { CreateDealDto } from './dto/create-deal.dto';
import { UpdateDealDto } from './dto/update-deal.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RequestWithUser } from '../auth/type';
import { DealBaseDTO } from '../entity-to-dto/deal-dto';
import { DealEntity } from '../entities/deal.entity';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';

@ApiTags('Deal APIs')
@Controller('api/v1/deal')
export class DealController {
  constructor(
    @InjectMapper() private readonly mapper: Mapper,
    private readonly dealService: DealService,
  ) {}

  @Post()
  create(@Body() createDealDto: CreateDealDto) {
    return this.dealService.create(createDealDto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('/cancel-deal/:id')
  cancelDeal(@Request() req: RequestWithUser, @Param('id') id: number) {
    const userId = req.user.id;
    return this.dealService.cancelDeal(id, userId);
  }

  @Get()
  findAll() {
    return this.dealService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dealService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDealDto: UpdateDealDto) {
    return this.dealService.update(+id, updateDealDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.dealService.remove(+id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('/get-active-deals-by-bot-id/:botId')
  async getActiveDealsByBotId(
    @Param('botId') id: number,
  ): Promise<DealBaseDTO[]> {
    const data = await this.dealService.findActiveDealsByBotId(id);
    const dtos = this.mapper.mapArray(data, DealEntity, DealBaseDTO);
    return dtos;
  }
}

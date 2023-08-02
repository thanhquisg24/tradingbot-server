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
  Query,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { DealService } from './deal.service';
import { CreateDealDto } from './dto/create-deal.dto';
import { UpdateDealDto } from './dto/update-deal.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RequestWithUser } from '../auth/type';
import { DealBaseDTO, DealWithOrderDTO } from '../entity-to-dto/deal-dto';
import { DealEntity } from '../entities/deal.entity';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { IPaginationMeta, Pagination } from 'nestjs-typeorm-paginate';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
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

  @Get('/get-active-deals-by-bot-id/:botId')
  async getActiveDealsByBotId(
    @Param('botId') id: number,
  ): Promise<DealWithOrderDTO[]> {
    const data = await this.dealService.findActiveDealsByBotId(id);
    const dtos = this.mapper.mapArray(data, DealEntity, DealWithOrderDTO);
    return dtos;
  }

  @Get('/pagg-active-deals-by-bot-id/:botId')
  async paggActiveDealsByBotId(
    @Param('botId') botId: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 20,
  ): Promise<Pagination<DealWithOrderDTO, IPaginationMeta>> {
    limit = limit > 100 ? 100 : limit;
    const paggData = await this.dealService.paginateActiveDealsByBotId(
      {
        page,
        limit,
        route: `http://bottrading.creo.vn/api/v1/deal/pagg-active-deals-by-bot-id/${botId}`,
      },
      botId,
    );
    const deals = paggData.items;
    const dtos = this.mapper.mapArray(deals, DealEntity, DealWithOrderDTO);
    const paggDto: Pagination<DealWithOrderDTO, IPaginationMeta> = {
      ...paggData,
      items: dtos,
    };
    return paggDto;
  }

  @Get('/count-active-deals-by-bot-id/:botId')
  async countActiveDealsByBotId(@Param('botId') id: number): Promise<number> {
    const data = await this.dealService.countActiveDealsByBotId(id);
    return data;
  }
}

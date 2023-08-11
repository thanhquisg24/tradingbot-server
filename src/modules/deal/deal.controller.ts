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
  Put,
} from '@nestjs/common';
import { DealService } from './deal.service';
import { CreateDealDto } from './dto/create-deal.dto';
import { UpdateDealDto } from './dto/update-deal.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RequestWithUser } from '../auth/type';
import {
  DealBaseDTO,
  DealBaseWithBotName,
  DealWithOrderDTO,
} from '../entity-to-dto/deal-dto';
import { DEAL_STATUS, DealEntity } from '../entities/deal.entity';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { IPaginationMeta, Pagination } from 'nestjs-typeorm-paginate';
import { OrderEntity } from '../entities/order.entity';
import { OrderBaseDTO } from '../entity-to-dto/order-dto';
import { STRATEGY_DIRECTION } from '../entities/bot.entity';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@ApiTags('Deal APIs')
@Controller('api/v1/deal')
export class DealController {
  constructor(
    @InjectMapper() private readonly mapper: Mapper,
    private readonly dealService: DealService,
  ) {}

  @Post('/create')
  create(@Body() createDealDto: CreateDealDto) {
    return this.dealService.create(createDealDto);
  }

  @Put('/cancel-deal/:id')
  cancelDeal(@Request() req: RequestWithUser, @Param('id') id: number) {
    const userId = req.user.id;
    return this.dealService.cancelDeal(id, userId);
  }

  @Get('by-id/:id')
  findOne(@Param('id') id: string) {
    return this.dealService.findOne(+id);
  }

  @Patch('by-id/:id')
  update(@Param('id') id: string, @Body() updateDealDto: UpdateDealDto) {
    return this.dealService.update(+id, updateDealDto);
  }

  @Delete('by-id/:id')
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

  @Get('/pagg-deals-by-bot-id/:botId')
  async paggDealsByBotId(
    @Param('botId') botId: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 20,
  ): Promise<Pagination<DealWithOrderDTO, IPaginationMeta>> {
    limit = limit > 100 ? 100 : limit;
    const paggData = await this.dealService.paginateDealsByBotId(
      {
        page,
        limit,
        route: `http://bottrading.creo.vn/api/v1/deal/pagg-deals-by-bot-id/${botId}`,
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

  // Promise<Pagination<DealBaseWithBotName, IPaginationMeta>>
  @Get('/pagg-builder-deals-by-current-user')
  async paggBuilderDealsByUserId(
    @Request() req: RequestWithUser,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 20,

    @Query('dealStatus') dealStatus?: string,
    @Query('direction') direction?: STRATEGY_DIRECTION,
    @Query('botId') botId?: number,
  ): Promise<any> {
    limit = limit > 100 ? 100 : limit;
    const paggData = await this.dealService.paginateBuilderDealsByUserId(
      {
        page,
        limit,
        route: `http://bottrading.creo.vn/api/v1/deal/pagg-builder-deals-by-current-user`,
      },
      req.user.id,
      dealStatus,
      direction,
      botId,
    );

    return paggData;
  }

  @Get('/pagg-demo')
  paggBuilderDemo() {
    return 'pagg-demo ok ';
  }

  @Get('/count-active-deals-by-bot-id/:botId')
  async countActiveDealsByBotId(@Param('botId') id: number): Promise<number> {
    const data = await this.dealService.countActiveDealsByBotId(id);
    return data;
  }
  @Get('/fetch-orders-by-deal/:dealId')
  async getOrdersByDealId(@Param('dealId') id: number) {
    const data = await this.dealService.getOrdersByDealId(id);
    const dtos = this.mapper.mapArray(data, OrderEntity, OrderBaseDTO);
    return dtos;
  }
}

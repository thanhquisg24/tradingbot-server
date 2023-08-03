import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { CreateDealDto } from './dto/create-deal.dto';
import { UpdateDealDto } from './dto/update-deal.dto';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { InjectRepository } from '@nestjs/typeorm';
import { DealEntity, DEAL_STATUS } from '../entities/deal.entity';
import { Repository } from 'typeorm';
import {
  IPaginationOptions,
  Pagination,
  paginate,
  paginateRaw,
} from 'nestjs-typeorm-paginate';
import { BotTradingEntity } from '../entities/bot.entity';

@Injectable()
export class DealService {
  constructor(
    @InjectRepository(DealEntity)
    private readonly dealRepo: Repository<DealEntity>,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {}

  async cancelDeal(id: number, userId: number) {
    try {
      await this.dealRepo.update(
        { id, userId },
        { status: DEAL_STATUS.CANCELED },
      );
      return 'Success!';
    } catch (error) {
      this.logger.error('Cancel Deal error #' + id, DealService.name);
      throw new Error('Cancel Deal error');
    }
  }
  create(createDealDto: CreateDealDto) {
    return 'This action adds a new deal';
  }

  findAll() {
    return `This action returns all deal`;
  }

  findOne(id: number) {
    return `This action returns a #${id} deal`;
  }

  update(id: number, updateDealDto: UpdateDealDto) {
    return `This action updates a #${id} deal`;
  }

  remove(id: number) {
    return `This action removes a #${id} deal`;
  }

  findActiveDealsByBotId(botId: number) {
    return this.dealRepo.find({
      relations: ['orders'],
      where: { status: DEAL_STATUS.ACTIVE, botId },
    });
  }

  async paginateDealsByBotId(
    options: IPaginationOptions,
    botId: number,
  ): Promise<Pagination<DealEntity>> {
    return paginate<DealEntity>(this.dealRepo, options, {
      relations: ['orders'],
      where: { botId },
      order: {
        id: 'DESC',
        status: 'DESC',
      },
    });
  }

  async paginateBuilderDealsByUserId(
    options: IPaginationOptions,
    userId: number,
  ): Promise<any> {
    const queryBuilder = this.dealRepo
      .createQueryBuilder('deal')
      // .select([
      //   'deal.id',

      //   'deal.userId',

      //   'deal.botId',

      //   'deal.exchangeId',

      //   'deal.clientDealType',

      //   'deal.status',

      //   'deal.startAt',

      //   'deal.endAt',

      //   'deal.profit',

      //   'deal.pair',

      //   'deal.refReduceDealId',

      //   'deal.curAvgPrice',

      //   'deal.curQuantity',

      //   'deal.curReduceCount',

      //   'deal.maxReduceCount',

      //   'deal.baseOrderSize',

      //   'deal.safetyOrderSize',

      //   'deal.strategyDirection',

      //   'deal.startOrderType',

      //   'deal.dealStartCondition',

      //   'deal.targetProfitPercentage',

      //   'deal.useStopLoss',

      //   'deal.targetStopLossPercentage',

      //   'deal.curSafetyTradesCount',

      //   'deal.maxSafetyTradesCount',

      //   'deal.maxActiveSafetyTradesCount',

      //   'deal.reduceDeviationPercentage',

      //   'deal.priceDeviationPercentage',

      //   'deal.safetyOrderVolumeScale',

      //   'deal.safetyOrderStepScale',
      // ])
      .select('deal.id', 'id')
      .addSelect('deal.userId', 'userId')
      .addSelect('deal.botId', 'botId')
      .addSelect('deal.exchangeId', 'exchangeId')
      .addSelect('deal.clientDealType', 'clientDealType')
      .addSelect('deal.status', 'status')
      .addSelect('deal.startAt', 'startAt')
      .addSelect('deal.endAt', 'endAt')
      .addSelect('deal.profit', 'profit')
      .addSelect('deal.pair', 'pair')
      .addSelect('deal.refReduceDealId', 'refReduceDealId')
      .addSelect('deal.curAvgPrice', 'curAvgPrice')
      .addSelect('deal.curQuantity', 'curQuantity')
      .addSelect('deal.curReduceCount', 'curReduceCount')
      .addSelect('deal.maxReduceCount', 'maxReduceCount')
      .addSelect('deal.baseOrderSize', 'baseOrderSize')
      .addSelect('deal.safetyOrderSize', 'safetyOrderSize')
      .addSelect('deal.strategyDirection', 'strategyDirection')
      .addSelect('deal.startOrderType', 'startOrderType')
      .addSelect('deal.dealStartCondition', 'dealStartCondition')
      .addSelect('deal.targetProfitPercentage', 'targetProfitPercentage')
      .addSelect('deal.useStopLoss', 'useStopLoss')
      .addSelect('deal.targetStopLossPercentage', 'targetStopLossPercentage')
      .addSelect('deal.curSafetyTradesCount', 'curSafetyTradesCount')
      .addSelect('deal.maxSafetyTradesCount', 'maxSafetyTradesCount')
      .addSelect(
        'deal.maxActiveSafetyTradesCount',
        'maxActiveSafetyTradesCount',
      )
      .addSelect('deal.reduceDeviationPercentage', 'reduceDeviationPercentage')
      .addSelect('deal.priceDeviationPercentage', 'priceDeviationPercentage')
      .addSelect('deal.safetyOrderVolumeScale', 'safetyOrderVolumeScale')
      .addSelect('deal.safetyOrderStepScale', 'safetyOrderStepScale')
      .addSelect('bot.name', 'botName')
      .leftJoin(BotTradingEntity, 'bot', 'bot.id = deal.botId')
      // .from(DealEntity, 'deal')
      .where('deal.userId = :userId', { userId })
      .orderBy({
        'deal.status': 'DESC',
        'deal.id': 'DESC',
      });
    return paginateRaw(queryBuilder, options);
    // return this.paginateDealsByBotId(options, 2);
  }

  countActiveDealsByBotId(botId: number) {
    return this.dealRepo.countBy({ status: DEAL_STATUS.ACTIVE, botId });
  }
}

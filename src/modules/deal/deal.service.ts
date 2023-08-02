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
} from 'nestjs-typeorm-paginate';

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

  async paginateActiveDealsByBotId(
    options: IPaginationOptions,
    botId: number,
  ): Promise<Pagination<DealEntity>> {
    return paginate<DealEntity>(this.dealRepo, options, {
      relations: ['orders'],
      where: { status: DEAL_STATUS.ACTIVE, botId },
      order: {
        id: 'DESC',
      },
    });
  }

  countActiveDealsByBotId(botId: number) {
    return this.dealRepo.countBy({ status: DEAL_STATUS.ACTIVE, botId });
  }
}

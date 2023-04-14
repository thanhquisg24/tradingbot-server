import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BotTradingEntity } from '../entities/bot.entity';
import { ExchangeService } from '../exchange/exchange.service';
import { PairService } from '../pair/pair.service';
import { mappingNewBot } from './bot-utils';
import { CreateBotPayload } from './dto/create-bot.payload';
import { BotPairsPayload } from './dto/update-bot.dto';
import { COMMON_STATUS } from 'src/common/constants';

@Injectable()
export class BotManagerService {
  constructor(
    @InjectRepository(BotTradingEntity)
    private readonly repo: Repository<BotTradingEntity>,
    private readonly exchangeService: ExchangeService,
    private readonly pairService: PairService,
  ) {}

  async create(entity: BotTradingEntity) {
    return await this.repo.save(entity);
  }

  async createWithPayload(payload: CreateBotPayload) {
    const exchange = await this.exchangeService.findOne(payload.exchangeId);
    const pairs = await this.pairService.findByIds(payload.listPair);
    const newBot = mappingNewBot(payload, exchange, pairs);
    return this.create(newBot);
  }

  async updateBotPairs(userId: number, pairPayload: BotPairsPayload) {
    const entity: BotTradingEntity = await this.repo.findOne({
      where: {
        id: pairPayload.id,
        userId,
      },
    });
    if (entity) {
      const listPair = await this.pairService.findByIds(pairPayload.pairs);
      entity.pairs = listPair;
      await this.repo.save(entity);
      return 'Success';
    }
    throw new Error('Not Found Bot #' + pairPayload.id);
  }

  async updateStatus(id: number, status: COMMON_STATUS) {
    return await this.repo.update(id, { status });
  }

  async findAll() {
    return await this.repo.find();
  }

  async findOne(id: number) {
    return await this.repo.findOne({
      where: {
        id,
      },
    });
  }
  async findOneRelations(id: number) {
    return await this.repo.findOne({
      relations: ['exchange', 'pairs'],
      where: {
        id,
      },
    });
  }

  async remove(id: number) {
    return await this.repo.delete(id);
  }
}

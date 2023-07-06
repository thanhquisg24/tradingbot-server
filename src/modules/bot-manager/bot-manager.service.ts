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
import { UpdateBotRefDto } from './dto/update-bot-ref';
import { IBotsAndCount } from './types/bot-types';

@Injectable()
export class BotManagerService {
  constructor(
    @InjectRepository(BotTradingEntity)
    private readonly repo: Repository<BotTradingEntity>,
    private readonly exchangeService: ExchangeService,
    private readonly pairService: PairService,
  ) {}

  async findByUser(userId: number): Promise<IBotsAndCount> {
    const result = await this.repo.findAndCount({
      where: {
        userId,
      },
    });
    return {
      count: result[1],
      bots: result[0],
    };
  }

  async createWithPayload(payload: CreateBotPayload) {
    const exchange = await this.exchangeService.findOne(payload.exchangeId);
    const pairs = await this.pairService.findByIds(payload.listPair);
    let newBot = mappingNewBot(payload, exchange, pairs);
    newBot = this.repo.create(newBot);
    const saveBot = await this.repo.save(newBot);
    return { id: saveBot.id };
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

  async updateBotRef(userId: number, payload: UpdateBotRefDto) {
    const entity: BotTradingEntity = await this.repo.findOne({
      where: {
        id: payload.id,
        userId,
      },
    });
    if (entity) {
      await this.repo.update(entity.id, { refBotId: payload.refBotId });
      return 'Success';
    }
    throw new Error('Not Found Bot #' + payload.id);
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

  async saveBot(bot: BotTradingEntity) {
    return this.repo.save(bot);
  }

  async remove(id: number) {
    return await this.repo.delete(id);
  }
}

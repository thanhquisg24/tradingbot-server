import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import {
  BOT_TRADING_TYPE,
  BotTradingEntity,
  STRATEGY_DIRECTION,
} from '../entities/bot.entity';
import { ExchangeService } from '../exchange/exchange.service';
import { PairService } from '../pair/pair.service';
import { mappingNewBot } from './bot-utils';
import { CreateBotPayload } from './dto/create-bot.payload';
import { BotPairsPayload } from './dto/update-bot.dto';
import { COMMON_STATUS } from 'src/common/constants';
import { UpdateBotRefDto } from './dto/update-bot-ref';

@Injectable()
export class BotManagerService {
  constructor(
    @InjectRepository(BotTradingEntity)
    private readonly repo: Repository<BotTradingEntity>,
    private readonly exchangeService: ExchangeService,
    private readonly pairService: PairService,
  ) {}

  async deleteBot(botId: number) {
    await this.repo.delete(botId);
  }
  async findByUser(userId: number) {
    const result = await this.repo.findAndCount({
      relations: ['exchange'],
      where: {
        userId,
      },
    });
    return {
      count: result[1],
      bots: result[0],
    };
  }

  getAvaiableProtectionBotsByUser(
    userId: number,
    _strategyDirection: STRATEGY_DIRECTION,
  ) {
    return this.repo.find({
      relations: ['exchange'],
      where: {
        userId,
        botType: BOT_TRADING_TYPE.REDUCE,
        strategyDirection: Not(_strategyDirection),
      },
    });
  }

  async createWithPayload(payload: CreateBotPayload) {
    const exchange = await this.exchangeService.findOne(payload.exchangeId);
    const pairs = await this.pairService.findByIds(payload.listPair);
    let newBot = mappingNewBot(payload, exchange, pairs);
    newBot = this.repo.create(newBot);
    const saveBot = await this.repo.save(newBot);
    const saveBotWithExchange = await this.repo.findOne({
      relations: ['exchange'],
      where: {
        id: saveBot.id,
      },
    });

    return saveBotWithExchange;
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

  async findOneRelationsExchangeAndPair(id: number) {
    return await this.repo.findOne({
      relations: ['exchange', 'pairs'],
      where: {
        id,
      },
    });
  }

  async findOneRelationsPair(id: number) {
    return await this.repo.findOne({
      relations: ['pairs'],
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

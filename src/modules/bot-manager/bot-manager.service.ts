import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BotTradingEntity } from '../entities/bot.entity';
import { CreateBotPayload } from './dto/create-bot.payload';

@Injectable()
export class BotManagerService {
  constructor(
    @InjectRepository(BotTradingEntity)
    private readonly repo: Repository<BotTradingEntity>,
  ) {}

  async create(entity: BotTradingEntity) {
    return await this.repo.save(entity);
  }

  async createWithPayload(payload: CreateBotPayload) {
    return 'a';
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

  async remove(id: number) {
    return await this.repo.delete(id);
  }
}

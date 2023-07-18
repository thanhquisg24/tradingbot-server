import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import { ExchangeEntity, ExchangesEnum } from '../entities/exchange.entity';
import { CreateExchangeDto } from './dto/create-exchange.dto';
import { IUpdateExchangeDto } from './dto/update-exchange.dto';

@Injectable()
export class ExchangeService {
  constructor(
    @InjectRepository(ExchangeEntity)
    private readonly repo: Repository<ExchangeEntity>,
  ) {}

  getAllExChangeByUser(userId: number) {
    return this.repo.find({
      where: {
        user: {
          id: userId,
        },
      },
    });
  }

  async create(createTokenDto: CreateExchangeDto) {
    return await this.repo.save(createTokenDto);
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

  async findByUserAndExchangeName(userId: number, exchangeName: ExchangesEnum) {
    return await this.repo.findOne({
      relations: {
        user: true,
      },
      where: {
        user: { id: userId },
        name: exchangeName,
      },
    });
  }

  async update(
    id: number,
    updateTokenDto: IUpdateExchangeDto,
  ): Promise<UpdateResult> {
    return await this.repo.update(id, updateTokenDto);
  }

  async remove(id: number) {
    return await this.repo.delete(id);
  }
  async removeByUser(id: number, userId: number) {
    return await this.repo.delete({
      user: {
        id: userId,
      },
      id,
    });
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExchangeEntity } from '../entities/exchange.entity';
import { CreateExchangeDto } from './dto/create-exchange.dto';
import { UpdateExchangeDto } from './dto/update-exchange.dto';

@Injectable()
export class ExchangeService {
  constructor(
    @InjectRepository(ExchangeEntity)
    private readonly repo: Repository<ExchangeEntity>,
  ) {}
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

  async update(id: number, updateTokenDto: UpdateExchangeDto) {
    return await this.repo.update(id, updateTokenDto);
  }

  async remove(id: number) {
    return await this.repo.delete(id);
  }
}

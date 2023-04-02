import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTokenDto } from './dto/create-exchange.dto';
import { UpdateTokenDto } from './dto/update-exchange.dto';
import { TokenEntity } from '../entities/token.entity';

@Injectable()
export class ExchangeService {
  constructor(
    @InjectRepository(TokenEntity)
    private readonly repo: Repository<TokenEntity>,
  ) {}
  async create(createTokenDto: CreateTokenDto) {
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

  async update(id: number, updateTokenDto: UpdateTokenDto) {
    return await this.repo.update(id, updateTokenDto);
  }

  async remove(id: number) {
    return await this.repo.delete(id);
  }
}

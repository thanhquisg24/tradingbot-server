import { Injectable } from '@nestjs/common';
import { CreatePairDto } from './dto/create-pair.dto';
import { UpdatePairDto } from './dto/update-pair.dto';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PairEntity } from '../entities/pair.entity';

@Injectable()
export class PairService {
  constructor(
    @InjectRepository(PairEntity)
    private readonly repo: Repository<PairEntity>,
  ) {}

  saveBatch(list: PairEntity[]) {
    return this.repo.save(list);
  }

  create(createPairDto: CreatePairDto) {
    return 'This action adds a new pair';
  }

  async findByIds(ids: number[]) {
    const pairs = await this.repo.findBy({
      id: In(ids),
    });
    return pairs;
  }

  findAll() {
    return `This action returns all pair`;
  }

  findOne(id: number) {
    return `This action returns a #${id} pair`;
  }

  update(id: number, updatePairDto: UpdatePairDto) {
    return `This action updates a #${id} pair`;
  }

  remove(id: number) {
    return `This action removes a #${id} pair`;
  }
}

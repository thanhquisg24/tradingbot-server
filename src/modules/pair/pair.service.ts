import { Injectable } from '@nestjs/common';
import { CreatePairDto } from './dto/create-pair.dto';
import { UpdatePairDto } from './dto/update-pair.dto';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PairEntity } from '../entities/pair.entity';
import { ExchangesEnum } from '../entities/exchange.entity';
import { COMMON_STATUS } from 'src/common/constants';

@Injectable()
export class PairService {
  constructor(
    @InjectRepository(PairEntity)
    private readonly repo: Repository<PairEntity>,
  ) {}

  getAllPairByExchange(fromExchange: ExchangesEnum) {
    return this.repo.find({
      where: {
        fromExchange,
        status: COMMON_STATUS.ACTIVE,
      },
    });
  }

  async saveBatch(list: PairEntity[]) {
    for (let index = 0; index < list.length; index++) {
      const element = list[index];
      const p = await this.repo.findOneBy({
        fromExchange: element.fromExchange,
        exchangePair: element.exchangePair,
      });
      if (p) {
        await this.repo.update(p.id, { ...element });
      } else {
        await this.repo.save(element);
      }
    }
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

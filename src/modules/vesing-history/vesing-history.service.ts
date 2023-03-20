import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateVesingHistoryDto } from './dto/create-vesing-history.dto';
import { UpdateVesingHistoryDto } from './dto/update-vesing-history.dto';
import { VesingHistoryEntity } from './entities/vesing-history.entity';

@Injectable()
export class VesingHistoryService {
  constructor(
    @InjectRepository(VesingHistoryEntity)
    private readonly repo: Repository<VesingHistoryEntity>,
  ) {}
  async create(createVesingHistoryDto: CreateVesingHistoryDto) {
    return await this.repo.save(createVesingHistoryDto);
  }

  async findAll() {
    return await this.repo.find();
  }

  async findByUserId(userId: number) {
    return await this.repo.find({
      where: {
        userId,
      },
    });
  }

  async findOne(id: number) {
    return await this.repo.findOne({
      where: {
        id,
      },
    });
  }

  async update(id: number, updateVesingHistoryDto: UpdateVesingHistoryDto) {
    return await this.repo.update(id, updateVesingHistoryDto);
  }

  async remove(id: number) {
    return await this.repo.delete(id);
  }
}

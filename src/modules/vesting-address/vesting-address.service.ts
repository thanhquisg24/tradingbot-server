import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateVestingAddressDto } from './dto/create-vesting-address.dto';
import { UpdateVestingAddressDto } from './dto/update-vesting-address.dto';
import { VestingAddressEntity } from './entities/vesting-address.entity';
import { decryptWithAES, encryptWithAES } from 'src/common/utils/hash-util';

@Injectable()
export class VestingAddressService {
  constructor(
    @InjectRepository(VestingAddressEntity)
    private readonly repo: Repository<VestingAddressEntity>,
  ) {}
  async create(createVestingAddressDto: CreateVestingAddressDto) {
    const dtoWithHashPrivatekey = {
      ...createVestingAddressDto,
      private_key: encryptWithAES(createVestingAddressDto.private_key),
    };
    return await this.repo.save(dtoWithHashPrivatekey);
  }

  async findOneByUserId(userId: number) {
    const result = await this.repo.findOne({
      where: {
        userId,
      },
    });
    return result;
  }

  async findOneByUserIdAndDecode(userId: number) {
    const result = await this.repo.findOne({
      where: {
        userId,
      },
    });
    result.private_key = decryptWithAES(result.private_key);
    return result;
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

  async update(id: number, updateVestingAddressDto: UpdateVestingAddressDto) {
    return await this.repo.update(id, updateVestingAddressDto);
  }

  async remove(id: number) {
    return await this.repo.delete(id);
  }
}

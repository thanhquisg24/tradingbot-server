import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { encryptWithAES } from 'src/common/utils/hash-util';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from '../entities/user.entity';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  constructor(
    @InjectRepository(UserEntity)
    private readonly repo: Repository<UserEntity>,
  ) {}
  async create(createUserDto: CreateUserDto) {
    const oldUser = await this.repo.findOneBy({
      email: createUserDto.email,
    });
    if (oldUser) {
      throw new BadRequestException('This Email is already exist!');
    }
    const createUserDtoWithHashPass = createUserDto;
    createUserDtoWithHashPass.password = encryptWithAES(
      createUserDtoWithHashPass.password,
    );
    return await this.repo.save(createUserDtoWithHashPass);
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

  async update(id: number, updateUserDto: UpdateUserDto) {
    return await this.repo.update(id, updateUserDto);
  }

  async remove(id: number) {
    return await this.repo.delete(id);
  }

  async getUserByEmail(email: string): Promise<UserEntity> {
    return await this.repo
      .findOneBy({
        email,
      })
      .then((entity) => {
        if (!entity) {
          return Promise.reject(new NotFoundException('Model not found'));
        }

        return Promise.resolve(entity || null);
      });
  }

  async saveorupdateRefreshToken(
    refreshToken: string,
    id: number,
    refreshtokenexpires,
  ) {
    await this.repo.update(id, {
      refreshtoken: refreshToken,
      refreshtokenexpires,
    });
  }
}

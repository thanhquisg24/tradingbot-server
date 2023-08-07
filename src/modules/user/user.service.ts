import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { decryptWithAES, encryptWithAES } from 'src/common/utils/hash-util';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto, UserSettingPayload } from './dto/update-user.dto';
import { UserEntity } from '../entities/user.entity';
import { UserChangePassPayload } from './dto/change-user-password.dto';

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

  async changePass(
    userId: number,
    userChangePassPayload: UserChangePassPayload,
  ) {
    const user = await this.findOne(userId);
    const decryptCurrentPass = decryptWithAES(user.password);
    if (decryptCurrentPass !== userChangePassPayload.currentPassword) {
      throw new BadRequestException('Your current password is incorrect!');
    }
    if (
      userChangePassPayload.newPassword !==
      userChangePassPayload.newPasswordConfirm
    ) {
      throw new BadRequestException(
        'New password and confirm password are not matched!',
      );
    }
    const newPassEncrypted = encryptWithAES(userChangePassPayload.newPassword);
    await this.repo.update(userId, { password: newPassEncrypted });
    return 'Success! Please logout and login again';
  }

  async updateUserSetting(
    userId: number,
    userSettingPayload: UserSettingPayload,
  ) {
    await this.repo.update(userId, {
      telegramChatId: userSettingPayload.telegramChatId,
    });
    return 'Success! User setting has been updated.';
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

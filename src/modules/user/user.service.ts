import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { encryptWithAES } from 'src/common/utils/hash-util';
import { IsNull, MoreThan, Not, Raw, Repository } from 'typeorm';
import { Transactional } from 'typeorm-transactional';
import { ReceivedTokenScheduleService } from '../received_token_schedule/received_token_schedule.service';
import { VestingAddressService } from '../vesting-address/vesting-address.service';
import { CreateUserDto } from './dto/create-user.dto';
import { GenInitUserDto } from './dto/gen-init-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  constructor(
    @InjectRepository(UserEntity)
    private readonly repo: Repository<UserEntity>,
    private readonly receivedTokenScheduleService: ReceivedTokenScheduleService,
    private readonly vestingAddressService: VestingAddressService,
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
    createUserDtoWithHashPass.locked = createUserDtoWithHashPass.totalAmount;
    return await this.repo.save(createUserDtoWithHashPass);
  }

  @Transactional()
  async createAndGenSchedule(genUser: GenInitUserDto) {
    const newUser = await this.create(genUser as CreateUserDto);
    this.receivedTokenScheduleService.genAndSaveSchedule(
      newUser.id,
      newUser.totalAmount,
      newUser.startDate,
      newUser.endDate,
      newUser.vestingLogic,
    );
    return newUser;
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

  // @Cron('5 * * * * *')
  @Cron('0 0 */12 * * *') //every 12h
  @Transactional()
  async handleCronReleaseLock() {
    this.logger.log('Called handleCronReleaseLock');
    const usersReadyToUnlock = await this.repo.find({
      where: {
        vestingLogic: Not(IsNull()),
        locked: MoreThan(0),
        startDate: Raw((alias) => `${alias} <= NOW()`),
        endDate: Raw((alias) => `${alias} >= NOW()`),
      },
    });
    for (let index = 0; index < usersReadyToUnlock.length; index++) {
      const userElem = usersReadyToUnlock[index];
      const sheduleUnlockRows =
        await this.receivedTokenScheduleService.findPendingByUserId(
          userElem.id,
          userElem.endDate,
        );
      this.logger.log(
        `User #${userElem.id} has ${sheduleUnlockRows.length} ready unlock row`,
      );
      const totalUnlockAmtByUser = sheduleUnlockRows.reduce(
        (store: number, cur) => {
          return store + Number(cur.amount);
        },
        0,
      );
      // this.logger.debug(`totalUnlockAmtByUser ${totalUnlockAmtByUser} `);
      if (totalUnlockAmtByUser > 0) {
        const userToUpdateAmt: UpdateUserDto = {
          id: userElem.id,
          locked: Number(userElem.locked) - totalUnlockAmtByUser,
          avaiable: Number(userElem.avaiable) + totalUnlockAmtByUser,
        };
        // console.log(userToUpdateAmt);
        this.logger.log(
          `User #${userElem.id} begin update 'locked' and 'avaiable' `,
        );
        await this.update(userElem.id, userToUpdateAmt);

        this.logger.log(
          `User #${userElem.id} begin update SETTLE status rows `,
        );
        await this.receivedTokenScheduleService.updateRowsStatusToSettle(
          sheduleUnlockRows,
        );
        this.logger.log(
          `User #${userElem.id} has been successful process release lock`,
        );
      }
    }
  }
}

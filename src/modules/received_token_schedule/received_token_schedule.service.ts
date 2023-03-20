import { CreateReceivedTokenScheduleDto } from './dto/create-received_token_schedule.dto';
import { Injectable } from '@nestjs/common';
import { UpdateReceivedTokenScheduleDto } from './dto/update-received_token_schedule.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Raw, Repository } from 'typeorm';
import { ReceivedTokenScheduleEntity } from './entities/received_token_schedule.entity';
import { STATUS } from 'src/common/constants';
import moment from 'moment';
import { Transactional } from 'typeorm-transactional';

function readStepStr(stepString: string) {
  const splitStep = stepString.split('|');
  const [percentStep, firstLockStep, releaseStep] = splitStep;
  const firstLockStepV = firstLockStep.slice(0, firstLockStep.length - 1);
  const firstLockStepMask = firstLockStep.slice(-1);
  const releaseStepV = releaseStep.slice(0, releaseStep.length - 1);
  const releaseStepMask = releaseStep.slice(-1);
  return {
    percentStep: Number(percentStep),
    firstLockStep: Number(firstLockStepV),
    firstLockStepMask,
    releaseStep: Number(releaseStepV),
    releaseStepMask: releaseStepMask,
  };
}

function genReceivedTokenScheduleDto(
  userId: number,
  totalAmount: number,
  startDate: string | Date,
  endDate: string | Date,
  stepStr: string,
) {
  const _start = moment(startDate);
  //   const _end = moment(endDate);
  //   const startMonths = _start.month() + _start.year() * 12;
  //   const endMonths = _start.month() + _start.year() * 12;
  //   const monthDifference = endMonths - startMonths;
  const stepConfig = readStepStr(stepStr);
  const firstReleaseAmt = totalAmount * (stepConfig.percentStep / 100);
  const firstReleaseRecord: CreateReceivedTokenScheduleDto = {
    userId,
    receivedDate: _start.toDate(),
    amount: firstReleaseAmt,
    status: STATUS.PENDING,
  };
  const result = [firstReleaseRecord];

  const avaiAmt = totalAmount - firstReleaseAmt;
  const firstLockDate = _start.add(
    stepConfig.firstLockStep,
    stepConfig.firstLockStepMask as any,
  );
  const normalAmtStep = avaiAmt * (stepConfig.percentStep / 100);
  for (let i = normalAmtStep; i <= avaiAmt; i += normalAmtStep) {
    const dateRelease =
      i === normalAmtStep
        ? firstLockDate
        : firstLockDate.add(
            stepConfig.releaseStep,
            stepConfig.releaseStepMask as any,
          );
    const amt = normalAmtStep;
    const obj: CreateReceivedTokenScheduleDto = {
      userId,
      receivedDate: dateRelease.toDate(),
      // receivedDate: dateRelease.format('YYYY-MM-DD'),
      amount: amt,
      status: STATUS.PENDING,
    };
    result.push(obj);
  }

  return result;
}
@Injectable()
export class ReceivedTokenScheduleService {
  constructor(
    @InjectRepository(ReceivedTokenScheduleEntity)
    private readonly repo: Repository<ReceivedTokenScheduleEntity>,
  ) {}
  async create(createReceivedTokenScheduleDto: CreateReceivedTokenScheduleDto) {
    return await this.repo.save(createReceivedTokenScheduleDto);
  }

  async findAll() {
    return await this.repo.find();
  }

  async findPendingByUserId(userId: number, endDate: Date) {
    return await this.repo.findBy({
      userId,
      status: STATUS.PENDING,
      receivedDate: Raw((alias) => `${alias} <= NOW() And ${alias} <=:end`, {
        end: endDate,
      }),
    });
  }
  async findByUserId(userId: number) {
    return await this.repo.find({
      where: {
        userId,
      },
      order: {
        receivedDate: 'ASC', // "DESC"
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

  async update(
    id: number,
    updateReceivedTokenScheduleDto: UpdateReceivedTokenScheduleDto,
  ) {
    return await this.repo.update(id, updateReceivedTokenScheduleDto);
  }

  async remove(id: number) {
    return await this.repo.delete(id);
  }

  @Transactional()
  genAndSaveSchedule(
    userId: number,
    totalAmount: number,
    startDate: string | Date,
    endDate: string | Date,
    stepStr: string,
  ) {
    const saveObjs = genReceivedTokenScheduleDto(
      userId,
      totalAmount,
      startDate,
      endDate,
      stepStr,
    );
    if (saveObjs.length > 0) {
      return this.repo.save(saveObjs);
    }
  }
  @Transactional()
  updateRowsStatusToSettle(rows: ReceivedTokenScheduleEntity[]) {
    const settledRows = rows.map((c) => {
      return { ...c, status: STATUS.SETTLED };
    });
    return this.repo.save(settledRows);
  }
}

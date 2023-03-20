import moment from 'moment';

enum STATUS {
  PENDING = 'P',
  SETTLED = 'S',
  FAIL = 'F',
}

interface ReceivedTokenSchedule {
  id: number;
  userId: number;
  receivedDate: Date | string;
  amount: number;
  status: STATUS;
}

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
  const firstReleaseRecord: ReceivedTokenSchedule = {
    id: 0,
    userId,
    receivedDate: _start.format('YYYY-MM-DD'),
    amount: firstReleaseAmt,
    status: STATUS.PENDING,
  };
  const result = [firstReleaseRecord];

  const avaiAmt = totalAmount - firstReleaseAmt;
  const firstLockDate = _start.add(
    stepConfig.firstLockStep,
    stepConfig.firstLockStepMask as any,
  );
  //   console.log(
  //     '🚀 ~ file: private-step-scale.ts:51 ~ firstLockDate',
  //     stepConfig.firstLockStep,
  //     firstLockDate.format('YYYY-MM-DD'),
  //   );
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
    const obj: ReceivedTokenSchedule = {
      id: 0,
      userId,
      //   receivedDate: dateRelease.toDate(),
      receivedDate: dateRelease.format('YYYY-MM-DD'),
      amount: amt,
      status: STATUS.PENDING,
    };
    result.push(obj);
  }

  return result;
}

function main() {
  const step_str = '10|12Y|1M';

  const userCreateDto = {
    totalAmount: 10000,
    startDate: '2023-09-02',
    endDate: '2025-09-02',
  };

  const r = genReceivedTokenScheduleDto(
    1,
    userCreateDto.totalAmount,
    userCreateDto.startDate,
    userCreateDto.endDate,
    step_str,
  );
  console.log('🚀 ~ file: private-step-scale.ts:84 ~  r', r);
}
main();

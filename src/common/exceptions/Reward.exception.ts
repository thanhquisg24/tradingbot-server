import { BadRequestException } from '@nestjs/common';

export class NoRewardToClaimException extends BadRequestException {
  constructor() {
    super(`No reward ready to claim`);
  }
}

export class NotReachRewardAmountToClaimException extends BadRequestException {
  constructor(value: string) {
    super(`Oops! No sushi for you.
      Go loot at least ${value} to join the sushi party! `);
  }
}
export class TransferRewardException extends BadRequestException {
  constructor(message: string) {
    super(`${message}`);
  }
}

export class ReferralConditionRewardException extends BadRequestException {
  constructor(message: string) {
    super(`${message}`);
  }
}

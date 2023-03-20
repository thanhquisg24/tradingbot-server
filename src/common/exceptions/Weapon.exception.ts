import { InternalServerErrorException } from '@nestjs/common';

export class FixingWeaponServerErrorException extends InternalServerErrorException {
  constructor(message: string) {
    super(message);
  }
}

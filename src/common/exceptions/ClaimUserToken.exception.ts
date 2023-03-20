import { BadRequestException } from '@nestjs/common';

export class UserClaimTokenException extends BadRequestException {
  constructor(message: string) {
    super(`${message}`);
  }
}

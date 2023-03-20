import { BadRequestException } from '@nestjs/common';

export class NotAdminException extends BadRequestException {
  constructor() {
    super(`You are not the amdin`);
  }
}

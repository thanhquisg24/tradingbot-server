import { BadRequestException } from '@nestjs/common';

export class IdoProjectAppliedException extends BadRequestException {
  constructor() {
    super(`You've already applied this IDO project`);
  }
}

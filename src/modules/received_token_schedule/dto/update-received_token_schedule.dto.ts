import { CreateReceivedTokenScheduleDto } from './create-received_token_schedule.dto';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateReceivedTokenScheduleDto extends PartialType(
  CreateReceivedTokenScheduleDto,
) {
  id: number;
}

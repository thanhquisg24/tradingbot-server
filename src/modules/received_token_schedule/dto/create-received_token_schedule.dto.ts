import { MAX_ALLOW_INT, STATUS } from 'src/common/constants';

import { ApiProperty } from '@nestjs/swagger';
import { IntMinMax } from '@nestjsi/class-validator';

export class CreateReceivedTokenScheduleDto {
  @ApiProperty({
    required: true,
  })
  userId: number;

  @ApiProperty({
    required: true,
  })
  @IntMinMax(0, MAX_ALLOW_INT)
  amount: number;

  @ApiProperty({
    required: true,
  })
  status: STATUS;

  @ApiProperty({
    required: true,
  })
  receivedDate: Date;
}

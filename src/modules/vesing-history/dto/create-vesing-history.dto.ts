import { ApiProperty } from '@nestjs/swagger';
import { IsNotBlankString, IsPositiveInt } from '@nestjsi/class-validator';
import { STATUS } from 'src/common/constants';

export class CreateVesingHistoryDto {
  @IsNotBlankString()
  @ApiProperty({
    required: true,
  })
  txId: string;

  @IsPositiveInt()
  @ApiProperty({
    required: true,
  })
  userId: number;

  @IsPositiveInt()
  @ApiProperty({
    required: true,
  })
  amount: number;

  @IsNotBlankString()
  @ApiProperty({
    required: true,
  })
  fromAddress: string;

  @IsNotBlankString()
  @ApiProperty({
    required: true,
  })
  toAddress: string;

  @ApiProperty({
    required: true,
    enum: STATUS,
  })
  status: STATUS;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsPositiveInt } from '@nestjsi/class-validator';
export interface ICloseDealAtMarketPrice {
  botId: number;
  userId: number;
  dealId: number;
}

export class CloseDealAtMarketPrice implements ICloseDealAtMarketPrice {
  @IsPositiveInt()
  @ApiProperty({
    type: 'int',
    required: true,
    example: 2,
    default: 2,
    description: 'dealId',
  })
  dealId: number;

  @IsPositiveInt()
  @ApiProperty({
    type: 'int',
    required: true,
    example: 2,
    default: 2,
    description: 'botId',
  })
  botId: number;

  @IsPositiveInt()
  @ApiProperty({
    required: true,
    example: 1,
    description: 'userId',
  })
  userId: number;
}

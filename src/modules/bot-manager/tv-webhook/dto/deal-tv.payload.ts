import { ITVPayload, TVActionType } from 'src/common/event/tv_events';
import { IsNotBlankString, IsPositiveInt } from '@nestjsi/class-validator';

import { ApiProperty } from '@nestjs/swagger';
import { AutoMap } from '@automapper/classes';

export class TVPayload implements ITVPayload {
  @AutoMap()
  @IsNotBlankString()
  @ApiProperty({
    required: true,
    enum: TVActionType,
    example: TVActionType.OPEN_ORDER,
    isArray: false,
    description: 'action',
    enumName: 'TVActionType',
  })
  action: TVActionType;

  @AutoMap()
  @IsPositiveInt()
  @ApiProperty({
    type: 'int',
    required: true,
    example: 555,
    default: 555,
    description: 'botId',
  })
  botId: number;

  @AutoMap()
  @IsNotBlankString()
  @ApiProperty({
    required: true,
    example: 'BTC/USDT',
    description: 'pair',
  })
  pair: string;

  @AutoMap()
  @IsPositiveInt()
  @ApiProperty({
    required: true,
    example: 1,
    description: 'userId',
  })
  userId: number;

  @AutoMap()
  @ApiProperty({
    required: true,
    example: 2.25,
    description: 'price',
  })
  price: number;
}

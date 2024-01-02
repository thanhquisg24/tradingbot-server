import {
  IsNotBlankString,
  IsPositiveInt,
  MinMaxPct,
} from '@nestjsi/class-validator';

import { ApiProperty } from '@nestjs/swagger';
import { AutoMap } from '@automapper/classes';
import { BOT_SPOT_TYPE } from 'src/modules/entities/bot.spot.extity';
import { DEAL_START_TYPE } from 'src/modules/entities/bot.entity';

export class CommonBotSpotPayload {
  @AutoMap()
  @IsNotBlankString()
  @ApiProperty({
    required: true,
    example: 'example name',
    description: 'name',
  })
  name: string;

  @AutoMap()
  @IsPositiveInt()
  @ApiProperty({
    type: 'int',
    required: true,
    example: 11111,
    default: 11111,
    description: 'userId',
  })
  userId: number;

  @AutoMap()
  @IsNotBlankString()
  @ApiProperty({
    required: true,
    enum: DEAL_START_TYPE,
    example: DEAL_START_TYPE.ASAP,
    isArray: false,
    default: DEAL_START_TYPE.ASAP,
    description: 'dealStartCondition',
    enumName: 'DEAL_START_TYPE',
  })
  dealStartCondition: DEAL_START_TYPE;

  @AutoMap()
  @ApiProperty({
    type: 'number',
    required: true,
    example: 1,
    default: 1,
    description: 'baseOrderSize',
  })
  @MinMaxPct(
    0, // number
    1000000, // number
  )
  baseOrderSize: number;

  @AutoMap()
  @ApiProperty({
    type: 'int',
    required: true,
    example: 1,
    default: 1,
    description: 'targetProfitPercentage',
  })
  @MinMaxPct(
    0, // number
    100, // number
  )
  targetProfitPercentage: number;

  @AutoMap()
  @ApiProperty({
    type: 'boolean',
    required: false,
    example: false,
    default: false,
    description: 'useStopLoss',
  })
  useStopLoss: boolean;

  @AutoMap()
  @ApiProperty({
    type: 'int',
    required: true,
    example: 1,
    default: 1,
    description: 'targetStopLossPercentage',
  })
  @MinMaxPct(
    0, // number
    100, // number
  )
  targetStopLossPercentage: number;
}

export class CreateBotSpotPayload extends CommonBotSpotPayload {
  @AutoMap()
  @IsNotBlankString()
  @ApiProperty({
    required: true,
    enum: BOT_SPOT_TYPE,
    example: BOT_SPOT_TYPE.INVEST,
    isArray: false,
    default: BOT_SPOT_TYPE.INVEST,
    description: 'botType',
    enumName: 'BOT_SPOT_TYPE',
  })
  botType: BOT_SPOT_TYPE;

  @AutoMap()
  @IsPositiveInt()
  @ApiProperty({
    type: 'int',
    required: true,
    example: 7777,
    default: 7777,
    description: 'exchangeId',
  })
  exchangeId: number;
}

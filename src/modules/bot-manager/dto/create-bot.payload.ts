import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import {
  IntMinMax,
  IsNotBlankString,
  IsPositiveInt,
  MinMaxPct,
} from '@nestjsi/class-validator';
import {
  BOT_TRADING_TYPE,
  DEAL_START_TYPE,
  STRATEGY_DIRECTION,
} from 'src/modules/entities/bot.entity';

export class CreateBotPayload {
  @AutoMap()
  @IsNotBlankString()
  @ApiProperty({
    required: true,
    example: 'example name',
    description: 'name',
  })
  name: string;

  @AutoMap()
  @IsNotBlankString()
  @ApiProperty({
    required: true,
    enum: BOT_TRADING_TYPE,
    example: BOT_TRADING_TYPE.DCA,
    isArray: false,
    default: BOT_TRADING_TYPE.DCA,
    description: 'botType',
    enumName: 'BOT_TRADING_TYPE',
  })
  botType: BOT_TRADING_TYPE;

  @AutoMap()
  @IsNotBlankString()
  @ApiProperty({
    required: true,
    enum: STRATEGY_DIRECTION,
    example: STRATEGY_DIRECTION.LONG,
    isArray: false,
    default: STRATEGY_DIRECTION.SHORT,
    description: 'strategyDirection',
    enumName: 'STRATEGY_DIRECTION',
  })
  strategyDirection: STRATEGY_DIRECTION;

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
  @IsPositiveInt()
  @ApiProperty({
    type: 'int',
    required: true,
    example: 7777,
    default: 7777,
    description: 'exchangeId',
  })
  exchangeId: number;

  @ApiProperty({
    required: true,
    example: [1, 2, 3],
    default: [],
    isArray: true,
    description: 'listPair',
  })
  listPair: number[];

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
  dealStartCondition: string;

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

  @ApiProperty({
    type: 'int',
    required: true,
    example: 9,
    default: 9,
    description: 'maxActiveDeal',
  })
  @IntMinMax(1, 1000)
  maxActiveDeal: number;

  @ApiProperty({
    type: 'int',
    required: true,
    example: 3,
    default: 3,
    description: 'maxSafetyTradesCount',
  })
  @IntMinMax(1, 1000)
  maxSafetyTradesCount: number;

  @ApiProperty({
    type: 'int',
    required: true,
    example: 1,
    default: 1,
    description: 'maxActiveSafetyTradesCount',
  })
  @IntMinMax(1, 1000)
  maxActiveSafetyTradesCount: number;

  @ApiProperty({
    type: 'number',
    required: true,
    example: 6.5,
    default: 6.5,
    description: 'priceDeviationPercentage',
  })
  @MinMaxPct(
    0, // number
    100, // number
  )
  priceDeviationPercentage: number;

  @ApiProperty({
    type: 'number',
    required: true,
    example: 2,
    default: 2,
    description: 'safetyOrderVolumeScale',
  })
  @MinMaxPct(
    0, // number
    100, // number
  )
  safetyOrderVolumeScale: number;

  @ApiProperty({
    type: 'number',
    required: true,
    example: 2,
    default: 2,
    description: 'safetyOrderStepScale',
  })
  @MinMaxPct(
    0, // number
    100, // number
  )
  safetyOrderStepScale: number;
}

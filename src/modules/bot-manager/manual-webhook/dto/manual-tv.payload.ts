import { IsNotBlankString, IsPositiveInt } from '@nestjsi/class-validator';

import { ApiProperty } from '@nestjs/swagger';
import { ICommonFundingStartDeal } from 'src/common/event/funding_events';
import { IFundingSymbol } from 'src/common/dto/funding-symbol';

export class FundingSymbol implements IFundingSymbol {
  @IsNotBlankString()
  @ApiProperty({
    required: true,
    description: 'symbol of exchange',
  })
  symbol: string;
  @ApiProperty({
    type: 'number',
    required: true,
    example: 1,
    default: 1,
    description: 'markPrice',
  })
  markPrice: number;
  @ApiProperty({
    type: 'number',
    required: true,
    example: 1,
    default: 1,
    description: 'indexPrice',
  })
  indexPrice: number;

  interestRate: number;
  estimatedSettlePrice: number;

  @ApiProperty({
    type: 'number',
    required: true,
    example: 1,
    default: 1,
    description: 'timestamp',
  })
  timestamp: number;
  datetime: string;

  @ApiProperty({
    type: 'number',
    required: true,
    example: 0.01,
    default: 0.01,
    description: 'fundingRate',
  })
  fundingRate: number;

  @ApiProperty({
    type: 'number',
    required: true,
    example: 0.01,
    default: 0.01,
    description: 'fundingTimestamp',
  })
  fundingTimestamp: number;
  fundingDatetime: string;
}

export class FundingRateSignalPayload implements ICommonFundingStartDeal {
  fundingData: FundingSymbol;

  @IsPositiveInt()
  @ApiProperty({
    required: true,
    example: 3000,
    description: 'closeAtMarketTimeOut miliseconds',
  })
  closeAtMarketTimeOut: number;
}

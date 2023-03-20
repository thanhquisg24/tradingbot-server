import {
  IntMinMax,
  IsEmailTidy,
  IsNotBlankString,
  IsStringDate,
} from '@nestjsi/class-validator';

import { ArrayNotEmpty, IsArray } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';
import { IsPrice } from '@nestjsi/class-validator/is/is-price';
import { MAX_ALLOW_INT, ROLE } from 'src/common/constants';

export class CreateUserDto {
  @ApiProperty({
    required: true,
  })
  @IsEmailTidy()
  email: string;

  @ApiProperty({
    required: true,
  })
  @IsNotBlankString()
  password: string;

  @ApiProperty({
    required: true,
  })
  @IsPrice()
  price: number;

  @ApiProperty({
    required: true,
  })
  @IntMinMax(0, MAX_ALLOW_INT)
  totalAmount: number;

  @ApiProperty({
    required: true,
  })
  @IntMinMax(0, MAX_ALLOW_INT)
  locked: number;

  @ApiProperty({
    required: true,
  })
  @IntMinMax(0, MAX_ALLOW_INT)
  avaiable: number;

  @ApiProperty({
    required: true,
  })
  @IntMinMax(0, MAX_ALLOW_INT)
  claimed: number;

  @ApiProperty({
    required: true,
  })
  @IsStringDate()
  startDate: Date;

  @ApiProperty({
    required: true,
  })
  @IsStringDate()
  endDate: Date;

  @ApiProperty({
    required: true,
    description:
      'ex. 10|10d|20M  .years is	y,quarters is	Q ,months is	M, weeks	is w , days	is d, hours	 is h ,minutes is	m',
  })
  @IsNotBlankString()
  vestingLogic: string;

  @ApiProperty({
    required: false,
  })
  refreshtoken: string | null;

  @ApiProperty({
    required: true,
    default: [ROLE.USER],
    description: 'ex. ["USER"]',
  })
  @IsArray()
  @ArrayNotEmpty()
  roles: ROLE[];
}

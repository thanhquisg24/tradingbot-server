import { IsEmailTidy, IsNotBlankString } from '@nestjsi/class-validator';

import { ArrayNotEmpty, IsArray } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';
import { ROLE } from 'src/common/constants';

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
  @IsNotBlankString()
  telegramChatId: string;

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

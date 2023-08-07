import { IsEmailTidy, IsNotBlankString } from '@nestjsi/class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class UserChangePassPayload {
  @ApiProperty({
    required: true,
  })
  @IsEmailTidy()
  email: string;

  @ApiProperty({
    required: true,
  })
  @IsNotBlankString()
  currentPassword: string;

  @ApiProperty({
    required: true,
  })
  @IsNotBlankString()
  newPassword: string;

  @ApiProperty({
    required: true,
  })
  @IsNotBlankString()
  newPasswordConfirm: string;
}

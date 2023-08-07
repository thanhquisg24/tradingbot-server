import { ApiProperty, PartialType } from '@nestjs/swagger';

import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty({
    required: true,
  })
  id: number;
}

export class UserSettingPayload {
  @ApiProperty({
    required: true,
  })
  telegramChatId: string;
}

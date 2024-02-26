import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotBlankString } from '@nestjsi/class-validator';

export class UserMsgDTO {
  @AutoMap()
  @IsNotBlankString()
  @ApiProperty({
    required: true,
    description: 'userId',
  })
  userId: string;

  @AutoMap()
  @IsNotBlankString()
  @ApiProperty({
    required: true,
    description: 'message',
  })
  message: string;

  @AutoMap()
  @IsNotBlankString()
  @ApiProperty({
    required: true,
    description: 'passPhrase',
  })
  passPhrase: string;
}

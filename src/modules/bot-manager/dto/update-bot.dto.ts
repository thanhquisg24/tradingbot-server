import { PartialType } from '@nestjs/mapped-types';
import { CreateBotDto } from './create-bot.dto';
import { IsNotNull } from '@nestjsi/class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class UpdateBotDto extends PartialType(CreateBotDto) {
  @ApiProperty({
    required: true,
    description: 'id',
  })
  @IsNotNull()
  id: number;
}

import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { IsPositiveInt } from '@nestjsi/class-validator';
import { CreateBotDto } from './create-bot.dto';
export class UpdateBotDto extends PartialType(CreateBotDto) {
  @ApiProperty({
    required: true,
    description: 'id',
  })
  @IsPositiveInt()
  id: number;
}

export class BotPairsPayload {
  @ApiProperty({
    required: true,
    description: 'id',
  })
  @IsPositiveInt()
  id: number;

  @ApiProperty({
    required: true,
    description: 'pairs',
    isArray: true,
    example: [1, 2, 3],
  })
  pairs: number[];
}

import { ApiProperty } from '@nestjs/swagger';
import { IsPositiveInt } from '@nestjsi/class-validator';
import { CommonBotPayload } from './create-bot.payload';
export class UpdateBotDto extends CommonBotPayload {
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

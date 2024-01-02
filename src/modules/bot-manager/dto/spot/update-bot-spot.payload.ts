import { ApiProperty } from '@nestjs/swagger';
import { CommonBotSpotPayload } from './create-bot-spot.payload';
import { IsPositiveInt } from '@nestjsi/class-validator';

export class UpdateBotSpotDto extends CommonBotSpotPayload {
  @ApiProperty({
    required: true,
    description: 'id',
  })
  @IsPositiveInt()
  id: number;
}

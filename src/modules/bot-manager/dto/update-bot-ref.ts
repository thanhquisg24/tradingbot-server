import { ApiProperty } from '@nestjs/swagger';
import { IsPositiveInt } from '@nestjsi/class-validator';

export class UpdateBotRefDto {
  @ApiProperty({
    required: true,
    description: 'id',
  })
  @IsPositiveInt()
  id: number;

  @ApiProperty({
    required: true,
    description: 'refBotId',
  })
  @IsPositiveInt()
  refBotId: number;
}

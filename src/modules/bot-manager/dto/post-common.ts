import { ApiProperty } from '@nestjs/swagger';
import { IsPositiveInt } from '@nestjsi/class-validator';
export class PostCommonPayload {
  @ApiProperty({
    required: true,
    description: 'id',
  })
  @IsPositiveInt()
  id: number;
}

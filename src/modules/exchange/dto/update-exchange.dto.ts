import { PartialType } from '@nestjs/mapped-types';
import { CreateTokenDto } from './create-exchange.dto';
import { IsNotNull } from '@nestjsi/class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class UpdateTokenDto extends PartialType(CreateTokenDto) {
  @ApiProperty({
    required: true,
    description: 'id',
  })
  @IsNotNull()
  id: number;
}

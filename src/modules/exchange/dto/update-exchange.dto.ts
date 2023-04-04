import { PartialType } from '@nestjs/mapped-types';
import { CreateExchangeDto } from './create-exchange.dto';
import { IsNotNull } from '@nestjsi/class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class UpdateExchangeDto extends PartialType(CreateExchangeDto) {
  @ApiProperty({
    required: true,
    description: 'id',
  })
  @IsNotNull()
  id: number;
}

import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { IsPositiveInt } from '@nestjsi/class-validator';
import { CreateVesingHistoryDto } from './create-vesing-history.dto';

export class UpdateVesingHistoryDto extends PartialType(
  CreateVesingHistoryDto,
) {
  @ApiProperty({
    required: true,
  })
  @IsPositiveInt()
  id: number;
}

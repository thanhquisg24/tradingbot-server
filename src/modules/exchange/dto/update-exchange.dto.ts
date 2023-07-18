import { ApiProperty } from '@nestjs/swagger';
import { CreateExchangeDto } from './create-exchange.dto';
import { IsNotNull } from '@nestjsi/class-validator';
import { PartialType } from '@nestjs/mapped-types';

// export class UpdateExchangeDto extends PartialType(CreateExchangeDto) {
//   @ApiProperty({
//     required: true,
//     description: 'id',
//   })
//   @IsNotNull()
//   id: number;
// }
export interface IUpdateExchangeDto extends CreateExchangeDto {
  id?: number;
}

import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { CreateVestingAddressDto } from './create-vesting-address.dto';

export class UpdateVestingAddressDto extends PartialType(
  CreateVestingAddressDto,
) {
  @ApiProperty({
    required: true,
  })
  id: number;
}

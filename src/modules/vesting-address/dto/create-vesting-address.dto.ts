import { ApiProperty } from '@nestjs/swagger';
import { IsNotBlankString } from '@nestjsi/class-validator';

export class CreateVestingAddressDto {
  @ApiProperty({
    required: true,
  })
  userId: number;

  @ApiProperty({
    required: true,
  })
  @IsNotBlankString()
  address: string;

  @ApiProperty({
    required: true,
  })
  @IsNotBlankString()
  private_key: string;

  @ApiProperty({
    required: true,
  })
  balance: number;
}

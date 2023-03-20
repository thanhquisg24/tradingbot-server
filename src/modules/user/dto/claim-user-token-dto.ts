import { ApiProperty } from '@nestjs/swagger';
import { IsNotBlankString, IsPositiveInt } from '@nestjsi/class-validator';

export class ClaimUserTokenDto {
  @ApiProperty({
    required: true,
    example: 5,
  })
  @IsPositiveInt()
  userId: number;

  @ApiProperty({
    required: true,
    example: '0x298CaD10930653a1139F2B246F5D3c95F218F368',
  })
  @IsNotBlankString()
  userAddress: string;
}

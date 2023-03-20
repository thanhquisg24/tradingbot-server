import { ApiProperty } from '@nestjs/swagger';
import { IsNotBlankString } from '@nestjsi/class-validator';

export class CreateTokenDto {
  @IsNotBlankString()
  @ApiProperty({
    required: true,
    description: 'tokenAddress',
  })
  tokenAddress: string;

  @IsNotBlankString()
  @ApiProperty({
    required: true,
    description: 'tokenSymbol',
  })
  tokenSymbol: string;

  @IsNotBlankString()
  @ApiProperty({
    required: true,
    description: 'tokenScanUrl',
  })
  tokenScanUrl: string;
}

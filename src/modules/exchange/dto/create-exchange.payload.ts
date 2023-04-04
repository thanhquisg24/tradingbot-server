import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotBlankString } from '@nestjsi/class-validator';
import { ExchangesEnum } from 'src/modules/entities/exchange.entity';

export class CreateExchangePayload {
  @AutoMap()
  @IsNotBlankString()
  @ApiProperty({
    required: true,
    enum: ExchangesEnum,
    isArray: false,
    description: 'name',
  })
  name: ExchangesEnum;

  @AutoMap()
  @IsNotBlankString()
  @ApiProperty({
    required: true,
    description: 'label',
  })
  label: string;

  @AutoMap()
  @IsNotBlankString()
  @ApiProperty({
    required: true,
    description: 'apiKey',
  })
  apiKey: string;

  @AutoMap()
  @IsNotBlankString()
  @ApiProperty({
    required: true,
    description: 'apiSecret',
  })
  apiSecret: string;
}

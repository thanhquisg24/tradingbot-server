import { Module } from '@nestjs/common';
import { VestingAddressService } from './vesting-address.service';
import { VestingAddressController } from './vesting-address.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VestingAddressEntity } from './entities/vesting-address.entity';

@Module({
  imports: [TypeOrmModule.forFeature([VestingAddressEntity])],
  controllers: [VestingAddressController],
  providers: [VestingAddressService],
})
export class VestingAddressModule {}

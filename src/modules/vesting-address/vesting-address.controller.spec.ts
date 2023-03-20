import { Test, TestingModule } from '@nestjs/testing';
import { VestingAddressController } from './vesting-address.controller';
import { VestingAddressService } from './vesting-address.service';

describe('VestingAddressController', () => {
  let controller: VestingAddressController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VestingAddressController],
      providers: [VestingAddressService],
    }).compile();

    controller = module.get<VestingAddressController>(VestingAddressController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

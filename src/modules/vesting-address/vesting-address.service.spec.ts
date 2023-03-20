import { Test, TestingModule } from '@nestjs/testing';
import { VestingAddressService } from './vesting-address.service';

describe('VestingAddressService', () => {
  let service: VestingAddressService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VestingAddressService],
    }).compile();

    service = module.get<VestingAddressService>(VestingAddressService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

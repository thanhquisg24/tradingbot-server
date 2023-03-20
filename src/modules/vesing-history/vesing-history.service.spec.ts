import { Test, TestingModule } from '@nestjs/testing';
import { VesingHistoryService } from './vesing-history.service';

describe('VesingHistoryService', () => {
  let service: VesingHistoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VesingHistoryService],
    }).compile();

    service = module.get<VesingHistoryService>(VesingHistoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

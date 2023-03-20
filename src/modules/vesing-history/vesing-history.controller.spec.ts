import { Test, TestingModule } from '@nestjs/testing';
import { VesingHistoryController } from './vesing-history.controller';
import { VesingHistoryService } from './vesing-history.service';

describe('VesingHistoryController', () => {
  let controller: VesingHistoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VesingHistoryController],
      providers: [VesingHistoryService],
    }).compile();

    controller = module.get<VesingHistoryController>(VesingHistoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

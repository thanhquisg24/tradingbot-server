import { Test, TestingModule } from '@nestjs/testing';
import { PairController } from './pair.controller';
import { PairService } from './pair.service';

describe('PairController', () => {
  let controller: PairController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PairController],
      providers: [PairService],
    }).compile();

    controller = module.get<PairController>(PairController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

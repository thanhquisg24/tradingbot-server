import { Module } from '@nestjs/common';
import { VesingHistoryService } from './vesing-history.service';
import { VesingHistoryController } from './vesing-history.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VesingHistoryEntity } from './entities/vesing-history.entity';

@Module({
  imports: [TypeOrmModule.forFeature([VesingHistoryEntity])],
  controllers: [VesingHistoryController],
  providers: [VesingHistoryService],
})
export class VesingHistoryModule {}

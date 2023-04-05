import { Module } from '@nestjs/common';
import { PairService } from './pair.service';
import { PairController } from './pair.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AutomapperModule } from '@automapper/nestjs';
import { PairEntity } from '../entities/pair.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PairEntity]), AutomapperModule],
  controllers: [PairController],
  providers: [PairService],
})
export class PairModule {}

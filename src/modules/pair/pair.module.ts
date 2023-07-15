import { Module } from '@nestjs/common';
import { PairService } from './pair.service';
import { PairController } from './pair.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AutomapperModule } from '@automapper/nestjs';
import entities from 'src/config/typeorm.entities';

@Module({
  imports: [TypeOrmModule.forFeature(entities), AutomapperModule],
  controllers: [PairController],
  providers: [PairService],
  exports: [PairService],
})
export class PairModule {}

import { Module } from '@nestjs/common';
import { ExchangeService } from './exchange.service';
import { ExchangeController } from './exchange.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExchangeMapperProfile } from './mapper/exchange-mapper';
import { AutomapperModule } from '@automapper/nestjs';
import { ExchangeEntity } from '../entities/exchange.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ExchangeEntity]), AutomapperModule],
  controllers: [ExchangeController],
  providers: [ExchangeService, ExchangeMapperProfile],
  exports: [ExchangeService],
})
export class ExchangeModule {}

import { Module } from '@nestjs/common';
import { ReceivedTokenScheduleController } from './received_token_schedule.controller';
import { ReceivedTokenScheduleEntity } from './entities/received_token_schedule.entity';
import { ReceivedTokenScheduleService } from './received_token_schedule.service';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([ReceivedTokenScheduleEntity])],
  controllers: [ReceivedTokenScheduleController],
  providers: [ReceivedTokenScheduleService],
})
export class ReceivedTokenScheduleModule {}

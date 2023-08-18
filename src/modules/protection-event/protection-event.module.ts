import { Module } from '@nestjs/common';
import { ProtectionEventController } from './protection-event.controller';
import { ProtectionEventService } from './protection-event.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import entities from 'src/config/typeorm.entities';

@Module({
  imports: [TypeOrmModule.forFeature(entities)],
  controllers: [ProtectionEventController],
  providers: [ProtectionEventService],
  exports: [ProtectionEventService],
})
export class ProtectionEventModule {}

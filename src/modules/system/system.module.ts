import { Module } from '@nestjs/common';
import { SystemService } from './system.service';
import { SystemController } from './system.controller';
import { AutomapperModule } from '@automapper/nestjs';

@Module({
  imports: [AutomapperModule],
  controllers: [SystemController],
  providers: [SystemService],
})
export class SystemModule {}

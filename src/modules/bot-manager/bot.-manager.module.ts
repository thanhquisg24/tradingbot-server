import { Module } from '@nestjs/common';
import { BotManagerController } from './bot-manager.controller';
import { BotManagerService } from './bot-manager.service';

@Module({
  imports: [],
  controllers: [BotManagerController],
  providers: [BotManagerService],
})
export class BotManagerModule {}

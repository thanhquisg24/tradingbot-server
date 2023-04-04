import { Module } from '@nestjs/common';
import { BotManagerController } from './bot-manager.controller';
import { BotManagerInstances } from './bot-manager.instances';

@Module({
  imports: [],
  controllers: [BotManagerController],
  providers: [BotManagerInstances],
})
export class BotManagerModule {}

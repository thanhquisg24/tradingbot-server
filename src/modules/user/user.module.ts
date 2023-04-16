import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { UserEntity } from '../entities/user.entity';
import { UserService } from './user.service';
import { BotTradingEntity } from '../entities/bot.entity';
import { ExchangeEntity } from '../entities/exchange.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, ExchangeEntity, BotTradingEntity]),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}

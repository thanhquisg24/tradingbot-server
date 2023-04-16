import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import dotenv from 'dotenv';
import {
  WinstonModule,
  utilities as nestWinstonModuleUtilities,
} from 'nest-winston';
import { TelegrafModule } from 'nestjs-telegraf';
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { typeOrmAsyncConfig } from './config/typeorm.config';
import { AuthModule } from './modules/auth/auth.module';
import { BotManagerModule } from './modules/bot-manager/bot-manager.module';
import { DealModule } from './modules/deal/deal.module';
import { ExchangeModule } from './modules/exchange/exchange.module';
import { PairModule } from './modules/pair/pair.module';
import { SystemModule } from './modules/system/system.module';
import { TelegramModule } from './modules/telegram/telegram.module';
import { UserModule } from './modules/user/user.module';

dotenv.config();
// import entities from './config/typeorm.entities';
const ENV = process.env.NODE_ENV;
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const logTransportDaily: DailyRotateFile = new DailyRotateFile({
  filename: 'log/system-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
});

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: !ENV ? '.env.dev' : `.env.${ENV}`,
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync(typeOrmAsyncConfig),
    ScheduleModule.forRoot(),
    AutomapperModule.forRoot({
      strategyInitializer: classes(),
    }),
    TelegrafModule.forRoot({
      token: TELEGRAM_TOKEN,
      include: [TelegramModule],
    }),
    EventEmitterModule.forRoot(),
    WinstonModule.forRoot({
      format: winston.format.combine(
        winston.format.timestamp(),
        nestWinstonModuleUtilities.format.nestLike(),
      ),
      transports: [new winston.transports.Console(), logTransportDaily],
    }),
    // TypeOrmModule.forRoot({
    //   type: 'mysql',
    //   host: 'localhost',
    //   port: 3306,
    //   username: 'root',
    //   password: 'soldier001',
    //   database: 'nestjs',
    //   entities,
    //   // entities: [__dirname + '/**/*.entity{.ts,.js}'],
    //   synchronize: true,
    //   dropSchema: false,
    // }),
    // TaskModule,

    AuthModule,
    UserModule,
    ExchangeModule,
    BotManagerModule,
    PairModule,
    SystemModule,
    DealModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

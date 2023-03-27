import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { ReceivedTokenScheduleModule } from './modules/received_token_schedule/received_token_schedule.module';
import { ScheduleModule } from '@nestjs/schedule';
import { TokenModule } from './modules/token/token.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './modules/user/user.module';
import { VesingHistoryModule } from './modules/vesing-history/vesing-history.module';
import { VestingAddressModule } from './modules/vesting-address/vesting-address.module';
import dotenv from 'dotenv';
import { typeOrmAsyncConfig } from './config/typeorm.config';
import { BotManagerModule } from './modules/bot-manager/bot.-manager.module';

dotenv.config();
// import entities from './config/typeorm.entities';
const ENV = process.env.NODE_ENV;

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: !ENV ? '.env.dev' : `.env.${ENV}`,
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync(typeOrmAsyncConfig),
    ScheduleModule.forRoot(),
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
    TokenModule,
    VesingHistoryModule,
    VestingAddressModule,
    ReceivedTokenScheduleModule,
    BotManagerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

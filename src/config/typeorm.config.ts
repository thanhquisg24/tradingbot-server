import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  TypeOrmModuleAsyncOptions,
  TypeOrmModuleOptions,
} from '@nestjs/typeorm';

import { Logger as TypeOrmLogger, QueryRunner, DataSource } from 'typeorm';

import { addTransactionalDataSource } from 'typeorm-transactional';
import entities from './typeorm.entities';
import DailyRotateFile from 'winston-daily-rotate-file';
import winston from 'winston';
const logTransportDaily: DailyRotateFile = new DailyRotateFile({
  filename: 'log/sql/typeorm-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
});
const consoleLogFormat = winston.format.printf(
  ({ level, message, timestamp, label }) =>
    `${timestamp} ${level} [${label}]: ${message}`,
);
export const sqlLogger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD, HH:mm:ss' }),
    consoleLogFormat,
  ),
  transports: [new winston.transports.Console(), logTransportDaily],
});

class DatabaseLogger implements TypeOrmLogger {
  private readonly logger = sqlLogger;
  private label = { label: 'SQL' };
  logQuery(query: string, parameters?: unknown[], queryRunner?: QueryRunner) {
    if (queryRunner?.data?.isCreatingLogs) {
      return;
    }
    this.logger.info(
      `${query} ${this.stringifyParameters(parameters)}`,
      this.label,
    );
  }
  logQueryError(
    error: string,
    query: string,
    parameters?: unknown[],
    queryRunner?: QueryRunner,
  ) {
    if (queryRunner?.data?.isCreatingLogs) {
      return;
    }
    this.logger.error(
      `${query} ${this.stringifyParameters(parameters)} -- ${error}`,
      this.label,
    );
  }
  logQuerySlow(
    time: number,
    query: string,
    parameters?: unknown[],
    queryRunner?: QueryRunner,
  ) {
    if (queryRunner?.data?.isCreatingLogs) {
      return;
    }
    this.logger.warn(
      `Time: ${time} ${this.stringifyParameters(parameters)} -- ${query}`,
      this.label,
    );
  }
  logMigration(message: string) {
    this.logger.info(message);
  }
  logSchemaBuild(message: string) {
    this.logger.info(message);
  }
  log(
    level: 'log' | 'info' | 'warn',
    message: string,
    queryRunner?: QueryRunner,
  ) {
    if (queryRunner?.data?.isCreatingLogs) {
      return;
    }
    if (level === 'log') {
      return this.logger.info(message, this.label);
    }
    if (level === 'info') {
      return this.logger.debug(message, this.label);
    }
    if (level === 'warn') {
      return this.logger.warn(message, this.label);
    }
  }
  private stringifyParameters(parameters?: unknown[]) {
    try {
      if (parameters) {
        return `-- Parameters: ${JSON.stringify(parameters)}`;
      }
      return '';
    } catch {
      return '';
    }
  }
}

export const typeOrmAsyncConfig: TypeOrmModuleAsyncOptions = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: async (): Promise<TypeOrmModuleOptions> => {
    return {
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10),
      username: process.env.DB_USERNAME,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      entities,
      migrationsTableName: 'migrations',
      migrations: [
        'src/database/migrations/*.ts',
        // path.resolve(`${__dirname}/../../database/migrations/*{.ts,.js}`),
      ],
      //   cli: {
      //     migrationsDir: __dirname + '/../database/migrations',
      //   },
      extra: {
        charset: 'utf8mb4_unicode_ci',
      },
      synchronize: true,
      logging: true,
      logger: new DatabaseLogger(),
    };
  },
  async dataSourceFactory(options) {
    if (!options) {
      throw new Error('Invalid options passed');
    }

    return addTransactionalDataSource(new DataSource(options));
  },
};

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  username: process.env.DB_USERNAME,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  entities,
  migrationsTableName: 'migrations',
  migrations: [`src/database/migrations/*{.ts,.js}`],
  //   cli: {
  //     migrationsDir: __dirname + '/../database/migrations',
  //   },
  extra: {
    charset: 'utf8mb4_unicode_ci',
  },
  synchronize: false,
  logging: true,
  logger: 'file',
};

import winston from 'winston';

import DailyRotateFile from 'winston-daily-rotate-file';

const transportDaily: DailyRotateFile = new DailyRotateFile({
  filename: 'log/bot-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
});

const consoleLogFormat = winston.format.printf(
  ({ level, message, timestamp, label }) =>
    `${timestamp} ${level} [${label}]: ${message}`,
);
const transports = [
  new winston.transports.Console({
    level: 'debug',
    format: winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD, HH:mm:ss' }),
      winston.format.colorize(),
      consoleLogFormat,
    ),
  }),
  transportDaily,
];

export const botLogger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD, HH:mm:ss' }),
    consoleLogFormat,
  ),
  transports,
});

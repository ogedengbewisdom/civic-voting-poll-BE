import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import * as dotenv from 'dotenv';
dotenv.config();

const is_production = process.env.NODE_ENV === 'production';

export const winston_config = WinstonModule.createLogger({
  transports: [
    // development console
    ...(is_production
      ? []
      : [
          new winston.transports.Console({
            format: winston.format.combine(
              winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
              winston.format.colorize(),
              winston.format.printf(
                ({ timestamp, level, message, context }) =>
                  `[${timestamp}] [${context}] ${level}: ${message}`,
              ),
            ),
          }),
        ]),

    // error file
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.json(),
      ),
    }),

    // combined file
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.json(),
      ),
    }),
  ],
});

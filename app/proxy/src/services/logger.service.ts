import path from 'path';
import { createLogger, format, transports } from 'winston';
import winston from 'winston';

import environment from './environment.service';

export class Logger {
  private static MEGABYTE = 1000000;

  public logger: winston.Logger;

  constructor() {
    this.logger = createLogger({
      level: 'info',
      format: format.combine(
        format.timestamp(),
        format.simple(),
        format.printf((info) => {
          const message = info.message;
          delete info.message;

          return `${info.timestamp} | ${info.level} | ${message} ${JSON.stringify(info)}`;
        })
      ),
      transports: [
        new transports.Console({ level: environment.IS_DEVELOPMENT ? 'debug' : 'info'}),
        new transports.File({
          filename: path.join(environment.CWD, 'logs', 'server.log'),
          level: environment.IS_DEVELOPMENT ? 'debug' : 'info',
          maxsize: Logger.MEGABYTE
        })
      ]
    });
  }

  public log(level: 'debug' | 'info' | 'verbose' | 'http' | 'warn' | 'error', message: string, data: any = '') {
    this.logger.log(level, message, data);
  }

  public error(err: Error, customMessageFn: (message: string) => string = (message) => message ) {
    this.logger.log(
      'error',
      customMessageFn(err.message),
      { ...err }
    );
  }

  public logMethod = (level: 'debug' | 'info' | 'verbose' | 'http' | 'warn' | 'error') => (message: string, ...meta: any[]) => {
    this.logger.log(level, message, meta);
  }
}

export default new Logger();

import express from 'express';
import logger from '../services/logger.service';
import { Logger } from '../services/logger.service';
import environment from '../services/environment.service';

export default class Application {
  public express: express.Application;
  public port: string;

  public logger: Logger;
  public environment: any;

  constructor() {
    this.express = express();
    this.express.use(express.json());

    this.logger = logger;
    this.environment = environment;

    this.port = environment.PORT;
  }

  public start() {
    this.listen(this.port, () => {
      this.logger.log('info', `Proxy server started on port ${this.environment.PORT}, in ${this.environment.ENVIRONMENT} mode`);
    });
  }

  public listen(port: string, callback: () => void) {
    this.express.listen(port, callback);
  }
}

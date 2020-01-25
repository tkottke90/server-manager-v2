import express, { request, response } from 'express';
import * as io from 'socket.io';
import { createServer, Server } from 'http';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import logger from '../services/logger.service';
import { Logger } from '../services/logger.service';
import environment from '../services/environment.service';

import { Sequelize } from 'sequelize';
import sequelize from '../models/index';

const readFile = promisify(fs.readFile);

interface IApplicationOptions {
  logHttp?: 'on' | 'dev' | 'off';
}

export default class Application {
  public express: express.Application;
  public port: string;

  public logger: Logger;
  public environment: any;

  public database: Sequelize;
  private server: Server;
  private ioServer: io.Server;

  constructor(options?: IApplicationOptions) {
    this.database = sequelize();

    this.express = express();
    this.express.use(express.json());

    this.server = createServer(this.express);
    this.ioServer = require('socket.io')(this.server);

    this.logger = logger;
    this.environment = environment;

    this.port = environment.PORT;

    // Configure logging of http traffic
    if (options && (options?.logHttp === 'on' || (environment.IS_DEVELOPMENT && options.logHttp === 'dev')) ) {
      this.express.use((request: express.Request, response: express.Response, next: () => void) => {
        this.logger.log('http', `Request made to "${request.path}"`);
        next();
      });
    }
  }

  public start() {
    this.listen(this.port, () => {
      this.logger.log('info', `Application server started on port ${this.environment.PORT}, in ${this.environment.ENVIRONMENT} mode`);
    });
  }

  public listen(port: string, callback: () => void) {
    this.server.listen(port, callback);
  }

  public async registerRoutes(initializer: (app: Application) => void): Promise<void> {
    await initializer(this);
  }
}

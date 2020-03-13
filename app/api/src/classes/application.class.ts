import express, { request, response } from 'express';
import * as io from 'socket.io';
import { createServer, Server } from 'http';

import logger from '../services/logger.service';
import { Logger } from '../services/logger.service';
import environment from '../services/environment.service';

import AuthenticationService from '../services/authentication.service';
import { SocketService } from '../services/socket.service';

import { Sequelize } from 'sequelize';
import sequelize from '../models/index';

interface IApplicationOptions {
  logHttp?: 'on' | 'dev' | 'off';
}

export default class Application {
  public express: express.Application;
  public port: string;

  public logger: Logger;
  public environment: any;

  public database: Sequelize;

  // Authentication
  public authentication: AuthenticationService;
  private ioServer: io.Server;
  public socketService: SocketService;

  // Socket IO Properties
  private server: Server;

  constructor(options?: IApplicationOptions) {
    this.logger = logger;
    this.environment = environment;
    this.database = sequelize();

    this.socketService = new SocketService(this);

    this.express = express();
    this.express.use(express.json());

    this.server = createServer(this.express);
    this.ioServer = require('socket.io')(this.server);
    this.ioServer.on('connect', this.socketService.newSocket);

    this.port = environment.PORT;

    this.authentication = new AuthenticationService(this);

    // Configure logging of http traffic
    if (options && (options?.logHttp === 'on' || (environment.IS_DEVELOPMENT && options.logHttp === 'dev')) ) {
      this.express.use((request: express.Request, response: express.Response, next: () => void) => {
        this.logger.log('http', `${request.method.toUpperCase()} request made to "${request.path}"`);
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

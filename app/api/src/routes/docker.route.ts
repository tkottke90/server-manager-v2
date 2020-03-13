import http from 'http';
import fs from 'fs';
import Application from '../classes/application.class';
import BaseRoute from '../classes/base-route.class';
import { IContext } from '../interfaces';

interface IClientRequestOptions {
  method: 'GET' | 'POST';
  path: string;
  timeout?: number;
}

interface IMessageOptions {
  onData?: (data: any) => any;
  onEnd?: (error: boolean, output?: string) => void;
}

class DockerRoute extends BaseRoute {
  private socketPath = '/var/run/docker.sock';

  constructor(app: Application) {
    super(app, '/docker');

    fs.stat(this.socketPath, (err, stats: fs.Stats) => {
      if (err) {
        this.app.logger.log('warn', 'Cant access docker socket, skipping configuration');
        this.setup({ routes: [] });
        return;
      }

      this.setup({
        routes: [
          { method: 'get', path: '/containers', action: this.getContainers, beforeHooks: [ app.authentication.jwtAuth ] },
          { method: 'get', path: '/containers/:name', action: this.getContainerByName, beforeHooks: [ app.authentication.jwtAuth ] }
        ]
      });

      this.app.socketService.register({ name: 'get containers', action: this.getContainers});
      this.app.socketService.register({ name: 'get containers', action: this.getContainerByName});
    });
  }

  public getContainers = (context: IContext) => {
    return new Promise(async (resolve, reject) => {
      this.httpRequest(
        { method: 'GET', path: '/containers/json', timeout: 3000 },
        { onEnd: (error: boolean, output: string) => {
          if (error) {
            reject('Error occurred getting containers');
          }

          resolve(JSON.parse(output));
        }}
      );
    });
  }

  public getContainerByName = (context: IContext) => {
    const containerName = context.params
    
    return new Promise(async (resolve, reject) => {
      this.httpRequest(
        { method: 'GET', path: `/containers/${context.params.name}/json`, timeout: 3000 },
        { onEnd: (error: boolean, output: string) => {
          if (error) {
            reject('Error occurred getting containers');
          }

          resolve(JSON.parse(output));
        }}
      );
    });
  }

  private httpRequest(options: IClientRequestOptions, events?: IMessageOptions): http.ClientRequest {
    const httpOptions = {
      socketPath: this.socketPath,
      ...options
    };

    return http.get(httpOptions, (response: http.IncomingMessage ) => {
      response.setEncoding('utf8');
      let output = '';
      let errorStatus = false;

      if (response.statusCode > 300) {
        this.app.logger.log('error', `Bad Server Request to ${options.path}: ${response.statusCode}`, { response: response.statusMessage });
        errorStatus = true;
        response.destroy();
      }

      const defaultDataFn = (data: any) => output += data;
      const defaultEndFn = (errorStatus: boolean, output: string) => this.app.logger.log('verbose', 'ClientRequest Closed');

      response.on('data', events.onData || defaultDataFn );
      response.on('error', (err) => this.app.logger.error(err));
      response.on('end', () => {
        const endFn = events.onEnd ? events.onEnd : defaultEndFn;

        endFn(errorStatus, output);
      });
    });
  }
}

export function initialize(app: Application) {
  return new DockerRoute(app);
}

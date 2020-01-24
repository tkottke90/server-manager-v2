import express from 'express';
import { Router } from 'express';
import Application from './application.class';

interface IOptions {
  rootRoute: {
    get?: any;
    post?: any;
    put?: any;
    patch?: any;
    delete?: any;
    options?: any;
  };
  paginate?: boolean;
}

abstract class BaseRoute {
  public router: Router;
  public routeName: string;
  protected app: Application;
  public paginate: boolean = false;

  constructor(app: Application, route: string) {
    this.router = Router();
    this.app = app;
    this.routeName = route;

    // Log HTTP Requests with middleware
    this.router.use((request: express.Request, response: express.Response, next) => {
      app.logger.log('http', `${request.method} ${request.baseUrl}`);
      next();
    });

    app.logger.log('debug', `Setting up routes for ${route} ...`);
  }

  public setup(options: IOptions) {
    this.paginate = options.paginate || false;

    this.router.get('/', options.rootRoute.get ? options.rootRoute.get : this.get);
    this.router.post('/', options.rootRoute.post ? options.rootRoute.post : this.post);
    this.router.put('/', options.rootRoute.put ? options.rootRoute.put : this.put);
    this.router.delete('/', options.rootRoute.delete ? options.rootRoute.delete : this.delete);
    this.router.options('/', options.rootRoute.options ? options.rootRoute.options : this.options);

    this.app.express.use(this.routeName, this.router);

  }

  public get(request: express.Request, response: express.Response) {
    response.status(406).json({ message: 'Method Not Available'});
  }

  public post(request: express.Request, response: express.Response) {
    response.status(406).json({ message: 'Method Not Available'});
  }

  public put(request: express.Request, response: express.Response) {
    response.status(406).json({ message: 'Method Not Available'});
  }

  public delete(request: express.Request, response: express.Response) {
    response.status(406).json({ message: 'Method Not Available'});
  }

  public options(request: express.Request, response: express.Response) {
    response.status(406).json({ message: 'Method Not Available'});
  }
}

export default BaseRoute;
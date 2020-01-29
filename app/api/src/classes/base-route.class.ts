import express from 'express';
import { Router } from 'express';
import Application from './application.class';

import { IContext, IRoute } from '../interfaces';

interface IOptions {
  routes: IRoute[];
  paginate?: boolean;
}

const unusedRoute = (context: IContext) => {
  context.error = { code: 406, message: 'Method Not Available'};
  return context;
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
  }

  public setup(options: IOptions) {
    this.paginate = options.paginate || false;
 
    // Combine input routes with defaults. Filter out duplicate routes, then configure router instance
    [ ...options.routes, ...this.defaults]
      .filter( (route, index, parent) => {
        const first = parent.findIndex( item => item.method === route.method && item.path === route.path );
        return first === index;
      })
      .forEach( route => this.generateRoute(route));



    // this.router.get('/', options.rootRoute.get ? options.rootRoute.get : this.get);
    // this.router.post('/', options.rootRoute.post ? options.rootRoute.post : this.post);
    // this.router.put('/', options.rootRoute.put ? options.rootRoute.put : this.put);
    // this.router.delete('/', options.rootRoute.delete ? options.rootRoute.delete : this.delete);
    // this.router.options('/', options.rootRoute.options ? options.rootRoute.options : this.options);

    this.app.express.use(this.routeName, this.router);
  }

  private defaults: IRoute[] = [
    { method: 'get', path: '/', action: (context: IContext) => undefined, beforeHooks: [ unusedRoute ] },
    { method: 'post', path: '/', action: (context: IContext) => undefined, beforeHooks: [ unusedRoute ] },
    { method: 'put', path: '/', action: (context: IContext) => undefined, beforeHooks: [ unusedRoute ] },
    { method: 'patch', path: '/', action: (context: IContext) => undefined, beforeHooks: [ unusedRoute ] },
    { method: 'delete', path: '/', action: (context: IContext) => undefined, beforeHooks: [ unusedRoute ] },
    { method: 'options', path: '/', action: (context: IContext) => undefined, beforeHooks: [ unusedRoute ] }
  ]

  private processHooks = async function*(context: IContext, hooks: any[]) {
    let index = 0;
    let _context: IContext = context;

    while (index < hooks.length) {
      _context = await hooks[index](_context);
      yield { _context, _hookIndex: index };
      index++;
    }

    return _context;
  }

  private generateRoute(route: IRoute) {
    this.app.logger.log('debug', `Configuring: ${route.method.toUpperCase()} ${this.routeName}${route.path}`, { route })
    this.router[route.method](route.path, async (request: express.Request, response: express.Response) => {
      let context: IContext = {
        request,
        response,
        app: this.app,
        params: request.params,
        query: request.query,
        data: request.body,
        user: request.headers.authorization ? this.app.authentication.getUser(request.headers.authorization.split(' ')[1]) : undefined,
      };

      const _beforeHooks = route.beforeHooks || [];
      const _afterHooks = route.afterHooks || [];

      // Before Hooks
      for await (let hook of this.processHooks(context, _beforeHooks )) {
        const { _context, _hookIndex } = hook;
        context = _context;

        // If there is an error or the result is returned, then 
        if (context.error) {
          this.handleError('before', context, response);
          return;
        }

        // If result is set, skip the remaining hooks
        if (context.result) break;
      }

      if (!context.result) {
        try {
          context.result = await route.action(context);
        } catch (err) {
          console.error(err);
          this.app.logger.log('error', 'Error post action', { err })
          context.error = err;
          this.handleError('action', context, response);
        }
      }

      // After Hooks
      for await (let hook of this.processHooks(context, _afterHooks )) {
        const { _context, _hookIndex } = hook;
        context = _context;

        // If there is an error or the result is returned, then 
        if (context.error) {
          this.handleError('after', context, response);
          return;
        }
      }

      const status = context.result._code || 200;
      const data = context.result._code ? context.result.data : context.result;
      response.status(status).json(data);

    })
  }

  private handleError(location: 'before' | 'action' | 'after', context: IContext, response: express.Response): void {
    this.app.logger.log('error', 'Error handler called ', { error: context.error })
    response.status(context.error.code).json({ error: context.error });
  }
}

export default BaseRoute;
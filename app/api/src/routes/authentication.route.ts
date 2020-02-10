import { Request, Response } from 'express';
import Application from '../classes/application.class';
import BaseRoute from '../classes/base-route.class';
import { IContext } from '../interfaces';

class AuthenticationRoute extends BaseRoute {

  constructor(app: Application) {
    super(app, '/authenticate');

    this.setup({
        routes: [
          { method: 'post', path: '/', action: app.authentication.localAuth },
          { method: 'post', path: '/refresh', action: this.refreshToken },
        ]
    });
  }

  public refreshToken = (context: IContext) => {
    return new Promise( async (resolve, reject) => {
      const token = context.request.headers.authorization.split(' ')[1];
      try {
        const result = await this.app.authentication.refreshToken(token);
        resolve(result);
      } catch (err) {
        context.app.logger.error(err);
        reject(err);
      }
      
    });
  }
}

export function initialize(app: Application) {
  return new AuthenticationRoute(app);
};
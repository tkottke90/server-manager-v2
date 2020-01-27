import { Request, Response } from 'express';
import Application from '../classes/application.class';
import BaseRoute from '../classes/base-route.class';
import { IContext } from '../interfaces';

class AuthenticationRoute extends BaseRoute {

  constructor(app: Application) {
    super(app, '/authenticate');

    this.router.post('/refresh', this.refreshToken);

    this.setup({
        routes: [
          { method: 'post', path: '/', action: app.authentication.localAuth },
          { method: 'post', path: '/refresh', action: ( context: IContext) => undefined },
        ]
    });
  }

  refreshToken = async (request: Request, response: Response) => {
    const token = request.headers.authorization.split(' ')[1];
    const result = await this.app.authentication.refreshToken(token);
    response.json({ token: result });
  }
}

export function initialize(app: Application) {
  return new AuthenticationRoute(app);
};
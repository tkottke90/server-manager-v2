import DataModelRoute from '../classes/data-model.class';
import Application from '../classes/application.class';

import { IHooksArray, IModelHooks } from '../interfaces';
import { hashFieldsHook } from '../hooks';

class UsersRoute extends DataModelRoute {

  constructor(app: Application) {
    super(app, 'users', { exclusions: ['password'] });

    this.configure('User', { before: this.beforeHooks, after: this.afterHooks, error: this.errorHooks } as IModelHooks);
  }

  private beforeHooks: IHooksArray = {
    all: [ this.app.authentication.jwtAuth ],
    find: [],
    get: [],
    create: [ hashFieldsHook(['password']) ],
    update: [ hashFieldsHook(['password']) ],
    updateOrCreate: [ hashFieldsHook(['password']) ],
    delete: []
  }

  private afterHooks: IHooksArray = {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    updateOrCreate: [],
    delete: []
  }

  private errorHooks: IHooksArray = {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    updateOrCreate: [],
    delete: []
  }

}

export function initialize(app: Application) {
  return new UsersRoute(app);
};

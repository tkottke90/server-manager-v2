import DataModelRoute from '../classes/data-model.class';
import Application from '../classes/application.class';

import { IHooksArray, IModelHooks } from '../interfaces';

class UsersRoute extends DataModelRoute {

  constructor(app: Application) {
    super(app, 'users', { exclusions: ['password'] });

    this.configure('User', { before: beforeHooks, after: afterHooks, error: errorHooks } as IModelHooks);
  }

}

const beforeHooks: IHooksArray = {
  all: [],
  find: [],
  get: [],
  create: [],
  update: [],
  updateOrCreate: [],
  delete: []
}

const afterHooks: IHooksArray = {
  all: [],
  find: [],
  get: [],
  create: [],
  update: [],
  updateOrCreate: [],
  delete: []
}

const errorHooks: IHooksArray = {
  all: [],
  find: [],
  get: [],
  create: [],
  update: [],
  updateOrCreate: [],
  delete: []
}

export function initialize(app: Application) {
  return new UsersRoute(app);
};

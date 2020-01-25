import DataModelRoute from '../classes/data-model.class';
import Application from '../classes/application.class';

class UsersRoute extends DataModelRoute {

  constructor(app: Application) {
    super(app, 'users', { exclusions: ['password'] });

    this.configure('User');
  }

}

export function initialize(app: Application) {
  return new UsersRoute(app);
};

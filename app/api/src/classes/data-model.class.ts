import { Request, Response } from 'express';
import BaseRoute from './base-route.class';
import Application from './application.class';

import { IQuery, QueryClass } from './query.class';

interface IConfigurationOptions {
  exclusions?: string[];
}

const generateResponse = (paginate: boolean, data: any, limit: number, skip: number, total: number) => {
  return paginate ?
    { total, limit, skip, data} :
    [ ...data ] ;
};

export default class DataModelRoute extends BaseRoute {

  public model: any;
  public paginate: boolean;

  // Return value exclusions
  private exclusions: string[];

  constructor(app: Application, routeName: string, options?: IConfigurationOptions) {
    super(app, `/${routeName}`);

    if (options) {
      this.exclusions = options.exclusions ? options.exclusions : [];
    }
  }

  public configure(modelName: string) {
    if (!this.app.database.models[modelName]) {
      this.app.logger.log('error', `Invalid Model - Please check Sequelize Configuration`);
      process.exit(2);
    }

    this.model = this.app.database.models[modelName];

    this.router.get('/:id', this.getById(this.model));
    this.router.patch('/:id', this.patch(this.model));
    this.router.put('/:id', this.put(this.model));
    this.router.delete('/:id', this.delete(this.model));

    this.setup({
      rootRoute: {
        get: this.get(this.model),
        post: this.post(this.model)
      },
      paginate: true
    })
  }

  // Find User
  public get(model: any): (request: Request, response: Response) => void {
    return async (request: Request, response: Response) => {
      const query: QueryClass = new QueryClass(request.query);
      let result: any;

      const queryObj = query.toSequelizeQuery();
      queryObj.attributes = { exclude: this.exclusions };

      try {
        result = await model.findAll(queryObj);
      } catch (err) {
        this.app.logger.error(err, (message) => `Sequelize Error during update in GET Request: ${message}`);
        response.status(500).send('Internal Server Error: Error Getting Users');
        return;
      }

      response.json(generateResponse(query.paginate, result, query.limit, query.skip, await model.count()));
    };
  }

  // Get User
  public getById(model: any): (request: Request, response: Response) => void {
    return async (request: Request, response: Response) => {
      let result: any;

      // Check if table has primary key
      if (model._hasPrimaryKeys) {
        // Generate a new query object
        const query = {} as IQuery;
        // Add the primary key defined in the model and the id sent in via the url
        query[model.primaryKeyField] = request.params.id;

        // Query the Database
        try {
          result = await model.findOne({
            where: query,
            attributes: { exclude: this.exclusions }
          });
        } catch (err) {
          this.app.logger.error(err, (message) => `Sequelize Error during get in GET by ID Request: ${message}`);
          response.status(500).send('Error in Model Get');
          return;
        }
      }

      if (!result) {
        response.status(404).send('Nothing Found with that ID');
        return;
      }

      response.status(200).send(result);
    };
  }

  // Create User
  public post(model: any): (request: Request, response: Response) => void {
    return async (request: Request, response: Response) => {
      let result: any;

      // Query the Database
      try {
        result = await model.create(request.body, {
          attributes: { exclude: this.exclusions }
        });
      } catch (err) {
        this.app.logger.error(err, (message) => `Sequelize Error during POST Request: ${message}`);
        response.status(500).send(`Error POSTing to ${this.routeName} - please check logs`);
        return;
      }

      response.status(201).send(result);
    };
  }

  // Update User
  public put(model: any): (request: Request, response: Response) => void {
    return async (request: Request, response: Response) => {
      // Generate a new query object
      const query = {} as IQuery;
      // Add the primary key defined in the model and the id sent in via the url
      query[model.primaryKeyField] = request.params.id;

      try {
        const result = await model.findOne({
          where: query,
          attributes: { exclude: this.exclusions }
        });

        // console.dir(result);
        if (result) {
          const updatedItem = await result.update(request.body, { attributes: { exclude: this.exclusions } });
          response.status(200).json(updatedItem);
          return;
        }

        const newItem = await model.create(request.body, { attributes: { exclude: this.exclusions } });
        response.status(201).json(newItem);

      } catch (err) {
        this.app.logger.error(err, (message) => `Sequelize Error during PUT Request: ${message}`);
        response.status(500).send(`Error PUTing to ${this.routeName} - please check logs`);
        return;
      }

      response.json({});
    };
  }

  public patch(model: any): (request: Request, response: Response) => void {
    return async (request: Request, response: Response) => {
      let result: any;

      // Check if table has primary key
      if (model._hasPrimaryKeys) {
        // Generate a new query object
        const query = {} as IQuery;
        // Add the primary key defined in the model and the id sent in via the url
        query[model.primaryKeyField] = request.params.id;

        // Query the Database
        try {
          result = await model.findOne({
            where: query,
            attributes: { exclude: this.exclusions }
          });
        } catch (err) {
          this.app.logger.error(err, (message) => `Sequelize Error during get in PATCH Request: ${message}`);
          response.status(500).send(`Error PATCHing to ${this.routeName} - please check logs`);
          return;
        }
      }

      if (!result) {
        this.app.logger.log('warn', 'Invalid PATCH request - no record found');
        response.status(404).send('Nothing Found with that ID - please check logs');
        return;
      }

      try {
        result.update(request.body);
      } catch (err) {
        this.app.logger.error(err, (message) => `Sequelize Error during update in PATCH Request: ${message}`);
        response.status(500).send('Error Updating in PATCH request - please check logs');
        return;
      }

      // Should only return 1 result
      response.status(200).send(result);
    };
  }

  // Delete User
  public delete(model: any): (request: Request, response: Response) => void {
    return async (request: Request, response: Response) => {
      let result: any;

      // Check if table has primary key
      if (model._hasPrimaryKeys) {
        // Generate a new query object
        const query = {} as IQuery;
        // Add the primary key defined in the model and the id sent in via the url
        query[model.primaryKeyField] = request.params.id;

        // Query the Database
        try {
          result = await model.findOne({
            where: query
          });
        } catch (err) {
          this.app.logger.error(err, (message) => `Sequelize Error during get in DELETE Request: ${message}`);
          response.status(500).send(`Error DELETing to ${this.routeName} - please check logs`);
          return;
        }
      }

      if (!result) {
        this.app.logger.log('warn', 'Invalid DELETE request - no record found');
        response.status(404).send('Nothing Found with that ID');
        return;
      }

      try {
        result.destroy();
      } catch (err) {
        this.app.logger.error(err, (message) => `Sequelize Error during delete in DELETE Request: ${message}`);
        response.status(500).send('Error Updating in DELETE request - please check logs');
        return;
      }

      // Should only return 1 result
      response.status(204).json();
    };
  }

  public options(request: Request, response: Response) {
    response.json({});
  }

}

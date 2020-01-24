import express from 'express';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

import Application from '../classes/application.class';

const readFile = promisify(fs.readFile);

// Route Modules
import usersRoute from './users.route';
//

/**
 * This module is designed to register express http endpoints.  Modules should be loaded into this file with the follwoing syntax:
 *
 *  Module: (app: Application) =>  void
 *
 * This format will allow the application to be passed onto those modules and routers assigned
 *
 * @param app Application instance
 */
export default function routes(app: Application): void {
  app.express.get('/', async (request: express.Request, response: express.Response) => {
    const packageJSON = await readFile(path.join(app.environment.CWD, 'package.json'), 'utf8');
    const { name, version, description, homepage } = JSON.parse(packageJSON);

    app.logger.log('http', 'Request made to "/"');

    response.status(200).json({ name, version, description, homepage });
  });

  usersRoute(app);

}

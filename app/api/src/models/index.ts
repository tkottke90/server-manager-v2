import { Sequelize } from 'sequelize-typescript';
import * as bcrypt from 'bcrypt';

import environment from '../services/environment.service';
import logger from '../services/logger.service';

export default function sequelizeService() {
  let sequelize;

  const modelFileExtension = environment.IS_DEVELOPMENT ? 'ts' : 'js';

  sequelize = new Sequelize({
    database: environment.DATABASE_NAME,
    username: environment.DATABASE_USER,
    password: environment.DATABASE_PASSWORD,
    host: environment.DATABASE_HOST,
    port: environment.DATABASE_PORT,
    // ssl: true,
    // dialectOptions: {
    //   ssl: true
    // },
    dialect: 'postgres',
    logging: (...msg) => logger.log('verbose', 'sequelize', msg),
    models: [`${__dirname}/**/*.model.${modelFileExtension}`],
    modelMatch: (filename, member) => {
      return filename.substring(0, filename.indexOf('.model')) === member.toLowerCase();
    }
  });

  const UserModel = sequelize.model('User');
  UserModel.count().done(async (count: number) => {
    if (count <= 0) {
      logger.log('info', 'User Table Empty - Creating Default User', { email: 'tkottke90@gmail.com' });
      try {
        UserModel.create({
          firstName: 'Admin',
          lastName: 'User',
          email: 'tkottke90@gmail.com',
          password: await bcrypt.hash('12345', environment.SALT),
          type: 'admin',
          active: true,
          settings: {}
        });
      } catch (err) {
        logger.error(err, (message) => `Sequelize Error during Setup - Create Default User: ${message}`);
        process.exit(1);
      }
    }
  });
  return sequelize;
}

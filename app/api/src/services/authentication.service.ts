import passport from 'passport';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import Application from '../classes/application.class';
import { Socket } from 'socket.io';
import { Sequelize } from 'sequelize/types';
import { Logger } from './logger.service';

import { Strategy as JWTStrategy, ExtractJwt } from 'passport-jwt';
import { Strategy as LocalStrategy } from 'passport-local';

import { IContext } from '../interfaces';

export default class AuthenticationService {
  public logger: Logger;
  public secret: string;
  public salt: number;
  public tokenLifespan: string;

  public database: Sequelize;

  constructor(app: Application) {
    this.database = app.database;
    this.logger = app.logger;
    this.secret = app.environment.SECRET;
    this.salt = app.environment.SALT;
    this.tokenLifespan = app.environment.TOKEN_LIFESPAN || '1h';

    this.configureLocalAuth(app);
    this.configureJWTAuth();

    app.express.use(passport.initialize());
  }

  public localAuth = (context: IContext) => {
    return new Promise((resolve, reject) => {
      passport.authenticate('local', async (error, user, message) => {
        if (error) {
          this.logger.log('error', 'Error authenticating locally', { error });
          reject({ code: 500, message });
          return;
        }

        if (!user) {
          this.logger.log('warn', 'Failed Login Attempt');
          reject({ code: 401, message });
          return;
        }

        this.logger.log('info', `User successfully logged in`, { user: user.email });

        delete user.password;

        const token = await jwt.sign(user, this.secret, { algorithm: 'HS512', expiresIn: this.tokenLifespan });

        resolve({ token });
      })(context.request, context.response);
    });
  }

  public jwtAuth = (context: IContext) => {
    return new Promise<IContext>((resolve, reject) => {
      passport.authenticate('jwt', { session: false }, async (error, user, message) => {
        if (error) {
          this.logger.log('error', 'Error authenticating with jwt', { error });
          context.error = { _code: 500, message };
          resolve(context);
          return;
        }

        if (!user) {
          this.logger.log('warn', 'Failed Login Attempt');
          context.error = { _code: 401, message };
          resolve(context);
          return;
        }

        delete user.password;
        context.user = user;

        resolve(context);
      })(context.request, context.response);
    });
  }

  public jwtSocketAuth = (socket: Socket) => async (packet: any, next: () => void) => {
    // Socket Packet: [ event name, data, token, meta-data ]
    const [, , token, ...rest ] = packet;

    try {
      jwt.verify(token, this.secret);
    } catch (err) {
      this.logger.error(err, (message) => `Invalid JWT Token - ${message}`);
      socket.emit('token invalid');
      return;
    }

    // Else allow request
    next();
  }

  public refreshToken = async (token: string): Promise<string | boolean> => {
    const validToken = jwt.verify(token, this.secret);

    if (validToken) {
      const tokenContents: any = jwt.decode(token);

      const { User } = this.database.models;

      const user = await User.findOne({ where: { id: tokenContents.id } });

      return jwt.sign(user, this.secret, { algorithm: 'HS512', expiresIn: this.tokenLifespan });
    }

    return false;
  }

  public async hashString(password: string) {
    this.logger.log('debug', 'Values', { password, salt: this.salt });
    return await bcrypt.hash(password, this.salt);
  }

  public scrubPasswords(object: any) {
    const _objectWithPassword = object;
    delete _objectWithPassword.password;
    return _objectWithPassword;
  }

  public async getUser(token: string) {
    const tokenContents: any = jwt.decode(token);

    const { User } = this.database.models;

    return await User.findOne({ where: { id: tokenContents.id } });
  }

  private configureLocalAuth(app: Application) {
    passport.use(new LocalStrategy(
      { usernameField: 'email', session: false },
      async (username, password, done) => {
        try {
          const { User } = app.database.models;

          const user: any = await User.findOne({ where: { email: username } });

          if (!user) {
            return done(null, false, { message: 'Invalid Username or Password' });
          }

          if (!user.active) {
            return done(null, false, { message: 'Deactivated User' });
          }

          const isMatch = await bcrypt.compare(password, user.dataValues.password);

          if (!isMatch) {
            return done(null, false, { message: 'Invalid Credentials' });
          }

          done(null, user.get({ plain: true }));

        } catch (err) {
          done(err);
        }
      }
    ));
  }

  private configureJWTAuth() {
    passport.use(new JWTStrategy({
      secretOrKey: this.secret,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      algorithms: [ 'HS512' ]
    }, (jwtPayload, done) => done(null, jwtPayload)) );
  }
}

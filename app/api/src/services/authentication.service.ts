import { Request, Response } from 'express';
import passport from 'passport';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import Application from '../classes/application.class';
import { Logger } from './logger.service';

import { Strategy as JWTStrategy, ExtractJwt } from 'passport-jwt';
import { Strategy as LocalStrategy } from 'passport-local';

export class AuthenticationService {
  logger: Logger;
  secret: string;
  salt: number;
  tokenLifespan: string;
  
  constructor(app: Application) {
    this.configureLocalAuth(app);

    this.logger = app.logger;
    this.secret = app.environment.SECRET;
    this.salt = app.environment.SALT;
    this.tokenLifespan = app.environment.TOKEN_LIFESPAN || '1h';

    app.express.use(passport.initialize());
  }

  private configureLocalAuth(app: Application) {
    passport.use(new LocalStrategy(
      { usernameField: 'email', session: false },
      async (username, password, done) => {
        try {
          const { User } = app.database.models;

          const user: any = await User.findOne({ where: { email: username } });

          if (!user) {
            return done(null, false, { message: 'Invalid Credentials' });
          }

          if (!user.active) {
            return done(null, false, { message: 'Deactivated User' })
          }

          const isMatch = await bcrypt.compare(password, user.password);

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

  private configureJWTAuth() { }

  public localAuth = (request: Request, response: Response) => {
    passport.authenticate('local', async (error, user, message) => {
      if (error) {
        this.logger.log('error', 'Error authenticating locally', { error })
        response.status(500).send('Login Error');
        return;
      }

      if (!user) {
        this.logger.log('warn', 'Failed Login Attempt');
        response.status(401).send(message);
        return;
      }

      this.logger.log('info', `User successfully logged in: `, { user: user.email });

      delete user.password;

      const token = jwt.sign(user, this.secret, { algorithm: 'HS512', expiresIn: this.tokenLifespan });

      response.status(303).json({ token });
    })(request, response);
  }

  public jwtAuth() { }

  public jwtSocketAuth() { }

  public refreshToken = async (token: string): Promise<string|boolean> => {
    try {
      var validToken = jwt.verify(token, this.secret);
    } catch (err) {
      this.logger.log('debug', `Error validating token: ${err.message}`);
      return false;
    }

    if (validToken) {
      const tokenContents: any = jwt.decode(token);

      const { User } = this.database.models;

      const user = await User.findOne({ where: { id: tokenContents.id } });

      return jwt.sign(user, this.secret, { algorithm: 'HS512', expiresIn: this.tokenLifespan });
    }

    return false;
  }

  public hashPasswords() { }

  public scrubPasswords() { }
}
import passport from 'passport';
import { BasicStrategy } from 'passport-http';

import { FireDepartment } from '../../sqldb';
import { UnauthorizedError } from '../../util/error';

function httpAuthenticate(User, username, password, done) {
  User.find({
    where: {
      username: username.toLowerCase()
    },
    include: [FireDepartment]
  }).nodeify((err, user) => {
    if(err) {
      throw err;
    } else if(!user) {
      throw new UnauthorizedError('This username is not registered.');
    }

    user.authenticate(password, (authError, authenticated) => {
      if(authError) {
        throw authError;
      } else if(!authenticated) {
        throw new UnauthorizedError('This password is not correct. and stuff');
      }

      return done(null, user);
    });
  });
}

export function setup(User) {
  passport.use(new BasicStrategy((username, password, done) =>
    httpAuthenticate(User, username, password, done)));
}

export default setup;

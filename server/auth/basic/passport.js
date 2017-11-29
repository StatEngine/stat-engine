import passport from 'passport';
import {BasicStrategy} from 'passport-http';

function httpAuthenticate(User, username, password, done) {
  User.find({
    where: {
      username: username.toLowerCase()
    }
  }).nodeify((err, user) => {
    if(err) {
      return done(err);
    } else if(!user) {
      return done(null, false, {
        message: 'This username is not registered.'
      });
    }

    user.authenticate(password, (authError, authenticated) => {
      if(authError) {
        return done(authError);
      } else if(!authenticated) {
        return done(null, false, { message: 'This password is not correct.' });
      }

      return done(null, user);
    });
  });
}

export function setup(User) {
  passport.use(new BasicStrategy((username, password, done) =>
    httpAuthenticate(User, username, password, done)
  ));
}

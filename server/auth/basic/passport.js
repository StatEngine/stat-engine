import passport from 'passport';
import {BasicStrategy} from 'passport-http';

function httpAuthenticate(User, username, password, done) {
  User.find({
    where: {
      username: username.toLowerCase()
    }
  })
    .then(user => {
      if(!user) {
        return done(null, false, {
          message: 'This username is not registered.'
        });
      }
      user.authenticate(password, function(authError, authenticated) {
        if(authError) {
          return done(authError);
        }
        if(!authenticated) {
          return done(null, false, { message: 'This password is not correct.' });
        } else {
          return done(null, user);
        }
      });
    })
    .catch(err => done(err));
}

export function setup(User/*, config*/) {
  passport.use(new BasicStrategy(function(username, password, done) {
    return httpAuthenticate(User, username, password, done);
  }));
}

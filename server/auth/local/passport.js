import passport from 'passport';
import {Strategy as LocalStrategy} from 'passport-local';

function localAuthenticate(User, FireDepartment, username, password, done) {
  User.find({
    where: {
      username: username.toLowerCase()
    },
    include: [ FireDepartment ]
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

export function setup(User, FireDepartment) {
  passport.use(new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password' // this is the virtual field on the model
  }, (username, password, done) =>
    localAuthenticate(User, FireDepartment, username, password, done)));
}

export default setup;

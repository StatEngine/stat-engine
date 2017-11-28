import passport from 'passport';
import {Strategy as LocalAPIKeyStrategy} from 'passport-localapikey';

function apiAuthenticate(User, apiKey, done) {
  return User.find({
    where: {
      api_key: apiKey
    }
  }).then(user => {
    if(!user) {
      return done(null, false, {
        message: 'Could not find user with specified api key.'
      });
    }
    return done(null, user);
  })
    .catch(err => done(err));
}

export function setup(User) {
  passport.use(new LocalAPIKeyStrategy(function(apiKey, done) {
    return apiAuthenticate(User, apiKey, done);
  }));
}

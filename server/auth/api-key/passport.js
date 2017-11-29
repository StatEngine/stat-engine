import passport from 'passport';
import {Strategy as LocalAPIKeyStrategy} from 'passport-localapikey';

function apiAuthenticate(User, apiKey, done) {
  User.find({
    where: {
      api_key: apiKey
    }
  }).nodeify((err, user) => {
    if(err) {
      return done(err);
    } else if(!user) {
      return done(null, false, {
        message: 'This api key is not registered.'
      });
    } else {
      return done(null, user);
    }
  });
}

export function setup(User) {
  passport.use(new LocalAPIKeyStrategy((apiKey, done) =>
    apiAuthenticate(User, apiKey, done)
  ));
}

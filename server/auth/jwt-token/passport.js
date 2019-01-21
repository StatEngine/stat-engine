import passport from 'passport';
import { Strategy, ExtractJwt } from 'passport-jwt';

import config from '../../config/environment';
import { FireDepartment } from '../../sqldb';

export function setup() {
  var opts = {}
  opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
  opts.secretOrKey = config.oauth.secret;

  passport.use(new Strategy(opts, (jwt_payload, done) => {
    done(null, jwt_payload);
  }));
}

export default setup;
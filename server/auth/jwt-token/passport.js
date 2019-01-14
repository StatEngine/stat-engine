import passport from 'passport';
import { Strategy, ExtractJwt } from 'passport-jwt';

import { FireDepartment } from '../../sqldb';

export function setup() {
  var opts = {}
  opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
  opts.secretOrKey = 'top_secret';

  passport.use(new Strategy(opts, (jwt_payload, done) => {
    done(null, jwt_payload)
  }))
}

export default setup;
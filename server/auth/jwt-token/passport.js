import passport from 'passport';
import { Strategy, ExtractJwt } from 'passport-jwt';

import { FireDepartment } from '../../sqldb';

export function setup() {
  var opts = {}
  opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
  opts.secretOrKey = 'top_secret';

  passport.use(new Strategy(opts, (jwt_payload, done) => {
  // TODO: inject the fire department
  console.info('valid')
    done(null, { roles: ['user'], FireDepartment: { _id: '123'}})}
  ))
}

export default setup;
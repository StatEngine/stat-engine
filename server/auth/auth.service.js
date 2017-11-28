'use strict';

import compose from 'composable-middleware';
import passport from 'passport';

import config from '../config/environment';
import {User} from '../sqldb';

/*
 * Serialize user into session
 * Store only user id in session
 */
passport.serializeUser(function(user, done) {
  done(null, user._id);
});

/*
 * Deserialize user from session userId
 */
passport.deserializeUser(function(userId, done) {
  return User.find({
    where: {
      _id: userId
    }
  }).nodeify(done);
});

/**
 * Determines if user is authenticated either by session or localapikey/basic auth
 */
export function isAuthenticated(req, res, next) {
  if(!req.isAuthenticated()) {
    return passport.authenticate(['localapikey', 'basic'], { session: false })(req, res, next);
  } else {
    return next();
  }
}

/**
 * Checks if the user role meets the minimum requirements of the route
 */
export function hasRole(roleRequired) {
  if(!roleRequired) {
    throw new Error('Required role needs to be set');
  }

  return compose()
    .use(function meetsRequirements(req, res, next) {
      if(config.userRoles.indexOf(req.user.role) >= config.userRoles.indexOf(roleRequired)) {
        return next();
      } else {
        return res.status(403).send('Forbidden');
      }
    });
}

/**
 * Checks if the fire departmment in request matches firecares_id param
 */
export function hasFireDepartment(req, res, next) {
  if(!req.query.firecares_id) {
    return res.status(403).send('Forbidden. Must set firecares_id queryParam');
  }

  if(!req.fire_department) {
    return res.status(403).send('Forbidden. Must user is not assigned a fire department');
  }

  if(req.query.firecares_id !== req.fire_department.firecares_id) {
    return res.status(403).send('Forbidden');
  }
  next();
}

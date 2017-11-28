'use strict';

import compose from 'composable-middleware';
import passport from 'passport';

import config from '../config/environment';
import {FireDepartment, User} from '../sqldb';

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
  return FireDepartment.find({
    where: {
      _id: req.user.fire_department__id
    },
  }).nodeify((err, fireDepartment) => {
    if(err) {
      return res.status(500);
    } else if(!fireDepartment) {
      return res.status(403).send('Forbidden. User is not assigned to a Fire Department');
    } else if(req.params.firecaresId !== fireDepartment.firecares_id) {
      return res.status(403).send(`User is not assigned to Fire Department: ${req.params.firecaresId}`);
    }
    req.fire_department = fireDepartment;

    next();
  });
}

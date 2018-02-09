'use strict';

import compose from 'composable-middleware';
import passport from 'passport';

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
export function isApiAuthenticated(req, res, next) {
  if(!req.isAuthenticated()) {
    return passport.authenticate(['localapikey', 'basic'], { session: false })(req, res, next);
  } else {
    return next();
  }
}

/**
 * Determines if user is authenticated by session
 */
export function isAuthenticated(req, res, next) {
  if(!req.isAuthenticated()) {
    return res.redirect('/login');
  }
  next();
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
      if(req.user.roles.indexOf(roleRequired) >= 0 || req.user.roles.indexOf('admin') >= 0) {
        return next();
      } else {
        return res.status(403).send('Forbidden. User does not have necessary priviliges to access');
      }
    });
}

/**
 * Checks if user has fire deparment and sets in request
 */
export function hasFireDepartment(req, res, next) {
  if (req.user.roles.indexOf('admin') >= 0){
    return next();
  }

  return FireDepartment.find({
    where: {
      _id: req.user.fire_department__id
    },
  }).nodeify((err, fireDepartment) => {
    if(err) {
      return res.status(500);
    } else if(!fireDepartment) {
      return res.status(403).send(
        'Forbidden. User is not assigned to a Fire Department');
    }
    req.fire_department = fireDepartment;

    next();
  });
}

/*
 * Ensures user is assigned to fire department of request path
 */
export function belongsToFireDepartment(req, res, next) {
  if(!req.params.firecaresId && !req.query.firecaresId) {
    return next('firecares id not in path');
  }
  if(!req.user) {
    return next('user not set');
  }
  if(!req.fire_department) {
    return next('fire_department not set');
  }

  const firecaresId = req.params.firecaresId || req.query.firecaresId;
  if(firecaresId !== req.fire_department.firecares_id) {
    return res.status(403).send(
      `User is not assigned to Fire Department with id: ${req.params.firecaresId}`);
  }
  return next();
}

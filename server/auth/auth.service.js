'use strict';

import compose from 'composable-middleware';
import passport from 'passport';
import jwt from 'express-jwt';
import jwksRsa from 'jwks-rsa';
import { FireDepartment, User } from '../sqldb';
import { BadRequestError, ForbiddenError, NotFoundError } from '../util/error';
import { Log } from '../util/log';

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
    },
    include: [FireDepartment]
  }).nodeify(done);
});

/**
 * Determines if user is authenticated either by session or localapikey/basic auth
 */
export function isApiAuthenticated(req, res, next) {
  if(!req.isAuthenticated()) {
    return passport.authenticate(['localapikey', 'basic', 'jwt'], { session: false })(req, res, next);
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
    throw new BadRequestError('Required role needs to be set');
  }

  return compose()
    .use(function meetsRequirements(req, res, next) {
      if(req.user.roles.indexOf('admin') >= 0) {
        return next();
      } else if(roleRequired === 'dashboard_user' && req.user.roles.indexOf('department_admin') >= 0) {
        return next();
      } else if(roleRequired === 'user' && req.user.roles.indexOf('app') >= 0) {
        return next();
      } else if(req.user.roles.indexOf(roleRequired) >= 0) {
        return next();
      } else {
        return next(new ForbiddenError('User does not have necessary priviliges to access'));
      }
    });
}

export function hasPermission(permissions) {
  if(!permissions) {
    throw new ForbiddenError('Required permissions needs to be set');
  }

  return compose()
    .use(function meetsRequirements(req, res, next) {
      // Currently, permissions only apply to apps, so pass if the request is a user
      if(req.user.roles.indexOf('app') < 0) return next();
      Log.info('user', req.user);
      if(req.user.permissions.indexOf(permissions) >= 0) {
        return next();
      } else {
        return next(new ForbiddenError('App does not have necessary priviliges to access'));
      }
    });
}

/**
 * Checks if user has fire deparment and sets in request
 */
export async function hasFireDepartment(req, res, next) {
  if(req.user.isAdmin && req.query.firecaresId) {
    const fireDepartment = await FireDepartment.find({
      where: {
        firecaresId: req.query.firecaresId
      },
    });

    if(!fireDepartment) throw new NotFoundError('Fire department not found');

    req.fireDepartment = fireDepartment;
    return next();
  } else if(req.user.isAdmin && req.query.fireDepartmentId) {
    const fireDepartment = await FireDepartment.find({
      where: {
        _id: req.query.fireDepartmentId
      },
    });

    if(!fireDepartment) throw new NotFoundError('Fire department not found!');

    req.fireDepartment = fireDepartment;
    return next();
  } else if(req.user.isAdmin) {
    req.fireDepartment = req.user.FireDepartment;
    return next();
  } else if(!req.user || !req.user.FireDepartment || !req.user.FireDepartment._id) {
    throw new ForbiddenError('User is not assigned to fire department');
  } else {
    req.fireDepartment = req.user.FireDepartment;
    return next();
  }
}

/*
 * Ensures user is assigned to fire department of request path
 */
export function belongsToFireDepartment(req, res, next) {
  if(!req.params.firecaresId) {
    throw new BadRequestError('Param "firecaresId" is required');
  }
  if(!req.user) {
    throw new BadRequestError('user not set');
  }
  if(!req.fire_department) {
    throw new BadRequestError('fire_department not set');
  }

  if(req.params.firecaresId !== req.fire_department.firecares_id) {
    throw new ForbiddenError(`User is not assigned to Fire Department with id: ${req.params.firecaresId}`);
  }
  return next();
}

export const checkOauthJwt = jwt({
  // Dynamically provide a signing key based on the kid in the header and the singing keys provided by the JWKS endpoint.
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://cognito-idp.us-east-1.amazonaws.com/${process.env.COGNITO_POOL_ID}/.well-known/jwks.json`
  }),
  algorithms: ['RS256']
});

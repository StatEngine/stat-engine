'use strict';
import config from '../config/environment';
import jwt from 'jsonwebtoken';
import expressJwt from 'express-jwt';
import compose from 'composable-middleware';
import {FireDepartment, User} from '../sqldb';

var validateJwt = expressJwt({
  secret: config.secrets.session
});

/**
 * Attaches the user object to the request if authenticated
 * Otherwise returns 403
 */
export function isAuthenticated() {
  return compose()
    // Validate jwt
    .use(function(req, res, next) {
      // allow access_token to be passed through query parameter as well
      if(req.query && req.query.hasOwnProperty('access_token')) {
        req.headers.authorization = `Bearer ${req.query.access_token}`;
      }
      // IE11 forgets to set Authorization header sometimes. Pull from cookie instead.
      if(req.query && typeof req.headers.authorization === 'undefined') {
        req.headers.authorization = `Bearer ${req.cookies.token}`;
      }
      validateJwt(req, res, next);
    })
    // eslint-disable-next-line no-unused-vars
    .use(function(err, req, res, next) {
      // Redirect to login page
      if(err.name === 'UnauthorizedError') {
        res.redirect('/login');
      } else {
        return next();
      }
    })
    // Attach user to request
    .use(function(req, res, next) {
      User.find({
        where: {
          _id: req.user._id
        },
      }).nodeify((err, user) => {
        if(err || !user) {
          return res.status(401).end('Unauthorized');
        }
        req.user = user;
        next();
      });
    })
    // Attach fire department to request
    .use(function(req, res, next) {
      if(!req.user) {
        return next();
      }
      FireDepartment.find({
        where: {
          _id: req.user.fire_department__id
        },
      }).nodeify((err, fireDepartment) => {
        if(err) {
          return res.status(500).end();
        }
        req.fire_department = fireDepartment;
        next();
      });
    });
}

/**
 * Checks if the user role meets the minimum requirements of the route
 */
export function hasRole(roleRequired) {
  if(!roleRequired) {
    throw new Error('Required role needs to be set');
  }

  return compose()
    .use(isAuthenticated())
    .use(function meetsRequirements(req, res, next) {
      if(config.userRoles.indexOf(req.user.role) >= config.userRoles.indexOf(roleRequired)) {
        return next();
      } else {
        return res.status(403).send('Forbidden');
      }
    });
}

/**
 * Checks if the fire departmment in request matches fd_id param
 */
export function hasFireDepartment(req, res, next) {
  if(!req.query.fd_id) {
    return res.status(403).send('Forbidden. Must set fd_id queryParam');
  }

  if(!req.fire_department) {
    return res.status(403).send('Forbidden. Must user is not assigned a fire department');
  }

  if(req.query.fd_id !== req.fire_department.fd_id) {
    return res.status(403).send('Forbidden');
  }
  next();
}

/**
 * Returns a jwt token signed by the app secret
 */
export function signToken(id, role) {
  return jwt.sign({ _id: id, role }, config.secrets.session, {
    expiresIn: 60 * 60 * 5
  });
}

/**
 * Set token cookie directly for oAuth strategies
 */
export function setTokenCookie(req, res) {
  if(!req.user) {
    return res.status(404).send('It looks like you aren\'t logged in, please try again.');
  }
  var token = signToken(req.user._id, req.user.role);
  res.cookie('token', token);
  res.redirect('/');
}

'use strict';

import uuidv4 from 'uuid/v4';
import Mailchimp from 'mailchimp-api-v3';

import config from '../../config/environment';
import { FireDepartment, User } from '../../sqldb';

function validationError(res, statusCode) {
  statusCode = statusCode || 422;
  return function(err) {
    return res.status(statusCode).json(err);
  };
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    return res.status(statusCode).send(err);
  };
}

/**
 * Get list of users
 * restriction: 'admin'
 */
export function index(req, res) {
  return User.findAll({
    attributes: [
      '_id',
      'username',
      'first_name',
      'last_name',
      'email',
      'role',
      'provider',
    ]
  })
    .then(users => {
      res.status(200).json(users);
    })
    .catch(handleError(res));
}

/**
 * Creates a new user
 */
export function create(req, res) {
  var newUser = User.build(req.body);

  // force this all so user cannot overwrite in request
  newUser.setDataValue('provider', 'local');
  newUser.setDataValue('role', 'user');
  newUser.setDataValue('department', '');
  newUser.setDataValue('api_key', uuidv4());

  return newUser.save()
    .then(user => {
      if(config.mailchimp.apiKey && config.mailchimp.listId) {
        const mailchimp = new Mailchimp(config.mailchimp.apiKey);
        mailchimp.post(`/lists/${config.mailchimp.listId}/members`, {
          email_address: user.email,
          status: 'subscribed',
          merge_fields: {
            FNAME: user.first_name,
            LNAME: user.last_name
          }
        }, err => {
          if(err) {
            console.error(err);
          }
          res.json(user);
        });
      } else {
        res.json(user);
      }
    })
    .catch(validationError(res));
}

/**
 * Get a single user
 */
export function show(req, res, next) {
  var userId = req.params.id;

  return User.find({
    where: {
      _id: userId
    }
  })
    .then(user => {
      if(!user) {
        return res.status(404).end();
      }
      res.json(user.profile);
    })
    .catch(err => next(err));
}

/**
 * Deletes a user
 * restriction: 'admin'
 */
export function destroy(req, res) {
  return User.destroy({ where: { _id: req.params.id } })
    .then(function() {
      res.status(204).end();
    })
    .catch(handleError(res));
}

/**
 * Change a users password
 */
export function changePassword(req, res) {
  var userId = req.user._id;
  var oldPass = String(req.body.oldPassword);
  var newPass = String(req.body.newPassword);

  return User.find({
    where: {
      _id: userId
    }
  })
    .then(user => {
      if(user.authenticate(oldPass)) {
        user.password = newPass;
        return user.save()
          .then(() => {
            res.status(204).end();
          })
          .catch(validationError(res));
      } else {
        return res.status(403).end();
      }
    });
}

/**
 * Get my info
 */
export function me(req, res, next) {
  var userId = req.user._id;

  return User.find({
    where: {
      _id: userId
    },
    attributes: [
      'username',
      'first_name',
      'last_name',
      'email',
      'role',
      'provider',
      'fire_department__id',
      'api_key',
      'aws_access_key_id',
      'aws_secret_access_key',
    ]
  })
    .then(user => {
      if(!user) {
        return res.status(401).end();
      }

      return FireDepartment.find({
        where: {
          _id: user.fire_department__id
        },
        attributes: [
          'fd_id',
          'name',
          'state',
          'firecares_id',
          'timezone',
        ]
      })
        .then(fire_department => res.json({ user, fire_department}))
        .catch(err => next(err));
    })
    .catch(err => next(err));
}

/**
 * Authentication callback
 */
export function authCallback(req, res) {
  res.redirect('/');
}

'use strict';

import uuidv4 from 'uuid/v4';
import nodemailer from 'nodemailer';
import mandrillTransport from 'nodemailer-mandrill-transport';
import Mailchimp from 'mailchimp-api-v3';
import _ from 'lodash';

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
  let where;
  if(req.user.isAdmin) where = undefined;
  else {
    where = {
      $or: [
        {fire_department__id: req.user.fire_department__id},
        {requested_fire_department_id: req.user.FireDepartment._id }
      ]
    };
  }

  return User.findAll({
    where,
    include: [FireDepartment],
    attributes: [
      '_id',
      'username',
      'first_name',
      'last_name',
      'email',
      'role',
      'requested_fire_department_id',
    ]
  })
    .then(users => {
      res.status(200).json(users);
    })
    .catch(handleError(res));
}

export function get(req, res) {
  return res.json(req.loadedUser);
}

function sendWelcomeEmail(user) {
  if(config.mailSettings.mandrillAPIKey) {
    var mailOptions = {};
    mailOptions.from = config.mailSettings.serverEmail;
    mailOptions.to = user.email;

    // Mailing service
    var mailTransport = nodemailer.createTransport(mandrillTransport({
      auth: {
        apiKey: config.mailSettings.mandrillAPIKey
      }
    }));

    mailOptions.mandrillOptions = {
      template_name: config.mailSettings.newUserTemplate,
      template_content: [],
      message: {
        merge: false,
        merge_language: 'handlebars',
        global_merge_vars: []
      }
    };
    return mailTransport.sendMail(mailOptions);
  } else {
    return new Promise(resolve => {
      setTimeout(resolve, 0);
    });
  }
}

function addToMailingList(user) {
  if(config.mailchimp.apiKey && config.mailchimp.listId) {
    const mailchimp = new Mailchimp(config.mailchimp.apiKey);
    return mailchimp.post(`/lists/${config.mailchimp.listId}/members`, {
      email_address: user.email,
      status: 'subscribed',
      merge_fields: {
        FNAME: user.first_name,
        LNAME: user.last_name
      }
    });
  } else {
    return new Promise(resolve => {
      setTimeout(resolve, 0);
    });
  }
}


/**
 * Creates a new user
 */
export function create(req, res) {
  var newUser = User.build(req.body);

  // force this all so user cannot overwrite in request
  newUser.setDataValue('provider', 'local');
  newUser.setDataValue('role', 'user');
  newUser.setDataValue('api_key', uuidv4());

  if(!req.user || !req.user.isAdmin) newUser.setDataValue('fire_department__id', undefined);

  return newUser.save()
    .then(user => addToMailingList(user)
      .then(() => {
        if(!req.body.requested_fire_department_id && !req.body.fire_department__id) {
          sendWelcomeEmail(user)
            .then(() => {
              res.status(204).send({user});
            });
        } else {
          res.status(204).send({user});
        }
      }))
    .catch(validationError(res));
}

/**
 * Edits a user
 */
export function edit(req, res) {
  const user = req.loadedUser;

  user.last_name = req.body.last_name;
  user.first_name = req.body.first_name;

  if(req.user.isAdmin) {
    user.role = req.body.role;

    user.fire_department__id = req.body.fire_department__id;
    user.requested_fire_department_id = req.body.requested_fire_department_id;
  }

  user.save()
    .then(usersaved => {
      res.status(204).send({usersaved});
    })
    .catch(validationError(res));
}

/**
 * Request access
 */
export function requestAccess(req, res) {
  const user = req.loadedUser;

  user.requested_fire_department_id = req.body.requested_fire_department_id;

  user.save()
    .then(usersaved => {
      res.status(204).send({usersaved});
    })
    .catch(handleError(res));
}

/**
 * Request access
 */
export function revokeAccess(req, res) {
  const user = req.loadedUser;

  user.fire_department__id = null;
  user.requested_fire_department_id = null;
  let roles = user.role.split(',');
  _.pull(roles, 'kibana_admin');
  user.role = roles.join(',');
  user.save()
    .then(usersaved => {
      res.status(204).send({usersaved});
    })
    .catch(handleError(res));
}

/**
 * Request access
 */
export function approveAccess(req, res) {
  const user = req.loadedUser;

  user.fire_department__id = user.requested_fire_department_id;
  user.role = `${user.role},kibana_admin`;
  user.requested_fire_department_id = null;

  user.save()
    .then(usersaved => {
      res.status(204).send({usersaved});
    })
    .catch(handleError(res));
}

/**
 * Change a users password
 */
export function changePassword(req, res) {
  const user = req.loadedUser;

  var oldPass = String(req.body.oldPassword);
  var newPass = String(req.body.newPassword);

  if(user.authenticate(oldPass)) {
    user.password = newPass;
    return user.save()
      .then(() => {
        res.status(204).end();
      })
      .catch(validationError(res));
  } else {
    return res.status(403).send({ password: 'Wrong password'});
  }
}

/**
 * Updates a users password with token
 */
export function updatePassword(req, res) {
  var pass_token = String(req.body.password_token);
  var newPass = String(req.body.newPassword);

  if(!pass_token || !newPass) {
    return res.status(400).send({ error: 'Password was not able to reset.' });
  } else {
    return User.find({
      where: {
        password_token: pass_token
      }
    })
      .then(user => {
        if(user) {
          user.password = newPass;
          user.password_token = null;
          user.password_reset_expire = null;

          return user.save()
            .then(() => {
              res.status(204).end();
            })
            .catch(validationError(res));
        } else {
          return res.status(400).send({ error: 'Password was not able to reset.' });
        }
      });
  }
}

/**
 * Sends email to reset a users password
 */
export function resetPassword(req, res) {
  var userEmail = req.body.useremail;

  if(!userEmail) {
    return res.status(400).send({ error: 'Email must be included in request.' });
  } else {
    return User.find({
      where: {
        email: userEmail
      }
    })
      .then(user => {
        if(user) {
          if(config.mailSettings.mandrillAPIKey) {
            user.password_token = uuidv4();
            user.password_reset_expire = Date.now() + 5 * 3600000;

            return user.save()
              .then(() => {
                var resetUrl = `${req.protocol}://${req.get('host')}/updatepassword?password_token=${user.password_token}`;
                var mailOptions = {};
                mailOptions.from = config.mailSettings.serverEmail;
                mailOptions.to = user.email;

                // Mailing service
                var mailTransport = nodemailer.createTransport(mandrillTransport({
                  auth: {
                    apiKey: config.mailSettings.mandrillAPIKey
                  }
                }));

                mailOptions.mandrillOptions = {
                  template_name: config.mailSettings.resetPasswordTemplate,
                  template_content: [],
                  message: {
                    merge: true,
                    merge_language: 'handlebars',
                    global_merge_vars: [{
                      name: 'RESETPASSWORDURL',
                      content: resetUrl
                    }]
                  }
                };
                return mailTransport.sendMail(mailOptions)
                  .then(() => {
                    res.status(204).end();
                  })
                  .catch(validationError(res));
              })
              .catch(validationError(res));
          } else {
            return res.status(403).end();
          }
        } else {
          res.status(400).send({ error: 'No user matches that Email.' });
        }
      });
  }
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
      'password_token',
      'password_reset_expire',
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

export function hasEditPermisssion(req, res, next) {
  if(req.user.username === req.loadedUser.username) return next();

  if(req.user.isAdmin) return next();
  if(req.user.isDepartmentAdmin && req.loadedUser.requested_fire_department_id === req.user.FireDepartment._id) return next();
  if(req.user.isDepartmentAdmin && req.loadedUser.FireDepartment._id === req.user.FireDepartment._id) return next();

  else res.status(403).send({ error: 'User is not authorized to perform this function' });
}

/**
 * Authentication callback
 */
export function authCallback(req, res) {
  res.redirect('/');
}

export function loadUser(req, res, next, id) {
  User.find({
    where: {
      _id: id
    },
    include: [FireDepartment]
  })
    .then(user => {
      if(user) {
        req.loadedUser = user;
        return next();
      }
      return res.status(404).send({ error: 'User not found'});
    })
    .catch(err => next(err));
}

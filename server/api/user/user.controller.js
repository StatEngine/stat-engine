'use strict';

import uuidv4 from 'uuid/v4';
import Mailchimp from 'mailchimp-api-v3';
import nodemailer from 'nodemailer';
import mandrillTransport from 'nodemailer-mandrill-transport';
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
 * Edits a user
 */
export function edit(req, res) {
  var userId = req.params.id;

  if(req.body.username === req.params.username) {
    return User.find({
      where: {
        _id: userId
      }
    })
      .then(user => {
        user.last_name = req.body.last_name;
        user.first_name = req.body.first_name;

        user.save()
          .then(usersaved => {
            res.status(204).send({usersaved});
          })
          .catch(validationError(res));
      });
  } else {
    return res.status(403).end();
  }
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
    return res.status(400).send({ error: 'Password was not able to reset.' });
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

/**
 * Authentication callback
 */
export function authCallback(req, res) {
  res.redirect('/');
}

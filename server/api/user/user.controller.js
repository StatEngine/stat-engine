'use strict';

import uuidv4 from 'uuid/v4';
import nodemailer from 'nodemailer';
import mandrillTransport from 'nodemailer-mandrill-transport';
import Mailchimp from 'mailchimp-api-v3';
import _ from 'lodash';
import Sequelize from 'sequelize';

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

async function getDepartmentAdmins(departmentId) {
  return await User.findAll({
    where: {
      fire_department__id: departmentId,
      role: { $iLike: '%department_admin%' },
    },
  });
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
      'nfors',
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

async function sendRequestDepartmentAccessEmail(user, department) {
  if(!config.mailSettings.mandrillAPIKey) {
    return
  }

  const departmentAdmins = await getDepartmentAdmins(department._id);

  const mailTransport = nodemailer.createTransport(mandrillTransport({
    auth: {
      apiKey: config.mailSettings.mandrillAPIKey
    }
  }));

  mailTransport.sendMail({
    from: config.mailSettings.serverEmail,
    to: departmentAdmins.map(admin => admin.email),
    mandrillOptions: {
      template_name: config.mailSettings.requestDepartmentAccessTemplate,
      template_content: [],
      message: {
        merge: false,
        merge_language: 'handlebars',
        global_merge_vars: [{
          name: 'DEPARTMENT_NAME',
          content: department.name,
        }, {
          name: 'DEPARTMENT_IMAGE_URL',
          content: `https://s3.amazonaws.com/statengine-public-assets/logos/${department.firecares_id}.png`,
        }, {
          name: 'USER_USERNAME',
          content: user.username,
        }, {
          name: 'USER_EMAIL',
          content: user.email,
        }, {
          name: 'USER_FIRST_NAME',
          content: user.first_name,
        }, {
          name: 'USER_LAST_NAME',
          content: user.last_name,
        }, {
          name: 'APPROVE_DASHBOARD_ADMIN_URL',
          content: `https://statengine.io/departmentAdmin?action=approve_dashboard_admin&action_username=${user.username}`,
        }, {
          name: 'APPROVE_DASHBOARD_READONLY_URL',
          content: `https://statengine.io/departmentAdmin?action=approve_dashboard_readonly&action_username=${user.username}`,
        }, {
          name: 'REJECT_ACCESS_URL',
          content: `https://statengine.io/departmentAdmin?action=revoke&action_username=${user.username}`,
        }],
      },
    },
  });
}

async function sendAccessApprovedEmail(user, department, readonly) {
  if(!config.mailSettings.mandrillAPIKey) {
    return
  }

  const mailTransport = nodemailer.createTransport(mandrillTransport({
    auth: {
      apiKey: config.mailSettings.mandrillAPIKey
    }
  }));

  mailTransport.sendMail({
    from: config.mailSettings.serverEmail,
    to: user.email,
    mandrillOptions: {
      template_name: config.mailSettings.departmentAccessApproved,
      template_content: [],
      message: {
        merge: false,
        merge_language: 'handlebars',
        global_merge_vars: [{
          name: 'DEPARTMENT_NAME',
          content: department.name,
        }, {
          name: 'DEPARTMENT_IMAGE_URL',
          content: `https://s3.amazonaws.com/statengine-public-assets/logos/${department.firecares_id}.png`,
        }, {
          name: 'USER_FIRST_NAME',
          content: user.first_name,
        }, {
          name: 'ACCESS_LEVEL',
          content: (readonly) ? 'Dashboard Readonly' : 'Dashboard Admin',
        }, {
          name: 'CONTROL_CENTER_URL',
          content: 'https://statengine.io/home'
        }],
      },
    },
  });
}

async function sendAccessRevokedEmail(user, department, hadAccess) {
  if(!config.mailSettings.mandrillAPIKey) {
    return
  }

  const mailTransport = nodemailer.createTransport(mandrillTransport({
    auth: {
      apiKey: config.mailSettings.mandrillAPIKey
    }
  }));

  let templateName;
  if(hadAccess) {
    templateName = config.mailSettings.departmentAccessRevoked;
  } else {
    templateName = config.mailSettings.departmentAccessRejected;
  }

  mailTransport.sendMail({
    from: config.mailSettings.serverEmail,
    to: user.email,
    mandrillOptions: {
      template_name: templateName,
      template_content: [],
      message: {
        merge: false,
        merge_language: 'handlebars',
        global_merge_vars: [{
          name: 'DEPARTMENT_NAME',
          content: department.name,
        }, {
          name: 'DEPARTMENT_IMAGE_URL',
          content: `https://s3.amazonaws.com/statengine-public-assets/logos/${department.firecares_id}.png`,
        }, {
          name: 'USER_FIRST_NAME',
          content: user.first_name,
        }],
      },
    },
  });
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
export async function create(req, res) {
  const user = User.build(req.body);

  // force this all so user cannot overwrite in request
  if(!req.user || !req.user.isAdmin) {
    user.setDataValue('provider', 'local');
    user.setDataValue('role', 'user');
    user.setDataValue('fire_department__id', undefined);
  }
  user.setDataValue('api_key', uuidv4());

  try {
    await user.save();
    addToMailingList(user);

    if(!req.body.requested_fire_department_id && !req.body.fire_department__id) {
      sendWelcomeEmail(user);
    }

    // Send access request to department admin if a department was set.
    if(req.body.requested_fire_department_id) {
      const department = await FireDepartment.find({
        where: {
          _id: req.body.requested_fire_department_id,
        }
      });
      sendRequestDepartmentAccessEmail(user, department);
    }

    res.status(204).send({ user });
  } catch (err) {
    validationError(res);
  }
}

/**
 * Edits a user
 */
export function edit(req, res) {
  const user = req.loadedUser;

  user.last_name = req.body.last_name;
  user.first_name = req.body.first_name;

  // protected fields
  if(req.user.isAdmin) {
    user.role = req.body.role;
    user.requested_fire_department_id = req.body.requested_fire_department_id;
    user.nfors = req.body.nfors;
  }

  if(req.user.isGlobal) {
    user.fire_department__id = req.body.fire_department__id;
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
export async function requestAccess(req, res) {
  const user = req.loadedUser;

  user.requested_fire_department_id = req.body.requested_fire_department_id;

  try {
    await user.save();
    const department = await FireDepartment.find({
      where: {
        _id: user.requested_fire_department_id,
      },
    });
    sendRequestDepartmentAccessEmail(user, department);
    res.status(204).send({ user });
  } catch (err) {
    handleError(res);
  }
}

/**
 * Request access
 */
export async function revokeAccess(req, res) {
  const user = req.loadedUser;

  const hadAccess = (user.fire_department__id != null);
  const departmentId = user.fire_department__id || user.requested_fire_department_id;

  user.fire_department__id = null;
  user.requested_fire_department_id = null;
  let roles = user.role.split(',');
  _.pull(roles, 'kibana_admin');
  _.pull(roles, 'kibana_ro_strict');
  user.role = roles.join(',');

  try {
    await user.save();
    const department = await FireDepartment.find({
      where: {
        _id: departmentId,
      },
    });
    sendAccessRevokedEmail(user, department, hadAccess);
    res.status(204).send({ user });
  } catch (err) {
    handleError(res)
  }
}

/**
 * Request access
 */
export async function approveAccess(req, res) {
  const user = req.loadedUser;

  if(user.requested_fire_department_id) {
    user.fire_department__id = user.requested_fire_department_id;
    user.requested_fire_department_id = null;
  }

  if(req.query.readonly) user.role = `${user.role},kibana_ro_strict`;
  else user.role = `${user.role},kibana_admin`;

  try {
    await user.save();
    const department = await FireDepartment.find({
      where: {
        _id: user.fire_department__id,
      },
    });
    sendAccessApprovedEmail(user, department, req.query.readonly);
    res.status(204).send({ user });
  } catch (err) {
    handleError(res)
  }
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

export function requestUsername(req, res) {
  const userEmail = req.body.useremail;

  if(!userEmail) {
    return res.status(400).send({ error: 'Email must be included in request.' });
  } else {
    return User.find({
      where: Sequelize.where(Sequelize.fn('lower', Sequelize.col('email')), userEmail.toLowerCase()),
    })
      .then(user => {
        if(user) {
          if(config.mailSettings.mandrillAPIKey) {
            const mailOptions = {};
            mailOptions.from = config.mailSettings.serverEmail;
            mailOptions.to = user.email;

            // Mailing service
            const mailTransport = nodemailer.createTransport(mandrillTransport({
              auth: {
                apiKey: config.mailSettings.mandrillAPIKey
              }
            }));

            mailOptions.mandrillOptions = {
              template_name: config.mailSettings.requestUsernameTemplate,
              template_content: [],
              message: {
                merge: true,
                merge_language: 'handlebars',
                global_merge_vars: [{
                  name: 'USERNAME',
                  content: user.username
                }]
              }
            };

            return mailTransport.sendMail(mailOptions)
              .then(() => {
                res.status(204).end();
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
 * Sends email to reset a users password
 */
export function resetPassword(req, res) {
  var userEmail = req.body.useremail;

  if(!userEmail) {
    return res.status(400).send({ error: 'Email must be included in request.' });
  } else {
    return User.find({
      where: Sequelize.where(Sequelize.fn('lower', Sequelize.col('email')), userEmail.toLowerCase()),
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
          '_id',
          'fd_id',
          'name',
          'state',
          'firecares_id',
          'timezone',
          'logo_link',
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

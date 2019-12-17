'use strict';

import uuidv4 from 'uuid/v4';
import nodemailer from 'nodemailer';
import mandrillTransport from 'nodemailer-mandrill-transport';
import Mailchimp from 'mailchimp-api-v3';
import _ from 'lodash';
import Sequelize from 'sequelize';
import generator from 'generate-password';

import config from '../../config/environment';
import { FireDepartment, User, UserWorkspace, Workspace } from '../../sqldb';

import { BadRequestError, ForbiddenError, UnprocessableEntityError, NotFoundError, InternalServerError } from '../../util/error';

async function getDepartmentAdmins(departmentId) {
  if(departmentId == null) {
    throw new InternalServerError('departmentId cannot be null or undefined!');
  }

  return await User.findAll({
    where: {
      fire_department__id: departmentId,
      role: { $iLike: '%department_admin%' },
    },
  });
}

export async function getAll(req, res) {
  let userAttributes = [
    '_id',
    'username',
    'email',
    'role',
  ];

  // Return more data for requested
  if(req.user.isDepartmentAdmin) {
    userAttributes = [
      '_id',
      'username',
      'first_name',
      'last_name',
      'email',
      'role',
      'requested_fire_department_id',
      'nfors',
      'fire_department__id',
    ];
  }

  const fd = await FireDepartment.find({
    where: {
      _id: req.user.FireDepartment._id
    },
    attributes: [
      '_id',
    ],
    include: [{
      model: User,
      attributes: userAttributes,
    }]
  });

  if(!fd) throw new NotFoundError('Fire department not found');

  let users = fd.Users;
  if(req.query.includeRequested && req.user.isDepartmentAdmin) {
    let requestedUsers = await User.findAll({
      where: {
        requested_fire_department_id: req.user.FireDepartment._id
      },
      attributes: userAttributes
    });
    users = users.concat(requestedUsers);
  }
  if(req.query.includeAll && req.user.isAdmin) {
    let allOtherUsers = await User.findAll({
      where: {
        _id: {
          $not: req.user.FireDepartment._id
        }
      },
      attributes: userAttributes
    });
    users = users.concat(allOtherUsers);
    users = _.uniqBy(users, '_id');
  }

  return res.json(users);
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

function sendNewUserByDepartmentAdminEmail(user, department, password) {
  if (!config.mailSettings.mandrillAPIKey || !department) {
    return Promise.reject();
  }

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
    template_name: config.mailSettings.newUserByDepartmentAdminTemplate,
    template_content: [],
    message: {
      merge: false,
      merge_language: 'handlebars',
      global_merge_vars: [{
        name: 'DEPARTMENT_NAME',
        content: department.name,
      }, {
        name: 'DEPARTMENT_IMAGE_URL',
        content: department.logo_link,
      }, {
        name: 'USER_USERNAME',
        content: user.username,
      }, {
        name: 'USER_USERPASSWORD',
        content: password,
      }, {
        name: 'USER_EMAIL',
        content: user.email,
      }, {
        name: 'USER_FIRST_NAME',
        content: user.first_name,
      }, {
        name: 'USER_LAST_NAME',
        content: user.last_name,
      }],
    }
  };

  return mailTransport.sendMail(mailOptions);
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
      template_name: config.mailSettings.departmentAccessRequestedTemplate,
      template_content: [],
      message: {
        merge: false,
        merge_language: 'handlebars',
        global_merge_vars: [{
          name: 'DEPARTMENT_NAME',
          content: department.name,
        }, {
          name: 'DEPARTMENT_IMAGE_URL',
          content: department.logo_link || statEngineLogoLink,
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
          name: 'APPROVE_ACCESS_URL',
          content: `https://statengine.io/departmentAdmin?action=approve_access&action_username=${user.username}`,
        }, {
          name: 'REJECT_ACCESS_URL',
          content: `https://statengine.io/departmentAdmin?action=revoke_access&action_username=${user.username}`,
        }],
      },
    },
  });
}

async function sendAccessApprovedEmail(user, department) {
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
      template_name: config.mailSettings.departmentAccessApprovedTemplate,
      template_content: [],
      message: {
        merge: false,
        merge_language: 'handlebars',
        global_merge_vars: [{
          name: 'DEPARTMENT_NAME',
          content: department.name,
        }, {
          name: 'DEPARTMENT_IMAGE_URL',
          content: department.logo_link || statEngineLogoLink,
        }, {
          name: 'USER_FIRST_NAME',
          content: user.first_name,
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
    templateName = config.mailSettings.departmentAccessRevokedTemplate;
  } else {
    templateName = config.mailSettings.departmentAccessRejectedTemplate;
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
          content: department.logo_link || statEngineLogoLink,
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
 * Generates a 10 digit random password
 *
 * @returns {string}
 */
function generatePassword() {
  return generator.generate({
    length: 10,
    numbers: true
  });
}

/**
 * Creates a new user
 */
export async function create(req, res) {
  const { body } = req;

  if (_.isNil(body.password)) body.password = generatePassword();
  const user = User.build(body);

  // force this all so user cannot overwrite in request
  if(!req.user || !req.user.isAdmin) {
    user.setDataValue('provider', 'local');
    user.setDataValue('role', 'user');

    // as deafult behaviour we are expected to invalidate the department_id
    let fire_department__id = undefined;
    // but if it is requested by a departmentAdmin and the given department is the same as where
    // this user is departmentAdmin
    if (req.user && req.user.isDepartmentAdmin && req.user.fire_department__id === body.fire_department__id) {
      fire_department__id = body.fire_department__id;
      user.setDataValue('role', 'user,dashboard_user');
    }

    user.setDataValue('fire_department__id', fire_department__id);
  }
  user.setDataValue('api_key', uuidv4());

  try {
    await user.save();
  } catch (err) {
    throw new UnprocessableEntityError(err.message);
  }

  addToMailingList(user);

  if(!body.requested_fire_department_id && !body.fire_department__id) {
    sendWelcomeEmail(user);
  }

  // Send access request to department admin if a department was set.
  if(body.requested_fire_department_id) {
    const department = await FireDepartment.find({
      where: {
        _id: body.requested_fire_department_id,
      }
    });
    sendRequestDepartmentAccessEmail(user, department);
  }

  if (body.new_user_by_department_admin) {
    const password = body.password;
    const department = await FireDepartment.find({
      where: {
        _id: body.fire_department__id,
      }
    });
    sendNewUserByDepartmentAdminEmail(user, department, body.password);
  }

  res.status(204).send({ user });
}

/**
 * Edits a user
 */
export async function edit(req, res) {
  const firstName = req.body.first_name;
  const lastName = req.body.last_name;
  const unsubscribedEmails = req.body.unsubscribed_emails;
  const role = req.body.role;
  const requestedFireDepartmentId = req.body.requested_fire_department_id;
  const nfors = req.body.nfors;
  const fireDepartmentId = req.body.fire_department__id;

  // The user being edited (req.user is the user making the edit).
  const user = req.loadedUser;

  if(firstName != null) {
    user.first_name = firstName;
  }

  if(lastName != null) {
    user.last_name = lastName;
  }

  if(unsubscribedEmails != null) {
    user.unsubscribed_emails = unsubscribedEmails;
  }

  // protected fields
  if(req.user.isAdmin) {
    user.role = role;
    user.requested_fire_department_id = requestedFireDepartmentId;
    user.nfors = nfors;
  }

  if(req.user.isGlobal) {
    user.fire_department__id = fireDepartmentId;
  }

  try {
    await user.save();
  } catch (err) {
    throw new UnprocessableEntityError(err.message);
  }

  res.status(200).send({ user });
}

/**
 * Request access
 */
export async function requestAccess(req, res) {
  const user = req.loadedUser;

  user.requested_fire_department_id = req.body.requested_fire_department_id;

  await user.save();
  const department = await FireDepartment.find({
    where: {
      _id: user.requested_fire_department_id,
    },
  });
  sendRequestDepartmentAccessEmail(user, department);
  res.status(204).send({ user });
}

/**
 * Revoke access
 */
export async function revokeAccess(req, res) {
  const user = req.loadedUser;

  const hadAccess = (user.fire_department__id != null);
  const departmentId = user.fire_department__id || user.requested_fire_department_id;

  user.fire_department__id = null;
  user.requested_fire_department_id = null;
  user.role = 'user';

  await user.save();
  const department = await FireDepartment.find({
    where: {
      _id: departmentId,
    },
  });
  sendAccessRevokedEmail(user, department, hadAccess);
  res.status(204).send({ user });
}

/**
 * Approve access
 */
export async function approveAccess(req, res) {
  const user = req.loadedUser;

  if(user.requested_fire_department_id) {
    user.fire_department__id = user.requested_fire_department_id;
    user.requested_fire_department_id = null;
  }

  user.role = `${user.role},dashboard_user`;

  await user.save();

  // assign to default workspaces
  const workspace = await Workspace.findOne({
    where: {
      slug: 'default',
      fire_department__id: user.fire_department__id,
    }
  });

  if(workspace) {
    await UserWorkspace.create({
      user__id: user._id,
      workspace__id: workspace._id,
      permission: 'ro_strict',
      is_owner: false,
    });
  }

  const department = await FireDepartment.find({
    where: {
      _id: user.fire_department__id,
    },
  });
  sendAccessApprovedEmail(user, department, req.query.readonly);
  res.status(204).send({ user });
}

/**
 * Change a users password
 */
export async function changePassword(req, res) {
  const user = req.loadedUser;

  var oldPass = String(req.body.oldPassword);
  var newPass = String(req.body.newPassword);

  if(!user.authenticate(oldPass)) {
    throw new ForbiddenError('Wrong password');
  }

  user.password = newPass;

  try {
    await user.save();
  } catch (err) {
    throw new UnprocessableEntityError(err.message);
  }

  res.status(204).end();
}

/**
 * Updates a users password with token
 */
export async function updatePassword(req, res) {
  var pass_token = String(req.body.password_token);
  var newPass = String(req.body.newPassword);

  if(!pass_token || !newPass) {
    throw new BadRequestError('Password was not able to reset')
  }

  const user = await User.find({
    where: {
      password_token: pass_token
    }
  });

  if(!user) {
    throw new BadRequestError('Password was not able to reset');
  }

  user.password = newPass;
  user.password_token = null;
  user.password_reset_expire = null;

  try {
    await user.save();
  } catch (err) {
    throw new UnprocessableEntityError(err.message);
  }

  res.status(204).end();
}

export async function requestUsername(req, res) {
  const userEmail = req.body.useremail;

  if(!userEmail) {
    throw new BadRequestError('Email must be included in request.');
  }

  const user = await User.find({
    where: Sequelize.where(Sequelize.fn('lower', Sequelize.col('email')), userEmail.toLowerCase()),
  });

  if(!user) {
    throw new NotFoundError('User not found');
  }

  if(!config.mailSettings.mandrillAPIKey) {
    throw new ForbiddenError('Mandrill API key is invalid');
  }

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

  try {
    await mailTransport.sendMail(mailOptions);
  } catch (err) {
    throw new UnprocessableEntityError(err.message);
  }

  res.status(204).end();
}

/**
 * Sends email to reset a users password
 */
export async function resetPassword(req, res) {
  var userEmail = req.body.useremail;

  if(!userEmail) {
    throw BadRequestError('Email must be included in request');
  }

  const user = await User.find({
    where: Sequelize.where(Sequelize.fn('lower', Sequelize.col('email')), userEmail.toLowerCase()),
  });

  if(!user) {
    throw new NotFoundError('User not found');
  }

  if(!config.mailSettings.mandrillAPIKey) {
    throw new ForbiddenError('Mandrill API key is invalid');
  }

  user.password_token = uuidv4();
  user.password_reset_expire = Date.now() + 5 * 3600000;

  try {
    await user.save();
  } catch (err) {
    throw new UnprocessableEntityError(err.message);
  }

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

  try {
    await mailTransport.sendMail(mailOptions);
  } catch (err) {
    throw new UnprocessableEntityError(err.message);
  }

  res.status(204).end();
}

/**
 * Get my info
 */
export async function me(req, res, next) {
  var userId = req.user._id;

  let user = await User.find({
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
      'unsubscribed_emails',
    ],
    include: [{
      model: FireDepartment,
      attributes: [
        '_id',
        'fd_id',
        'name',
        'state',
        'firecares_id',
        'timezone',
        'logo_link',
      ],
    }, {
      model: Workspace,
      through: {},
      where: {
        is_deleted: false,
      },
      required: false,
    }]
  });

  if(!user) throw new NotFoundError('User not found');

  let workspaces = _.filter(user.Workspaces, uw => uw.UserWorkspace.permission !== null);
  // Globals have access to all workspaces, regardless of permissions
  if (req.user.isGlobal) {
    workspaces = await Workspace.findAll({
      where: {
        fire_department__id: req.user.fire_department__id,
        is_deleted: false,
      }
    })
  }

  const resData = {
    user: user.get({ plain: true }),
    fire_department: user.FireDepartment,
    workspaces,
  };

  // remove dup data
  delete resData.user.FireDepartment;
  delete resData.user.Workspaces;

  res.json(resData);
}

export function hasEditPermisssion(req, res, next) {
  if(req.user.username === req.loadedUser.username) return next();

  if(req.user.isAdmin) return next();
  if(req.user.isDepartmentAdmin && req.loadedUser.requested_fire_department_id === req.user.FireDepartment._id) return next();
  if(req.user.isDepartmentAdmin && req.loadedUser.FireDepartment._id === req.user.FireDepartment._id) return next();

  else throw new ForbiddenError('User is not authorized to perform this function');
}

/**
 * Authentication callback
 */
export function authCallback(req, res) {
  res.redirect('/');
}

export async function loadUser(req, res, next, id) {
  const user = await User.find({
    where: {
      _id: id
    },
    include: [FireDepartment]
  });

  if(!user) {
    throw new NotFoundError('User not found');
  }

  req.loadedUser = user;
  next();
}

import _ from 'lodash';
import { Promise } from 'bluebird';
import { sequelize, Workspace, FireDepartment, UserWorkspace, User} from '../../sqldb';

import {
  seedKibanaTemplate,
  seedKibanaConfig,
  seedKibanaDashboards,
  seedKibanaIndexPatterns,
  seedKibanaVisualizations,
} from '../../fixtures';
import { BadRequestError, ForbiddenError } from '../../util/error';

const seedTemplate = Promise.promisify(seedKibanaTemplate);
const seedIndexPatterns = Promise.promisify(seedKibanaIndexPatterns);
const seedConfig = Promise.promisify(seedKibanaConfig);
const seedVisualizations = Promise.promisify(seedKibanaVisualizations);
const seedDashboards = Promise.promisify(seedKibanaDashboards);

export async function loadFixtures(req, res) {
  const options = {
    force: true
  };

  let fire_department = req.fireDepartment.get();
  const locals = {
    fire_department,
    kibana: { tenancy: `.kibana_${fire_department.firecares_id}_${req.wkspace.slug}` }
  };

  await seedTemplate(options, locals);
  await seedIndexPatterns(options, locals);
  await seedConfig(options, locals);

  if(req.query.seedVisualizations) await seedVisualizations(options, locals);
  if(req.query.seedDashboards) await seedDashboards(options, locals);

  res.json(req.wkspace).send();
}

export async function create(req, res, next) {
  const workspace = Workspace.build({
    name: req.body.name,
    description: req.body.description,
    color: req.body.color,
  });

  // force this all so user cannot overwrite in request
  workspace.setDataValue('fire_department__id', req.user.FireDepartment._id);
  let wkspace;
  await sequelize.transaction(async t => {
    const saved = await workspace.save({ transaction: t });

    wkspace = saved;
    // make the user an owner
    let permissionPromises = [UserWorkspace.create({
      user__id: req.user._id,
      workspace__id: saved._id,
      permission: 'admin',
      is_owner: true,
    }, { transaction: t })];

    // update any other user permissions
    req.body.users.forEach(u => {
      if(u._id !== req.user._id && (u.is_owner || u.permission)) {
        permissionPromises.push(UserWorkspace.create({
          user__id: u._id,
          workspace__id: saved._id,
          permission: u.permission,
          is_owner: u.is_owner,
        }, { transaction: t }));
      }
    });

    await Promise.all(permissionPromises);
  });

  req.wkspace = wkspace;
  next();
}

export async function edit(req, res) {
  await sequelize.transaction(async t => {
    const calls = [];
    calls.push(Workspace.update({
      name: req.body.name,
      description: req.body.description,
      color: req.body.color,
    }, {
      where: {
        _id: req.params.id
      },
      transaction: t
    }));

    // update permissions
    req.body.users.forEach(u => {
      calls.push(UserWorkspace
        .findOne({
          where: {
            workspace__id: req.params.id,
            user__id: u._id,
          }
        }, {
          transaction: t
        })
        .then(userWorkspace => {
          if(userWorkspace) {
            return userWorkspace.update({
              permission: u.permission,
              is_owner: u.is_owner,
            }, { transaction: t });
          } else {
            return UserWorkspace.create({
              user__id: u._id,
              workspace__id: req.params.id,
              permission: u.permission,
              is_owner: u.is_owner,
            }, { transaction: t });
          }
        }));
    });

    await Promise.all(calls);
  });
  res.status(204).send();
}

export async function get(req, res) {
  let workspace = req.workspace.get();

  // cleanup api call
  let users = workspace.Users;
  delete workspace.FireDepartment;
  delete workspace.Users;
  workspace.users = [];

  users.forEach((u) => {
    if (!u.isAdmin && !u.isGlobal && u.isDashboardUser)
    workspace.users.push({
      _id: u._id,
      email: u.email,
      username: u.username,
      is_owner: _.get(u, 'UserWorkspace.is_owner') || false,
      permission: _.get(u, 'UserWorkspace.permission') || null,
    })
  })

  res.json(req.workspace);
}

export async function markAsDeleted(req, res) {
  // prevent deleting default workspace
  const wkspace = await Workspace.findOne({
    where: {
      _id: req.params.id
    }
  });

  if(wkspace.slug === 'default') throw new ForbiddenError('Deleting the default workspace is forbidden');

  await Workspace.update({
    is_deleted: true
  }, {
    where: {
      _id: req.params.id
    }
  });

  res.status(204).send();
}

export async function getAll(req, res) {
  // Get all workspaces that user is privy to
  let include = [];
  if (!req.user.isGlobal) include = [{
    model: User,
    where: { _id: req.user._id },
    attributes: []
  }];

  const workspaces = await Workspace.findAll({
    where: {
      fire_department__id: req.user.FireDepartment._id,
      is_deleted: false,
    },
    include,
  });

  // now fetch each workpace, including users
  if(!workspaces || workspaces.length === 0) return res.json([]).send();

  const result = await Workspace.findAll({
    where: {
      fire_department__id: req.user.FireDepartment._id,
      _id: _.map(workspaces, w => w._id),
    },
    include: [{
      model: User,
      attributes: [ 'username', 'email', 'role' ]
    }]
  });

  res.json(result);
}

export async function updateUser(req, res) {
  if(_.isNil(req.params.id)) throw new BadRequestError('req.params.id not set');
  if(_.isNil(req.params.userId)) throw new BadRequestError('req.params.userId not set');
  if(_.isNil(req.body.user.permission)) throw new BadRequestError('req.body.user.permission not set');

  const userWorkspace = await UserWorkspace.findOne({
    where: {
      workspace__id: req.params.id,
      user__id: req.params.userId,
    }
  });

  if(userWorkspace) {
    await userWorkspace.update({
      permission: req.body.user.permission
    });
  } else {
    await UserWorkspace.create({
      user__id: req.params.userId,
      workspace__id: req.params.id,
      permission: req.body.user.permission,
      is_owner: false,
    });
  }

  res.status(204).send();
}

export async function updateOwner(req, res) {
  if(_.isNil(req.params.id)) throw new BadRequestError('req.params.id not set');
  if(_.isNil(req.params.userId)) throw new BadRequestError('req.params.userId not set');
  if(_.isNil(req.body.user.is_owner)) throw new BadRequestError('req.body.user.is_owner not set');

  const userWorkspace = await UserWorkspace.findOne({
    where: {
      workspace__id: req.params.id,
      user__id: req.params.userId,
    }
  });

  if(userWorkspace) {
    await userWorkspace.update({
      is_owner: req.body.user.is_owner
    });
  } else {
    await UserWorkspace.create({
      user__id: req.params.userId,
      workspace__id: req.params.id,
      permission: 'admin',
      is_owner: true,
    });
  }

  res.status(204).send();
}

export async function revokeUser(req, res) {
  if(_.isNil(req.params.id)) throw new BadRequestError('req.params.id not set');
  if(_.isNil(req.params.userId)) throw new BadRequestError('req.params.userId not set');

  const userWorkspace = await UserWorkspace.findOne({
    where: {
      workspace__id: req.params.id,
      user__id: req.params.userId,
    }
  });

  if(userWorkspace) {
    await userWorkspace.update({
      permission: null,
    });
  } else {
    await UserWorkspace.create({
      user__id: req.params.userId,
      workspace__id: req.params.id,
      permission: null,
      is_owner: false,
    });
  }

  res.status(204).send();
}

export async function revokeOwner(req, res) {
  if(_.isNil(req.params.id)) throw new BadRequestError('req.params.id not set');
  if(_.isNil(req.params.userId)) throw new BadRequestError('req.params.userId not set');

  const userWorkspace = await UserWorkspace.findOne({
    where: {
      workspace__id: req.params.id,
      user__id: req.params.userId,
    }
  });

  if(userWorkspace) {
    await userWorkspace.update({
      is_owner: false,
    });
  } else {
    await UserWorkspace.create({
      user__id: req.params.userId,
      workspace__id: req.params.id,
      permission: null,
      is_owner: false,
    });
  }

  res.status(204).send();
}

export async function hasWorkspaceAccess(req, res, next) {
  if(_.isNil(req.params.id)) throw new BadRequestError('req.params.id not set');

  if (req.user.isGlobal) return next();

  const result = await UserWorkspace.find({
    where: {
      workspace__id: req.params.id,
      user__id: req.user._id,
    },
  });

  if(_.isEmpty(result) || _.isNil(result)) throw new BadRequestError('User does not have access to this workspace');

  req.userWorkspace = result;
  return next();
}

export async function hasWorkspaceOwnerAccess(req, res, next) {
  if(_.isNil(req.params.id)) throw new BadRequestError('req.params.id not set');

  if (req.user.isAdmin) return next();

  const result = await UserWorkspace.find({
    where: {
      workspace__id: req.params.id,
      user__id: req.user._id,
      is_owner: true,
    },
  });

  if(_.isEmpty(result) || _.isNil(result)) throw new BadRequestError('User does not have owner access to this workspace');

  return next();
}

export async function load(req, res, next) {
  const result = await Workspace.find({
    where: {
      _id: req.params.id,
      is_deleted: false,
    },
    include: [{
      model: User,
      attributes: ['_id', 'username', 'email', 'role']
    }, {
      model: FireDepartment,
      attributes: ['firecares_id']
    }]
  });

  req.workspace = result;
  next();
}


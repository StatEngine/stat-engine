import _ from 'lodash';
import { Promise } from 'bluebird';
import { sequelize, Workspace, FireDepartment, UserWorkspace, User} from '../../sqldb';


import {
  seedKibanaTemplate,
  seedKibanaConfig,
  seedKibanaDashboards,
  seedKibanaIndexPatterns,
  seedKibanaVisualizations,
} from '@statengine/se-fixtures';

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
  const workspace = Workspace.build(req.body);

  // force this all so user cannot overwrite in request
  workspace.setDataValue('fire_department__id', req.user.FireDepartment._id);
  let wkspace;
  await sequelize.transaction(t =>
    // chain all your queries here. make sure you return them.
    workspace.save({transaction: t}).then(saved => {
      wkspace = saved;
      return saved.addUser(req.user, { transaction: t, is_owner: true, permission: 'admin' });
    })
  ).then(() => {
    req.wkspace = wkspace;
    next();
  });
}

export async function edit(req, res) {
  return await Workspace.update({
    name: req.body.name,
    description: req.body.description,
    color: req.body.color,
  }, {
    where: {
      _id: req.params.id
    },
    returning: true,
  }).then(result => {
    res.json(result[1][0]);
  });
}

export async function get(req, res) {
  res.json(req.workspace);
}

export async function markAsDeleted(req, res) {
  // prevent deleting default workspace
  const wkspace = await Workspace.findOne({
    where: {
      _id: req.params.id
    }
  });

  if(wkspace.slug === 'default') return res.send(500);

  return await Workspace.update({
    is_deleted: true
  }, {
    where: {
      _id: req.params.id
    }}).then(() => {
    res.status(204).send();
  });
}

export async function getAll(req, res) {
  // Get all workspaces that user is privy to
  let include = [];
  if (!req.user.isGlobal) include = [{
    model: User,
    where: { _id: req.user._id },
    attributes: []
  }];

  return Workspace.findAll({
    where: {
      fire_department__id: req.user.FireDepartment._id,
      is_deleted: false,
    },
    include,
  })
    .then(workspaces => {
      // now fetch each workpace, including users
      if(!workspaces || workspaces.length === 0) return res.json([]).send();
      return Workspace.findAll({
        where: {
          fire_department__id: req.user.FireDepartment._id,
          _id: _.map(workspaces, w => w._id),
        },
        include: [{
          model: User,
          attributes: [ 'username', 'email', 'role' ]
        }]
      }).then(result => res.json(result));
    });
}

export async function updateUser(req, res) {
  if(_.isNil(req.params.id)) throw new Error('req.params.id not set');
  if(_.isNil(req.params.userId)) throw new Error('req.params.userId not set');
  if(_.isNil(req.body.user.permission)) throw new Error('req.body.user.permission not set');

  return await UserWorkspace
    .findOne({
      where: {
        workspace__id: req.params.id,
        user__id: req.params.userId,
      }
    })
    .then(userWorkspace => {
      if(userWorkspace) {
        return userWorkspace.update({
          permission: req.body.user.permission
        });
      } else {
        return UserWorkspace.create({
          user__id: req.params.userId,
          workspace__id: req.params.id,
          permission: req.body.user.permission,
          is_owner: false,
        });
      }
    })
    .then(() => res.status(204).send());
}

export async function updateOwner(req, res) {
  if(_.isNil(req.params.id)) throw new Error('req.params.id not set');
  if(_.isNil(req.params.userId)) throw new Error('req.params.userId not set');
  if(_.isNil(req.body.user.is_owner)) throw new Error('req.body.user.is_owner not set');

  return await UserWorkspace
    .findOne({
      where: {
        workspace__id: req.params.id,
        user__id: req.params.userId,
      }
    })
    .then(userWorkspace => {
      if(userWorkspace) {
        return userWorkspace.update({
          is_owner: req.body.user.is_owner
        });
      } else {
        return UserWorkspace.create({
          user__id: req.params.userId,
          workspace__id: req.params.id,
          permission: 'admin',
          is_owner: true,
        });
      }
    })
    .then(() => res.status(204).send())
}

export async function revokeUser(req, res) {
  if(_.isNil(req.params.id)) throw new Error('req.params.id not set');
  if(_.isNil(req.params.userId)) throw new Error('req.params.userId not set');

  return await UserWorkspace
    .findOne({
      where: {
        workspace__id: req.params.id,
        user__id: req.params.userId,
      }
    })
    .then(userWorkspace => {
      if(userWorkspace) {
        return userWorkspace.update({
          permission: null,
        });
      } else {
        return UserWorkspace.create({
          user__id: req.params.userId,
          workspace__id: req.params.id,
          permission: null,
          is_owner: false,
        });
      }
    })
    .then(() => res.status(204).send())
}

export async function revokeOwner(req, res) {
  if(_.isNil(req.params.id)) throw new Error('req.params.id not set');
  if(_.isNil(req.params.userId)) throw new Error('req.params.userId not set');

  return await UserWorkspace
    .findOne({
      where: {
        workspace__id: req.params.id,
        user__id: req.params.userId,
      }
    })
    .then(userWorkspace => {
      if(userWorkspace) {
        return userWorkspace.update({
          is_owner: false,
        });
      } else {
        return UserWorkspace.create({
          user__id: req.params.userId,
          workspace__id: req.params.id,
          permission: null,
          is_owner: false,
        });
      }
    })
    .then(() => res.status(204).send())
}

export async function hasWorkspaceAccess(req, res, next) {
  if(_.isNil(req.params.id)) return next(new Error('req.params.id not set'));

  if (req.user.isGlobal) return next();
  return UserWorkspace.find({
    where: {
      workspace__id: req.params.id,
      user__id: req.user._id,
    },
  })
    .then(result => {
      if(_.isEmpty(result) || _.isNil(result)) return next(new Error('User does not have access to this workspace'));
      req.userWorkspace = result;
      return next();
    })
}

export async function hasWorkspaceOwnerAccess(req, res, next) {
  if(_.isNil(req.params.id)) return next(new Error('req.params.id not set'));

  if (req.user.isAdmin) return next();
  return UserWorkspace.find({
    where: {
      workspace__id: req.params.id,
      user__id: req.user._id,
      is_owner: true,
    },
  })
    .then(result => {
      if(_.isEmpty(result) || _.isNil(result)) return next(new Error('User does not have owner access to this workspace'));
      return next();
    })
}

export async function load(req, res, next) {
  return Workspace.find({
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
  })
    .then(result => {
      req.workspace = result;
      next();
    })
}


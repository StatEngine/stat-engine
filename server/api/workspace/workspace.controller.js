import _ from 'lodash';
import { sequelize, Workspace, FireDepartment, UserWorkspace, User} from '../../sqldb';

import { validationError, handleError } from '../../util/error';


export async function create(req, res) {
  const workspace = Workspace.build(req.body);

  // force this all so user cannot overwrite in request
  workspace.setDataValue('fire_department__id', req.user.FireDepartment._id);
  let wkspace;
  await sequelize.transaction(t => {
    // chain all your queries here. make sure you return them.
    return workspace.save({transaction: t}).then(saved => {
      wkspace = saved;
      return saved.addUser(req.user, { transaction: t, is_owner: true, permission: 'admin' });
    });
  }).then(result => {
    res.json(wkspace);
  }).catch(err => {
    handleError(res);
  });
}

export async function edit(req, res) {
  return await Workspace.update({
    name: req.body.name,
    description: req.body.description,
    color: req.body.color,
  }, {
    returning: true,
    where: {
      _id: req.params.id
  }}).then(result => {
    res.json(result[1][0]);
  }).catch(err => {
    handleError(res);
  });
}

export async function get(req, res) {
  return Workspace.find({
    where: { _id: req.params.id },
    include: [{
      model: User,
      attributes: ['_id', 'username', 'email', 'role']
    }]
  })
  .then(result => {
    res.json(result);
  }).catch(err => {
    handleError(res);
  });
}

export async function getAll(req, res) {
  // Get all workspaces that user is privy to
  return Workspace.findAll({
    where: {
      fire_department__id: req.user.FireDepartment._id,
    },
    include: [{
      model: User,
      where: { _id: req.user._id },
      attributes: []
    }]
  })
  .then(workspaces => {
    // now fetch each workpace, including users
    if (!workspaces || workspaces.length === 0) return res.json([]).send();

    return Workspace.findAll({
      where: {
        fire_department__id: req.user.FireDepartment._id,
        _id: _.map(workspaces, w => w._id),
      },
      include: [{
        model: User,
        attributes: [ 'username', 'email', ]
      }]
    }).then(result => res.json(result))
  }).catch(err => {
    console.dir(err);
    handleError(res);
  });
}

export async function updateUser(req, res) {
  if(_.isNil(req.params.id)) throw new Error('req.params.id not set');
  if(_.isNil(req.params.userId)) throw new Error('req.params.userId not set');
  if(_.isNil(req.body.user.permission)) throw new Error('req.body.user.permission not set');

  console.dir('finding one')
  return await UserWorkspace
    .findOne({
      where: {
        workspace__id: req.params.id,
        user__id: req.params.userId,
      }
    })
    .then((userWorkspace) => {
      if(userWorkspace) return userWorkspace.update({
        permission: req.body.user.permission
      });
      else return UserWorkspace.create({
        user__id: req.params.userId,
        workspace__id: req.params.id,
        permission: req.body.user.permission,
        is_owner: false,
      });
    })
    .then(() => res.status(204).send())
    .catch((err) => handleError(res));
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
    .then((userWorkspace) => {
      if(userWorkspace) return userWorkspace.update({
        is_owner: req.body.user.is_owner
      });
      else return UserWorkspace.create({
        user__id: req.params.userId,
        workspace__id: req.params.id,
        permission: 'admin',
        is_owner: true,
      });
    })
    .then(() => res.status(204).send())
    .catch((err) => handleError(res));
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
    .then((userWorkspace) => {
      if(userWorkspace) return userWorkspace.update({
        permission: null,
      });
      else return UserWorkspace.create({
        user__id: req.params.userId,
        workspace__id: req.params.id,
        permission: null,
        is_owner: false,
      });
    })
    .then(() => res.status(204).send())
    .catch((err) => handleError(res));
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
    .then((userWorkspace) => {
      if(userWorkspace) return userWorkspace.update({
        is_owner: false,
      });
      else return UserWorkspace.create({
        user__id: req.params.userId,
        workspace__id: req.params.id,
        permission: null,
        is_owner: false,
      });
    })
    .then(() => res.status(204).send())
    .catch((err) => handleError(res));
}

export async function hasWorkspaceAccess(req, res, next) {
  if (_.isNil(req.params.id)) return next(new Error('req.params.id not set'));

  return UserWorkspace.find({
    where: {
      workspace__id: req.params.id,
      user__id: req.user._id,
    },
  })
  .then(result => {
    if (_.isEmpty(result) || _.isNil(result)) return next(new Error('User does not have access to this workspace'));
    return next();
  }).catch(err => {
    return next(err);
  });
}

export async function hasWorkspaceOwnerAccess(req, res, next) {
  if (_.isNil(req.params.id)) return next(new Error('req.params.id not set'));

  return UserWorkspace.find({
    where: {
      workspace__id: req.params.id,
      user__id: req.user._id,
      is_owner: true,
    },
  })
  .then(result => {
    if (_.isEmpty(result) || _.isNil(result)) return next(new Error('User does not have owner access to this workspace'));
    return next();
  }).catch(err => {
    return next(err);
  });
}


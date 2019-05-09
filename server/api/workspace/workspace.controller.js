import _ from 'lodash';
import { sequelize, Workspace, FireDepartment, UserWorkspace, User} from '../../sqldb';

import { validationError, handleError } from '../../util/error';


export async function create(req, res) {
  const workspace = Workspace.build(req.body);

  // force this all so user cannot overwrite in request
  workspace.setDataValue('fire_department__id', req.user.FireDepartment._id);
  await sequelize.transaction(t => {
    // chain all your queries here. make sure you return them.
    return workspace.save({transaction: t}).then(saved => {
      return saved.addUser(req.user, { transaction: t, is_owner: true, permission: 'admin' });
    });
  }).then(result => {
    res.status(204).send();
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
      attributes: ['username', 'email', 'role']
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
    if (!workspaces || workspaces.length === 0) return res.status(404).send();

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


// TODO
export async function updateUsers(req, res) {
  await sequelize.transaction(t => {
    return Workspace.find({
      where: { _id: req.params.id },
      include: [{
        model: User,
        attributes: ['username', 'email', 'role']
      }]
    }).then(workspace => {
      console.dir(workspace.getUsers());
      console.dir(req.body.users);

      return workspace;
      //return saved.addUser(req.user, { transaction: t, is_owner: true, permission: 'admin' });
    });
  }).then(result => {
    res.status(204).send();
  }).catch(err => {
    handleError(res);
  });
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
    console.dir(result);
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
    console.dir(result);
    if (_.isEmpty(result) || _.isNil(result)) return next(new Error('User does not have owner access to this workspace'));
    return next();
  }).catch(err => {
    return next(err);
  });
}


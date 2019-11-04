import _ from 'lodash';
import jwt from 'jsonwebtoken';
import config from '../../config/environment';

import {
  App,
  AppInstallation,
  FireDepartment,
} from '../../sqldb';
import { BadRequestError, NotFoundError } from '../../util/error';

export async function search(req, res) {
  if(_.isEmpty(req.user.client_id)) throw new BadRequestError('User client_id is required');

  const appInstallations = await AppInstallation.findAll({
    include: [{
      model: App,
      attributes: [
        '_id',
        'name',
        'slug',
      ],
      where: { client_id: req.user.client_id }
    }, {
      model: FireDepartment,
      attributes: [
        '_id',
        'fd_id',
        'name',
        'state',
        'firecares_id',
        'timezone',
      ]
    }]
  });

  res.json(appInstallations);
}

const EXPIRES_IN = 60 * 60;
export async function generateToken(req, res) {
  if(_.isEmpty(req.user.client_id)) throw new BadRequestError('User client_id is required');
  if(_.isEmpty(req.params.installationId)) throw new BadRequestError('Param "installationId" is required');

  const installation = await AppInstallation.find({
    where: {
      _id: req.params.installationId
    },
    include: [{
      model: App,
      where: { client_id: req.user.client_id }
    }, {
      model: FireDepartment,
      attributes: [
        '_id',
        'fd_id',
        'name',
        'state',
        'firecares_id',
        'timezone',
      ]
    }]
  });

  if(_.isNil(installation)) throw new NotFoundError('App installation not found');

  return res.json({
    token_type: 'Bearer',
    access_token: jwt.sign({
      roles: ['app'],
      permissions: installation.App.permissions || [],
      FireDepartment: installation.FireDepartment.get(),
    }, config.oauth.secret, { expiresIn: EXPIRES_IN }),
    expires_in: EXPIRES_IN
  });
}

export async function get(req, res) {
  if(_.isEmpty(req.user.client_id)) throw new BadRequestError('User client_id is required');
  if(_.isEmpty(req.params.installationId)) throw new BadRequestError('Param "installationId" is required');

  const installation = await AppInstallation.find({
    where: {
      _id: req.params.installationId

    },
    include: [{
      model: App,
      where: { client_id: req.user.client_id },
      attributes: [
        '_id',
        'slug',
      ],
    }]
  });

  if(_.isNil(installation)) throw new NotFoundError('App installation not found');

  return res.json(installation);
}

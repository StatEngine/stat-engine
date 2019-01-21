import _ from 'lodash';
import jwt from 'jsonwebtoken';
import config from '../../config/environment';

import {
  App,
  AppInstallation,
  FireDepartment,
} from '../../sqldb';

export function search(req, res) {
  if(_.isEmpty(req.user.client_id)) return res.send(404);

  return AppInstallation.findAll({
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
  })
    .then(appInstallations => res.json(appInstallations))
    .catch(e => {
      console.error(e);
      res.sendStatus(500);
    })
}

const EXPIRES_IN = 60 * 60;
export function generateToken(req, res) {
  if(_.isEmpty(req.user.client_id)) return res.send(404);
  if(_.isEmpty(req.params.installationId)) return res.send(404);

  AppInstallation.find({
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
  })
    .then(installation => {
      if(_.isNil(installation)) return res.sendStatus(404);
      return res.json({
        token_type: 'Bearer',
        access_token: jwt.sign({
          roles: ['app'],
          permissions: installation.App.permissions || [],
          FireDepartment: installation.FireDepartment.get(),
        }, config.oauth.secret, { expiresIn: EXPIRES_IN }),
        expires_in: EXPIRES_IN
      })
    })
    .catch(e => {
      console.error(e);
      res.sendStatus(500);
    })
}

export function get(req, res) {
  if(_.isEmpty(req.user.client_id)) return res.send(404);
  if(_.isEmpty(req.params.installationId)) return res.send(404);

  AppInstallation.find({
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
  })
    .then(installation => {
      if(_.isNil(installation)) return res.sendStatus(404);
      return res.json(installation)
    })
    .catch(e => {
      console.error(e);
      res.sendStatus(500);
    });
}
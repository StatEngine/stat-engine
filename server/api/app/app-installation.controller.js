import _ from 'lodash';
import jwt from 'jsonwebtoken';

import {
  App,
  AppInstallation,
  FireDepartment,
} from '../../sqldb';

export function search(req, res) {
  return AppInstallation.findAll({
    include: [{
      model: App,
      where: { client_id: req.user.client_id }
    }, {
      model: FireDepartment,
    }]
  })
    .then(appInstallations => res.json(appInstallations));
}

const expires_in = 60*60;
export function generateToken(req, res) {
  AppInstallation.find({
    where: {
      _id: req.params.installationId
    },
    include: [{
      model: App,
      where: { client_id: req.user.client_id }
    }, {
      model: FireDepartment,
    }]
  })
    .then(installation => res.json({
      token_type: 'Bearer',
      access_token: jwt.sign({ roles: ['user'], FireDepartment: installation.FireDepartment.get() }, 'top_secret', { expiresIn: expires_in }),
      expires_in
    }))
}

export function get(req, res) {
  AppInstallation.find({
    where: {
      _id: req.params.installationId
    },
    include: [{
      model: App,
      where: { client_id: req.user.client_id }
    }]
  })
    .then(installation => res.json(installation));
}
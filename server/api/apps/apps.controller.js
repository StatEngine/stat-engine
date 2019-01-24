import 'babel-polyfill';

import _ from 'lodash';
import config from '../../config/environment';

import {
  App,
  AppInstallation,
} from '../../sqldb';

export function search(req, res) {
  return App.findAll({
    attributes: [
      '_id',
      'name',
      'slug',
      'description',
      'short_description',
      'features',
      'tags',
      'permissions',
      'featured',
      'hidden',
    ],
  })
    .then(apps => res.json(apps))
    .catch(e => {
      console.error(e);
      res.sendStatus(500);
    })
}

export function get(req, res) {
  if(_.isEmpty(req.params.id)) return res.send(500);

  return App.find({
    where: {
      _id: req.params.id
    },
    attributes: [
      '_id',
      'name',
      'slug',
      'description',
      'short_description',
      'features',
      'tags',
      'permissions',
      'featured',
      'hidden',
    ],
  })
    .then(app => res.json(app))
    .catch(e => {
      console.error(e);
      res.sendStatus(500);
    });
}

export const install = async(req, res) => {
  if(_.isEmpty(req.params.id)) return res.send(500);

  const existing = await AppInstallation.findOne({
    where: {
      app__id: req.params.id,
      fire_department__id: req.user.FireDepartment._id
    },
  });
  if(existing) return res.sendStatus(500);

  return AppInstallation.create({
    app__id: req.params.id,
    fire_department__id: req.user.FireDepartment._id,
  })
    .then(() => {
      res.sendStatus(204);
    })
    .catch(e => {
      console.error(e);
      res.sendStatus(500);
    });
}


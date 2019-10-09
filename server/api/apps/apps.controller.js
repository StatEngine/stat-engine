import 'babel-polyfill';

import _ from 'lodash';

import {
  App,
  AppInstallation,
} from '../../sqldb';
import { BadRequestError, NotFoundError } from '../../util/error';

export function search(req, res) {
  return App.findAll({
    attributes: [
      '_id',
      'name',
      'slug',
      'description',
      'short_description',
      'features',
      'categories',
      'permissions',
      'featured',
      'hidden',
    ],
  })
    .then(apps => res.json(apps));
}

export function get(req, res) {
  if(_.isEmpty(req.params.id)) throw new BadRequestError('Param "id" is required');

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
      'categories',
      'permissions',
      'featured',
      'hidden',
    ],
  })
    .then(app => res.json(app));
}

export const install = async(req, res) => {
  if(_.isEmpty(req.params.id)) throw new BadRequestError('Param "id" is required');

  const existing = await AppInstallation.findOne({
    where: {
      app__id: req.params.id,
      fire_department__id: req.user.FireDepartment._id
    },
  });
  if(existing) throw new BadRequestError('App installation already exists');

  return AppInstallation.create({
    app__id: req.params.id,
    fire_department__id: req.user.FireDepartment._id,
  })
    .then((appInstall) => {
      res.json(appInstall);
    });
};


export const uninstall = async(req, res) => {
  if(_.isEmpty(req.params.id)) throw new BadRequestError('Param "id" is required');

  const existing = await AppInstallation.findOne({
    where: {
      app__id: req.params.id,
      fire_department__id: req.user.FireDepartment._id
    },
  });
  if(!existing) throw new NotFoundError('App installation not found');

  return existing.destroy()
    .then(() => {
      res.json({});
    })
};

export const status = async(req, res) => {
  if(_.isEmpty(req.params.id)) throw new BadRequestError('Param "id" is required');

  await AppInstallation.findOne({
    where: {
      app__id: req.params.id,
      fire_department__id: req.user.FireDepartment._id
    },
  })
  .then((appInstall) => res.json(appInstall))
};

import 'babel-polyfill';

import _ from 'lodash';

import {
  App,
  AppInstallation,
} from '../../sqldb';
import { BadRequestError, NotFoundError } from '../../util/error';

export async function search(req, res) {
  const apps = await App.findAll({
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
  });

  res.json(apps);
}

export async function get(req, res) {
  if(_.isEmpty(req.params.id)) throw new BadRequestError('Param "id" is required');

  const app = await App.find({
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
  });

  res.json(app);
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

  const appInstall = await AppInstallation.create({
    app__id: req.params.id,
    fire_department__id: req.user.FireDepartment._id,
  });

  res.json(appInstall);
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

  await existing.destroy();

  res.json({});
};

export const status = async(req, res) => {
  if(_.isEmpty(req.params.id)) throw new BadRequestError('Param "id" is required');

  const appInstall = await AppInstallation.findOne({
    where: {
      app__id: req.params.id,
      fire_department__id: req.user.FireDepartment._id
    },
  });

  res.json(appInstall);
};

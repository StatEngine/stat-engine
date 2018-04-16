'use strict';

import {Router} from 'express';
import bodyParser from 'body-parser';

import * as auth from '../../auth/auth.service';

import * as controller from './fire-department.controller';

const rawParser = bodyParser.raw({
  inflate: true,
  limit: '15mb',
  type: 'application/octet-stream',
});

const router = new Router();

router.get(
  '/',
  auth.isApiAuthenticated,
  auth.hasRole('user'),
  controller.search
);

router.get(
  '/:id',
  auth.isApiAuthenticated,
  auth.hasRole('user'),
  controller.get
);

router.post(
  '/',
  auth.isApiAuthenticated,
  bodyParser.json(),
  auth.hasRole('admin'),
  controller.create
);

router.put(
  '/:id',
  auth.isApiAuthenticated,
  bodyParser.json(),
  auth.hasRole('admin'),
  controller.edit
);

router.get(
  '/:id/:type/data-quality',
  auth.isApiAuthenticated,
  auth.hasRole('user'),
  controller.hasAdminPermission,
  controller.dataQuality
);

//  need to think about standardizing this to use id instead of Firecares ID!
router.put(
  '/:firecaresId/:type/:id',
  auth.isApiAuthenticated,
  auth.hasRole('ingest'),
  auth.hasFireDepartment,
  auth.belongsToFireDepartment,
  rawParser,
  controller.queueIngest
);

router.param('id', controller.loadFireDepartment);

module.exports = router;

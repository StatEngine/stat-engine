'use strict';

import {Router} from 'express';
import bodyParser from 'body-parser';

import * as auth from '../../auth/auth.service';

import * as controller from './fire-department.controller';

const router = new Router();

router.get(
  '/',
  controller.search
);

router.get(
  '/:id',
  auth.isApiAuthenticated,
  auth.hasRole('user'),
  controller.get
);

router.post(
  '/fixtures/:fixtureType',
  auth.isApiAuthenticated,
  bodyParser.json(),
  auth.hasRole('admin'),
  controller.multiFixtures
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

router.get(
  '/:id/:type/nfpa',
  auth.isApiAuthenticated,
  auth.hasRole('user'),
  controller.hasReadPermission,
  controller.nfpa
);

router.post(
  '/:id/fixtures/:fixtureType',
  auth.isApiAuthenticated,
  bodyParser.json(),
  auth.hasRole('admin'),
  controller.fixtures
);

router.post(
  '/:id/:type',
  auth.isApiAuthenticated,
  auth.hasRole('ingest'),
  controller.hasIngestPermission,
  bodyParser.json(),
  controller.queueIngest
);

router.param('id', controller.loadFireDepartment);
router.param('fixtureType', controller.fixtureType);

module.exports = router;

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
  '/:firecaresId',
  auth.isApiAuthenticated,
  auth.hasRole('user'),
  controller.show
);

router.get(
  '/:firecaresId/:type/data-quality',
  auth.isApiAuthenticated,
  auth.hasRole('user'),
  auth.hasFireDepartment,
  auth.belongsToFireDepartment,
  controller.dataQuality
);

router.put(
  '/:firecaresId/:type/:id',
  auth.isApiAuthenticated,
  auth.hasRole('ingest'),
  auth.hasFireDepartment,
  auth.belongsToFireDepartment,
  rawParser,
  controller.queueIngest
);

module.exports = router;

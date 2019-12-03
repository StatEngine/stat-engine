'use strict';

import { Router } from 'express';
import bodyParser from 'body-parser';

import * as auth from '../../auth/auth.service';
import * as controller from './extension-configuration.controller';

const router = new Router();

router.get(
  '/',
  auth.isApiAuthenticated,
  auth.hasRole('user'),
  auth.hasFireDepartment,
  auth.hasActiveSubscription(),
  controller.search
);

router.get(
  '/:id',
  auth.isApiAuthenticated,
  auth.hasRole('user'),
  auth.hasFireDepartment,
  auth.hasActiveSubscription(),
  controller.get
);

router.post(
  '/',
  auth.isApiAuthenticated,
  auth.hasRole('user'),
  auth.hasFireDepartment,
  auth.hasActiveSubscription(),
  bodyParser.json(),
  controller.create
);

router.put(
  '/:id',
  auth.isApiAuthenticated,
  auth.hasRole('user'),
  auth.hasFireDepartment,
  auth.hasActiveSubscription(),
  bodyParser.json(),
  controller.update
);

module.exports = router;

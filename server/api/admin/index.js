'use strict';

import { Router } from 'express';
import * as controller from './admin.controller';
import * as auth from '../../auth/auth.service';

const router = new Router();

router.post(
  '/addFixtureTemplatesToDatabase',
  auth.isApiAuthenticated,
  auth.hasRole('admin'),
  controller.addFixtureTemplatesToDatabase,
);

router.post(
  '/refreshAllSubscriptions',
  auth.isApiAuthenticated,
  auth.hasRole('admin'),
  controller.refreshAllSubscriptions,
);

module.exports = router;


'use strict';

import { Router } from 'express';

import * as auth from '../../auth/auth.service';
import * as controller from './apps.controller';

const router = new Router();

router.get(
  '/',
  auth.isApiAuthenticated,
  auth.hasRole('user'),
  auth.hasFireDepartment,
  auth.hasActiveSubscription,
  controller.search
);

router.get(
  '/:id',
  auth.isApiAuthenticated,
  auth.hasRole('user'),
  auth.hasFireDepartment,
  auth.hasActiveSubscription,
  controller.get
);

router.get(
  '/:id/status',
  auth.isApiAuthenticated,
  auth.hasRole('user'),
  auth.hasFireDepartment,
  auth.hasActiveSubscription,
  controller.status
);

router.post(
  '/:id/install',
  auth.isApiAuthenticated,
  auth.hasRole('department_admin'),
  auth.hasFireDepartment,
  auth.hasActiveSubscription,
  controller.install
);

router.post(
  '/:id/uninstall',
  auth.isApiAuthenticated,
  auth.hasRole('department_admin'),
  auth.hasFireDepartment,
  auth.hasActiveSubscription,
  controller.uninstall
);

module.exports = router;

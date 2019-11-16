'use strict';

import { Router } from 'express';

import * as auth from '../../auth/auth.service';
import * as controller from './incident.controller';

const router = new Router();

router.get(
  '/active',
  auth.isApiAuthenticated,
  auth.hasRole('user'),
  auth.hasFireDepartment,
  auth.hasActiveSubscription(),
  controller.getActiveIncidents,
);

router.get(
  '/top',
  auth.isApiAuthenticated,
  auth.hasRole('user'),
  auth.hasFireDepartment,
  auth.hasActiveSubscription(),
  controller.getTopIncidents,
);

router.get(
  '/summary',
  auth.isApiAuthenticated,
  auth.hasRole('user'),
  auth.hasFireDepartment,
  auth.hasActiveSubscription(),
  controller.getSummary,
);

router.get(
  '/:id',
  auth.isApiAuthenticated,
  auth.hasRole('user'),
  auth.hasFireDepartment,
  auth.hasActiveSubscription(),
  controller.loadMatrix,
  controller.loadComparison,
  controller.loadConcurrent,
  controller.getIncident,
);

router.get(
  '/',
  auth.isApiAuthenticated,
  auth.hasRole('user'),
  auth.hasFireDepartment,
  auth.hasActiveSubscription(),
  controller.getIncidents,
);

router.param('id', controller.loadIncident);

module.exports = router;

export default router;

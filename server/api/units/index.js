'use strict';

import { Router } from 'express';

import * as auth from '../../auth/auth.service';
import * as controller from './unit.controller';
import * as metricsController from './unit-metrics.controller';

const router = new Router();

router.get(
  '/',
  auth.isApiAuthenticated,
  auth.hasRole('user'),
  auth.hasFireDepartment,
  controller.getUnits,
);

router.get(
  '/:id/responses',
  auth.isApiAuthenticated,
  auth.hasRole('user'),
  auth.hasFireDepartment,
  metricsController.getResponses,
);

router.get(
  '/:id/metrics',
  auth.isApiAuthenticated,
  auth.hasRole('user'),
  auth.hasFireDepartment,
  metricsController.getMetrics,
);

router.get(
  '/:id/metrics/total',
  auth.isApiAuthenticated,
  auth.hasRole('user'),
  auth.hasFireDepartment,
  metricsController.getMetricsTotal,
);

module.exports = router;

export default router;

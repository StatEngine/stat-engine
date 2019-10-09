'use strict';

import { Router } from 'express';

import * as auth from '../../auth/auth.service';
import * as controller from './unit.controller';
import * as metricsController from './unit-metrics.controller';
import { asyncMiddleware } from '../../util/async-middleware';

const router = new Router();

router.get(
  '/',
  auth.isApiAuthenticated,
  auth.hasRole('user'),
  asyncMiddleware(auth.hasFireDepartment),
  asyncMiddleware(controller.getUnits),
);

router.get(
  '/:id/responses',
  auth.isApiAuthenticated,
  auth.hasRole('user'),
  asyncMiddleware(auth.hasFireDepartment),
  asyncMiddleware(metricsController.getResponses),
);

router.get(
  '/:id/metrics',
  auth.isApiAuthenticated,
  auth.hasRole('user'),
  asyncMiddleware(auth.hasFireDepartment),
  asyncMiddleware(metricsController.getMetrics),
);

router.get(
  '/:id/metrics/total',
  auth.isApiAuthenticated,
  auth.hasRole('user'),
  asyncMiddleware(auth.hasFireDepartment),
  asyncMiddleware(metricsController.getMetricsTotal),
);


module.exports = router;

export default router;

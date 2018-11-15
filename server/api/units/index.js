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
  controller.setIndex,
  controller.buildQuery,
  controller.searchUnits,
);

router.get(
  '/:id/responses',
  auth.isApiAuthenticated,
  auth.hasRole('user'),
  auth.hasFireDepartment,
  metricsController.setApparatusIndex,
  metricsController.buildResponsesQuery,
  metricsController.runResponsesQuery,
);

router.get(
  '/:id/metrics',
  auth.isApiAuthenticated,
  auth.hasRole('user'),
  auth.hasFireDepartment,
  metricsController.setIncidentIndex,
  metricsController.buildQuery,
  metricsController.runQuery,
);

router.get(
  '/:id/metrics/total',
  auth.isApiAuthenticated,
  auth.hasRole('user'),
  auth.hasFireDepartment,
  metricsController.setApparatusIndex,
  metricsController.buildTotalQuery,
  metricsController.runTotalQuery,
);


module.exports = router;

export default router;

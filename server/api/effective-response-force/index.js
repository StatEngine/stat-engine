'use strict';

import { Router } from 'express';

import * as auth from '../../auth/auth.service';
import * as controller from './effective-response-force.controller';

const router = new Router();

router.get(
  '/formData',
  auth.isApiAuthenticated,
  auth.hasRole('user'),
  auth.hasFireDepartment,
  controller.formData,
  controller.precheck,
  );

router.get(
  '/analysis',
  auth.isApiAuthenticated,
  auth.hasRole('user'),
  auth.hasFireDepartment,
  controller.queryIncidents,
  controller.iterateIncidents,
  controller.calculatePercentiles,
  controller.findCurrentConfig,
  controller.sendResponse,
);

module.exports = router;

export default router;

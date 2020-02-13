'use strict';

import { Router } from 'express';

import * as controller from './first-arriving.controller';
import * as auth from '../../../auth/auth.service';

const router = new Router();

router.get(
  '/incident-analysis',
  auth.isApiAuthenticated,
  auth.hasRole('user'),
  auth.hasFireDepartment,
  controller.getIncidentAnalysis,
);

router.get(
  '/unit-utilization',
  auth.isApiAuthenticated,
  auth.hasRole('user'),
  auth.hasFireDepartment,
  controller.getUnitUtilization,
);

router.get(
  '/turnout-leaderboard',
  auth.isApiAuthenticated,
  auth.hasRole('user'),
  auth.hasFireDepartment,
  controller.getTurnoutLeaderboard,
);

module.exports = router;

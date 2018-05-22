'use strict';

import { Router } from 'express';

import * as auth from '../../auth/auth.service';
import * as controller from './stats.controller';

const router = new Router();

router.get(
  '/daily',
  auth.isApiAuthenticated,
  auth.hasRole('user'),
  auth.hasFireDepartment,
  controller.getDailyStats
);

router.get(
  '/shift',
  auth.isApiAuthenticated,
  auth.hasRole('user'),
  auth.hasFireDepartment,
  controller.getShiftStats
);

module.exports = router;

export default router;

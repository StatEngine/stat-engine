'use strict';

import { Router } from 'express';

import * as auth from '../../auth/auth.service';
import * as controller from './unit.controller';
import * as statsController from './unit-stats.controller';

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
  '/:id/stats',
  auth.isApiAuthenticated,
  auth.hasRole('user'),
  auth.hasFireDepartment,
  statsController.setIndex,
  statsController.buildQuery,
  statsController.getUnitStats,
);

module.exports = router;

export default router;

'use strict';

import { Router } from 'express';

import * as auth from '../../auth/auth.service';
import * as controller from './units.controller';

const router = new Router();

router.get(
  '/',
  auth.isApiAuthenticated,
  auth.hasRole('user'),
  auth.hasFireDepartment,
  controller.getUnits,
);

router.get(
  '/stats',
  auth.isApiAuthenticated,
  auth.hasRole('user'),
  auth.hasFireDepartment,
  controller.getUnitStats,
);

module.exports = router;

export default router;
